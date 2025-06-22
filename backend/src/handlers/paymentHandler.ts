
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PaymentService } from '../services/paymentService';
import { validateJWT } from '../utils/auth';
import { corsHeaders } from '../utils/cors';
import { logger, withLogging } from '../utils/logger';

const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const user = await validateJWT(event.headers.Authorization || '');
    if (!user) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const requestBody = JSON.parse(event.body || '{}');
    
    const { userId, amount, currency, gateway, paymentMethod } = requestBody;
    if (!userId || !amount || !currency || !gateway || !paymentMethod) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['userId', 'amount', 'currency', 'gateway', 'paymentMethod']
        })
      };
    }

    const paymentRequest = {
      ...requestBody,
      userEmail: requestBody.userEmail || user.email || 'test@example.com',
      userWalletAddress: requestBody.userWalletAddress || process.env.DEFAULT_USER_WALLET
    };

    logger.info('Processing payment request', {
      userId: paymentRequest.userId,
      amount: paymentRequest.amount,
      currency: paymentRequest.currency,
      gateway: paymentRequest.gateway
    });

    const result = await PaymentService.processPayment(paymentRequest);

    logger.info('Payment processing completed', {
      transactionId: result.transactionId,
      status: result.status,
      gateway: paymentRequest.gateway,
      processingTime: result.processingTime
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result)
    };
  } catch (error:any) {
    logger.error('Payment handler error', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

export { handler };
export const paymentHandler = withLogging(handler);
