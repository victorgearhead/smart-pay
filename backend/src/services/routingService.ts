type GatewayName = 'Stripe' | 'AmazonPay' | 'Solana';
import { SageMakerRuntimeClient, InvokeEndpointCommand } from '@aws-sdk/client-sagemaker-runtime';
import { RoutingRequest, RoutingResponse } from '../types/api';
import { cacheService } from '../utils/cache';
import { logger } from '../utils/logger';
import * as crypto from 'crypto';

const sagemakerClient = new SageMakerRuntimeClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
  }
});

export class RoutingService {
  private static VW_BANDIT_ENDPOINT = process.env.ROUTING_VW_ENDPOINT || '/routing-vw-bandit-endpoint-local/invocations';
  
  private static readonly GATEWAY_ENDPOINTS: Record<GatewayName, string> = {
    Stripe: process.env.STRIPE_MOCK_URL  || 'http://localhost:8080/stripe',
    AmazonPay: process.env.AMAZON_PAY_MOCK_URL || 'http://localhost:8080/amazon-pay',
    Solana: process.env.SOLANA_MOCK_URL  || 'http://localhost:8080/solana',
  };
  
  private static GATEWAYS = [
    { 
      name: 'Stripe', 
      id: 0,
      baseSuccessRate: 97.8, 
      baseCost: 2.9, 
      baseLatency: 150,
      features: ['Cards', 'ACH', 'Wallets'],
      regions: ['US', 'EU', 'Global']
    },
    { 
      name: 'AmazonPay', 
      id: 1,
      baseSuccessRate: 96.2, 
      baseCost: 2.5, 
      baseLatency: 120,
      features: ['Amazon Users', 'Fast Checkout'],
      regions: ['US', 'EU']
    },
    { 
      name: 'Solana', 
      id: 2,
      baseSuccessRate: 99.1, 
      baseCost: 0.1, 
      baseLatency: 800,
      features: ['Crypto', 'Low Fees', 'Fast Settlement'],
      regions: ['Global']
    }
  ];

  static async optimizeRouting(request: RoutingRequest): Promise<RoutingResponse> {
    const timer = logger.time('routing_optimization');
    
    try {
      // Check cache first
      const contextHash = this.generateContextHash(request);
      const cached = await cacheService.getCachedRoutingDecision(contextHash);
      if (cached) {
        logger.info('Routing decision retrieved from cache', { contextHash });
        timer.end();
        return this.buildCachedResponse(cached);
      }

      // Prepare context features for Vowpal Wabbit contextual bandit
      const contextFeatures = this.extractContextFeatures(request);
      
      // Get real-time gateway performance metrics
      const gatewayMetrics = await this.getGatewayMetrics();
      
      // Call Vowpal Wabbit contextual bandit model
      const banditDecision = await this.callVowpalWabbitBandit(contextFeatures, gatewayMetrics);
      
      // Build response with gateway recommendation
      const response = this.buildRoutingResponse(banditDecision, gatewayMetrics, request);
      
      // Cache the decision
      await cacheService.cacheRoutingDecision(contextHash, response.recommended.name, 900); // 15 min cache
      
      logger.info('Routing optimization completed', {
        contextHash,
        recommended: response.recommended.name,
        explorationFactor: banditDecision.exploration
      });

      timer.end();
      return response;

    } catch (error) {
      logger.error('Routing optimization failed', error);
      timer.end();
      
      // Fallback to rule-based routing
      return this.fallbackRouting(request);
    }
  }

  private static async callVowpalWabbitBandit(context: any, metrics: any[]): Promise<any> {
    try {
      // Format for VW contextual bandit (--cb_explore_adf format)
      const vwPayload = {
        context_features: context,
        actions: this.GATEWAYS.map(gateway => ({
          action_id: gateway.id,
          features: {
            success_rate: metrics[gateway.id]?.successRate || gateway.baseSuccessRate,
            cost: metrics[gateway.id]?.cost || gateway.baseCost,
            latency: metrics[gateway.id]?.latency || gateway.baseLatency,
            supports_region: gateway.regions.includes(context.region) ? 1 : 0,
            supports_amount: context.amount <= 50000 ? 1 : 0  // Some gateways have limits
          }
        }))
      };

      const command = new InvokeEndpointCommand({
        EndpointName: this.VW_BANDIT_ENDPOINT,
        ContentType: 'application/json',
        Body: JSON.stringify(vwPayload)
      });

      const response = await sagemakerClient.send(command);
      const result = JSON.parse(Buffer.from(response.Body!).toString());
      
      return {
        chosen_action: result.action_id || 0,
        action_probability: result.probability || 0.5,
        exploration: result.exploration || false,
        expected_reward: result.expected_reward || 0.8
      };

    } catch (error:any) {
      logger.warn('VW Bandit model call failed', { error: error.message });
      
      // Fallback to epsilon-greedy selection
      return this.epsilonGreedySelection(context, metrics);
    }
  }

