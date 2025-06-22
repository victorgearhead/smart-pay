import { logger } from '../utils/logger';

export type PaymentGateway = 'stripe' | 'amazonpay' | 'solana';

export interface PaymentMockResponse {
  success: boolean;
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  processingTime: number;
  blockHeight?: number;
  error?: string;
}

export interface LocalPaymentRequest {
  gateway: string;
  amount: number;
  currency: string;
  userId: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface LocalPaymentResponse extends PaymentMockResponse {
  gateway: PaymentGateway;
  paymentMethod?: string;
  userId: string;
  timestamp: string;
}

export class LocalPaymentService {
  private static gatewayEndpoints: Record<PaymentGateway, string> = {
    stripe: process.env.STRIPE_MOCK_URL || 'http://localhost:8080/stripe',
    amazonpay: process.env.AMAZON_PAY_MOCK_URL || 'http://localhost:8080/amazon-pay',
    solana: process.env.SOLANA_MOCK_URL || 'http://localhost:8080/solana'
  };

  static async processPayment(request: LocalPaymentRequest): Promise<LocalPaymentResponse> {
    const timer = logger.time('local_payment_processing');

    const gw = request.gateway.toLowerCase() as PaymentGateway;
    const endpoint = LocalPaymentService.gatewayEndpoints[gw];
    if (!endpoint) {
      timer.end();
      throw new Error(`Unsupported gateway: ${request.gateway}`);
    }

    logger.info('Processing local payment', {
      gateway: gw,
      amount: request.amount,
      currency: request.currency,
      transactionId: request.transactionId ?? 'unknown'
    });

    const payload = {
      amount: request.amount,
      currency: request.currency,
      userId: request.userId,
      paymentMethod: request.paymentMethod,
      transactionId: request.transactionId
    };

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      timer.end();
      throw new Error(`Payment gateway mock error: ${resp.status}`);
    }

    const raw = await resp.json();
    const result = raw as PaymentMockResponse;

    if (typeof result.transactionId !== 'string' || typeof result.status !== 'string') {
      timer.end();
      throw new Error('Malformed payment response from mock server');
    }

    const response: LocalPaymentResponse = {
      ...result,
      gateway: gw,
      paymentMethod: request.paymentMethod,
      userId: request.userId,
      timestamp: new Date().toISOString()
    };

    logger.info('Local payment processed successfully', {
      transactionId: response.transactionId,
      status: response.status,
      gateway: response.gateway
    });

    timer.end();
    return response;
  }

  static async verifyPayment(transactionId: string, gateway: string): Promise<{ 
    transactionId: string; 
    gateway: PaymentGateway; 
    status: string; 
    verified: boolean; 
    timestamp: string;
  }> {
    const gw = gateway.toLowerCase() as PaymentGateway;
    if (!LocalPaymentService.gatewayEndpoints[gw]) {
      throw new Error(`Unsupported gateway for verification: ${gateway}`);
    }

    logger.info('Verifying local payment', { transactionId, gateway: gw });

    return {
      transactionId,
      gateway: gw,
      status: 'confirmed',
      verified: true,
      timestamp: new Date().toISOString()
    };
  }
}
