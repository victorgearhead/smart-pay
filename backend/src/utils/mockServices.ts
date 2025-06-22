
import { localConfig, PaymentGateway } from '../config/local';
import { logger } from './logger';

export class MockServices {
  static async mockSageMakerInference(endpoint: string, payload: any) {
    logger.info(`Mock SageMaker inference called for endpoint: ${endpoint}`);
    
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    if (endpoint.includes('fraud')) {
      return {
        Body: Buffer.from(JSON.stringify(localConfig.mockSageMakerEndpoints.fraud.mockResponse))
      };
    }
    
    if (endpoint.includes('routing')) {
      return {
        Body: Buffer.from(JSON.stringify(localConfig.mockSageMakerEndpoints.routing.mockResponse))
      };
    }
    
    return {
      Body: Buffer.from(JSON.stringify({ score: 0.1 }))
    };
  }

  static async mockPaymentGateway(gateway: string, amount: number, currency: string) {
    logger.info(`Mock payment gateway called: ${gateway}, amount: ${amount} ${currency}`);
    
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const mockResponse = (localConfig.mockPaymentResponses as any)[gateway] || localConfig.mockPaymentResponses.stripe;
    
    return {
      ...mockResponse,
      amount,
      currency,
      timestamp: new Date().toISOString()
    };
  }

  static async mockRewardMinting(userId: string, amount: number, tokens: number) {
    logger.info(`Mock reward minting: ${tokens} tokens for user ${userId}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return {
      success: true,
      tokenMintTx: `mock_mint_tx_${Date.now()}`,
      tokensAwarded: tokens,
      walletAddress: process.env.DEFAULT_USER_WALLET,
      processingTime: 1500,
      blockHeight: Math.floor(Math.random() * 1000000)
    };
  }
}