  private static async getGatewayMetrics(): Promise<any[]> {
    try {
      // In production, this would query CloudWatch metrics or a monitoring service
      // For now, simulate with some variance around base metrics
      return this.GATEWAYS.map((gateway, idx) => ({
        id: idx,
        successRate: gateway.baseSuccessRate + (Math.random() - 0.5) * 2,
        cost: gateway.baseCost + (Math.random() - 0.5) * 0.2,
        latency: gateway.baseLatency + (Math.random() - 0.5) * 50,
        volume: Math.floor(Math.random() * 1000) + 100 // Current volume
      }));
    } catch (error:any) {
      logger.warn('Failed to get real-time gateway metrics', { error: error.message });
      
      // Return base metrics as fallback
      return this.GATEWAYS.map((gateway, idx) => ({
        id: idx,
        successRate: gateway.baseSuccessRate,
        cost: gateway.baseCost,
        latency: gateway.baseLatency,
        volume: 500
      }));
    }
  }

  private static extractContextFeatures(request: RoutingRequest): any {
    return {
      // Transaction context
      amount_log: Math.log10(request.amount + 1),
      amount_bucket: this.getAmountBucket(request.amount),
      currency_code: this.encodeCurrency(request.currency),
      
      // Risk context
      risk_score: request.riskScore / 100, // Normalize to 0-1
      risk_bucket: request.riskScore > 70 ? 'high' : request.riskScore > 40 ? 'medium' : 'low',
      
      // Business context
      merchant_type: request.merchantType,
      region: request.region,
      
      // Temporal context
      hour_of_day: new Date().getHours(),
      day_of_week: new Date().getDay(),
      is_weekend: [0, 6].includes(new Date().getDay()) ? 1 : 0,
      
      // Performance preferences
      optimize_for: this.inferOptimizationGoal(request)
    };
  }

  private static epsilonGreedySelection(context: any, metrics: any[]): any {
    const epsilon = 0.1; // 10% exploration
    
    if (Math.random() < epsilon) {
      // Explore: random selection
      const randomAction = Math.floor(Math.random() * this.GATEWAYS.length);
      return {
        chosen_action: randomAction,
        action_probability: 1.0 / this.GATEWAYS.length,
        exploration: true,
        expected_reward: 0.5
      };
    } else {
      // Exploit: choose best gateway based on context
      const scores = metrics.map((metric, idx) => {
        let score = metric.successRate / 100; // Base score from success rate
        
        // Adjust for cost (lower cost = higher score)
        score += (5 - metric.cost) / 10;
        
        // Adjust for latency (lower latency = higher score for real-time needs)
        if (context.risk_score < 0.3) {
          score += (1000 - metric.latency) / 2000;
        }
        
        // Adjust for amount and gateway capabilities
        if (context.amount_bucket === 'large' && idx === 0) score += 0.1; // Stripe for large amounts
        if (context.amount_bucket === 'small' && idx === 2) score += 0.15; // Solana for small amounts
        
        return { idx, score };
      });
      
      scores.sort((a, b) => b.score - a.score);
      
      return {
        chosen_action: scores[0].idx,
        action_probability: 0.9,
        exploration: false,
        expected_reward: scores[0].score
      };
    }
  }

  private static buildRoutingResponse(decision: any, metrics: any[], request: RoutingRequest): RoutingResponse {
    const chosenGateway = this.GATEWAYS[decision.chosen_action];
    const chosenMetrics = metrics[decision.chosen_action];
    
    const recommended = {
      ...chosenGateway,
      successRate: chosenMetrics.successRate,
      cost: chosenMetrics.cost,
      latency: chosenMetrics.latency,
      score: decision.expected_reward * 100,
      reason: this.generateReason(chosenGateway.name, request, decision),
      confidence: decision.action_probability * 100
    };

    // Generate alternatives (other gateways with their scores)
    const alternatives = this.GATEWAYS
      .map((gateway, idx) => ({
        ...gateway,
        successRate: metrics[idx].successRate,
        cost: metrics[idx].cost,
        latency: metrics[idx].latency,
        score: this.calculateGatewayScore(gateway, metrics[idx], request),
        reason: this.generateReason(gateway.name, request, { exploration: false })
      }))
      .filter(g => g.name !== recommended.name)
      .sort((a, b) => b.score - a.score);

    return {
      recommended,
      alternatives,
      decisionContext: {
        model: decision.exploration ? 'exploration' : 'exploitation',
        confidence: decision.action_probability,
        contextHash: this.generateContextHash(request)
      }
    };
  }

