
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RoutingService } from '../services/routingService';
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
    
    const { amount, currency, riskScore, merchantType, region } = requestBody;
    if (!amount || !currency || riskScore === undefined || !merchantType || !region) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Missing required fields',
          required: ['amount', 'currency', 'riskScore', 'merchantType', 'region']
        })
      };
    }

    logger.info('Processing routing optimization request', {
      amount: requestBody.amount,
      currency: requestBody.currency,
      riskScore: requestBody.riskScore,
      merchantType: requestBody.merchantType
    });

    const result = await RoutingService.optimizeRouting(requestBody);

    logger.info('Routing optimization completed', {
      recommended: result.recommended.name,
      score: result.recommended.score,
      model: result.decisionContext?.model
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result)
    };
  } catch (error:any) {
    logger.error('Routing handler error', error);
    
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
export const routingHandler = withLogging(handler);
