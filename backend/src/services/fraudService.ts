import { SageMakerRuntimeClient, InvokeEndpointCommand, InvokeEndpointCommandOutput } from '@aws-sdk/client-sagemaker-runtime';
import { FraudRequest, FraudResponse } from '../types/api';
import { cacheService } from '../utils/cache';
import { logger } from '../utils/logger';
import { LocalFraudService } from './localFraudService';
import * as crypto from 'crypto';

const sagemakerClient = new SageMakerRuntimeClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
  }
});

export class FraudService {
  private static XGBOOST_ENDPOINT = process.env.FRAUD_XGBOOST_ENDPOINT || 'http://localhost:8080/fraud-xgboost-endpoint-local/invocations';

  static async analyzeFraud(request: FraudRequest): Promise<FraudResponse> {
    
    if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development' || process.env.USE_MOCK_SERVICES === 'true') {
      return LocalFraudService.analyzeFraud(request);
    }

    const timer = logger.time('fraud_analysis');
    
    try {
      const cacheKey = this.generateCacheKey(request);
      const cached = await cacheService.getCachedRiskScore(cacheKey);
      if (cached !== null) {
        logger.info('Fraud score retrieved from cache', { cacheKey });
        timer.end();
        return this.buildResponse(cached, 'cached');
      }

      const features = this.extractFeatures(request);
      
      const [xgboostScore] = await Promise.all([
        this.callXGBoostModel(features)
      ]);

      const finalScore = this.ensembleScores(xgboostScore);
      
      await cacheService.cacheRiskScore(cacheKey, finalScore, 1800);
      
      const response = this.buildResponse(finalScore, 'ml_ensemble');
      
      logger.info('Fraud analysis completed', {
        transactionId: request.transactionId,
        riskScore: finalScore,
        models: { xgboost: xgboostScore}
      });

      timer.end();
      return response;

    } catch (error) {
      logger.error('Fraud analysis failed', error, { transactionId: request.transactionId });
      timer.end();
      
      return LocalFraudService.analyzeFraud(request);
    }
  }

  private static async callXGBoostModel(features: any): Promise<number> {
    try {
      const command = new InvokeEndpointCommand({
        EndpointName: this.XGBOOST_ENDPOINT,
        ContentType: 'application/json',
        Body: JSON.stringify({ instances: [features] })
      });

      const response: InvokeEndpointCommandOutput = await sagemakerClient.send(command);

      const bodyBytes = response.Body as Uint8Array;
      const bodyStr   = Buffer.from(bodyBytes).toString('utf-8');

      interface XgbResult { predictions: { score: number }[]; }
      const result = JSON.parse(bodyStr) as XgbResult;

      return result.predictions[0]?.score ?? 0;
      
    } 
    catch (flaskError) {
        logger.warn('Flask fraud service also failed', flaskError);
    }
      
      return 0.3;
  }

  private static extractFeatures(request: FraudRequest): any {
    return {
      amount: request.amount,
      hour_of_day: new Date().getHours(),
      day_of_week: new Date().getDay(),
      previous_declines: request.previousDeclines || 0,
      velocity_last_hour: request.velocityLastHour || 0,
      merchant_category: this.encodeMerchantCategory(request.merchantCategory),
      location_risk: this.encodeLocationRisk(request.location),
      device_risk: this.encodeDeviceRisk(request.deviceInfo),
      user_id_hash: this.hashUserId(request.userId),
      card_id_hash: this.hashCardId(request.cardId),
      is_weekend: [0, 6].includes(new Date().getDay()) ? 1 : 0,
      is_night: new Date().getHours() < 6 || new Date().getHours() > 22 ? 1 : 0
    };
  }

  private static ensembleScores(xgboost: number): number {
    const weights = { xgboost: 0.5};
    return Math.min(1.0, Math.max(0.0, 
      xgboost * weights.xgboost
    ));
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

  private static hashUserId(userId: string): number {
    return parseInt(crypto.createHash('md5').update(userId).digest('hex').substring(0, 8), 16) % 10000;
  }

  private static hashCardId(cardId: string): number {
    return parseInt(crypto.createHash('md5').update(cardId).digest('hex').substring(0, 8), 16) % 10000;
  }

  private static generateCacheKey(request: FraudRequest): string {
    const key = `${request.userId}_${request.cardId}_${request.amount}_${request.merchantCategory}`;
    return crypto.createHash('sha256').update(key).digest('hex').substring(0, 16);
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
