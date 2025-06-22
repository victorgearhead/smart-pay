
import { FlaskFraudResponse, FraudRequest, FraudResponse } from '../types/api';
import { MockServices } from '../utils/mockServices';
import { logger } from '../utils/logger';

export class LocalFraudService {
  static async analyzeFraud(request: FraudRequest): Promise<FraudResponse> {
    const timer = logger.time('local_fraud_analysis');
    
    try {
      logger.info('Running local fraud analysis', {
                transactionId: request.transactionId || 'unknown',
        amount: request.amount,
        userId: request.userId
      });

      const fraudEndpoint = process.env.FRAUD_ENDPOINT_URL || 'http://localhost:8080/fraud-xgboost-endpoint-local/invocations';
      
      const payload = {
        instances: [{
          amount: request.amount,
          merchant_category: this.encodeMerchantCategory(request.merchantCategory),
          velocity_last_hour: request.velocityLastHour || 0,
          previous_declines: request.previousDeclines || 0,
          location_risk: this.encodeLocationRisk(request.location),
          device_risk: this.encodeDeviceRisk(request.deviceInfo),
          hour_of_day: new Date().getHours(),
          day_of_week: new Date().getDay()
        }]
      };

      try {
        const response = await fetch(fraudEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Flask server error: ${response.status}`);
        }

        const result = (await response.json()) as FlaskFraudResponse;
        const riskScore = result.predictions[0].score;

        const response2 = this.buildResponse(riskScore, 'local_flask_xgboost');
        
        logger.info('Local fraud analysis completed', {
          transactionId: request.transactionId || 'unknown',
          riskScore: riskScore * 100,
          recommendation: response2.recommendation
        });

        timer.end();
        return response2;

      } catch (fetchError) {
        logger.warn('Flask server unavailable, using fallback logic', fetchError);
        return this.fallbackAnalysis(request, timer);
      }

    } catch (error) {
      logger.error('Local fraud analysis failed', error);
      timer.end();
      throw error;
    }
  }

  private static fallbackAnalysis(request: FraudRequest, timer: any): FraudResponse {
    
    let finalScore = 0.1;
    
    if (request.amount > 5000) finalScore += 0.2;
    if (request.amount > 10000) finalScore += 0.3;
    
    if ((request.previousDeclines || 0) > 2) finalScore += 0.25;
    
    if ((request.velocityLastHour || 0) > 5) finalScore += 0.15;
    
    if (request.merchantCategory === 'gambling') finalScore += 0.4;
    if (request.merchantCategory === 'luxury_goods') finalScore += 0.2;

    finalScore = Math.min(1.0, Math.max(0.0, finalScore));

    timer.end();
    return this.buildResponse(finalScore, 'local_fallback');
  }

  private static encodeMerchantCategory(category: string): number {
    const categories = {
      'online_retail': 1, 'electronics': 2, 'luxury_goods': 5,
      'travel': 3, 'subscription': 1, 'gambling': 8, 'default': 2
    };
    return (categories as any)[category] || categories.default;
  }

  private static encodeLocationRisk(location: string): number {
    const highRiskLocations = ['unknown', 'tor', 'vpn'];
    return highRiskLocations.some(risk => location.toLowerCase().includes(risk)) ? 5 : 1;
  }

  private static encodeDeviceRisk(deviceInfo: string): number {
    const riskFactors = ['emulator', 'rooted', 'jailbroken'];
    return riskFactors.some(risk => deviceInfo.toLowerCase().includes(risk)) ? 4 : 1;
  }

  private static buildResponse(riskScore: number, source: string): FraudResponse {
    const riskLevel = riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low';
    const recommendation = riskScore > 0.7 ? 'BLOCK' : riskScore > 0.4 ? 'REVIEW' : 'APPROVE';

    return {
      riskScore: riskScore * 100,
      riskLevel,
      recommendation,
      confidence: Math.min(95, 75 + (riskScore * 20)),
      features: {
        amountAnomaly: riskScore > 0.6,
        locationAnomaly: riskScore > 0.5,
        velocityAnomaly: riskScore > 0.4,
        deviceAnomaly: riskScore > 0.7
      },
      modelSource: source
    };
  }
}
