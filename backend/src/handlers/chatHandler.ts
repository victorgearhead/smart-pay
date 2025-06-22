
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ChatService } from '../services/chatService';
import { validateJWT } from '../utils/auth';
import { corsHeaders } from '../utils/cors';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
    
    const { message, sessionId } = requestBody;
    if (!message) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const result = await ChatService.processChat(requestBody);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Chat handler error:', error);
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