  private static calculateGatewayScore(gateway: any, metrics: any, request: RoutingRequest): number {
    let score = metrics.successRate;
    
    // Cost adjustment
    score -= (metrics.cost - 1) * 5;
    
    // Latency adjustment
    score -= (metrics.latency - 100) / 50;
    
    // Context-specific adjustments
    if (request.amount > 5000 && gateway.name === 'Stripe') score += 10;
    if (request.amount < 100 && gateway.name === 'Solana') score += 15;
    if (request.riskScore > 50 && gateway.name === 'AmazonPay') score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private static getAmountBucket(amount: number): string {
    if (amount < 100) return 'small';
    if (amount < 1000) return 'medium';
    if (amount < 10000) return 'large';
    return 'xlarge';
  }

  private static encodeCurrency(currency: string): number {
    const currencies: Record<string, number> = {
      USD: 1,
      EUR: 2,
      GBP: 3,
      default: 0
    };
    return currencies[currency.toUpperCase()] ?? currencies.default;
  }


  private static inferOptimizationGoal(request: RoutingRequest): string {
    if (request.riskScore > 60) return 'security';
    if (request.amount < 50) return 'cost';
    return 'reliability';
  }

  private static generateReason(gateway: string, request: RoutingRequest, decision: any): string {
    const reasons = {
      'Stripe': `Best for $${request.amount} transactions with ${request.riskScore.toFixed(1)}% risk - enterprise reliability`,
      'AmazonPay': `Optimal for ${request.merchantType} with trusted checkout experience`,
      'Solana': `Most cost-effective for $${request.amount} - ${decision.exploration ? 'exploring' : 'proven'} low-cost option`
    };
    return (reasons as any)[gateway] || `Recommended based on current context and ML optimization`;
  }

  private static generateContextHash(request: RoutingRequest): string {
    const contextString = `${request.amount}_${request.currency}_${request.riskScore}_${request.merchantType}_${request.region}`;
    return crypto.createHash('sha256').update(contextString).digest('hex').substring(0, 16);
  }

  private static buildCachedResponse(gatewayName: string): RoutingResponse {
    const gateway = this.GATEWAYS.find(g => g.name === gatewayName) || this.GATEWAYS[0];
    
    return {
      recommended: {
        ...gateway,
        successRate: gateway.baseSuccessRate,
        cost: gateway.baseCost,
        latency: gateway.baseLatency,
        score: 85,
        reason: `Cached recommendation for ${gateway.name}`,
        confidence: 90
      },
      alternatives: [],
      decisionContext: {
        model: 'cached',
        confidence: 0.9,
        contextHash: 'cached'
      }
    };
  }

  private static fallbackRouting(request: RoutingRequest): RoutingResponse {
    // Simple rule-based fallback
    let chosenGateway = this.GATEWAYS[0]; // Default to Stripe

    if (request.amount < 100 && request.riskScore < 30) {
      chosenGateway = this.GATEWAYS[2]; // Solana for small, low-risk
    } else if (request.merchantType === 'e-commerce' && request.riskScore < 50) {
      chosenGateway = this.GATEWAYS[1]; // AmazonPay for e-commerce
    }

    return {
      recommended: {
        ...chosenGateway,
        successRate: chosenGateway.baseSuccessRate,
        cost: chosenGateway.baseCost,
        latency: chosenGateway.baseLatency,
        score: 75,
        reason: `Rule-based fallback recommendation`,
        confidence: 60
      },
      alternatives: this.GATEWAYS.filter(g => g.name !== chosenGateway.name).map(g => ({
        ...g,
        successRate: g.baseSuccessRate,
        cost: g.baseCost,
        latency: g.baseLatency,
        score: 60,
        reason: `Alternative option`
      })),
      decisionContext: {
        model: 'rule_based_fallback',
        confidence: 0.6,
        contextHash: 'fallback'
      }
    };
  }
}
