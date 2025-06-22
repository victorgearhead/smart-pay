
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { FraudService } from '../services/fraudService';
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
    
    const { userId, cardId, amount, merchantCategory, location, deviceInfo } = requestBody;
    if (!userId || !cardId || !amount || !merchantCategory || !location || !deviceInfo) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['userId', 'cardId', 'amount', 'merchantCategory', 'location', 'deviceInfo']
        })
      };
    }

    const fraudRequest = {
      ...requestBody,
      transactionId: requestBody.transactionId || `tx_${Date.now()}`,
      previousDeclines: requestBody.previousDeclines || 0,
      velocityLastHour: requestBody.velocityLastHour || 1,
      timestamp: new Date().toISOString()
    };

    logger.info('Processing fraud detection request', {
      transactionId: fraudRequest.transactionId,
      amount: fraudRequest.amount,
      merchantCategory: fraudRequest.merchantCategory
    });

    const result = await FraudService.analyzeFraud(fraudRequest);

    logger.info('Fraud analysis completed', {
      transactionId: fraudRequest.transactionId,
      riskScore: result.riskScore,
      recommendation: result.recommendation
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result)
    };
  } catch (error:any) {
    logger.error('Fraud handler error', error);
    
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
export const fraudHandler = withLogging(handler);
