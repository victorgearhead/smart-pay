
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { corsHeaders } from '../utils/cors';

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const connectionsTableName = process.env.CONNECTIONS_TABLE || 'smartpay-connections-dev';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { requestContext } = event;
  const { routeKey, connectionId } = requestContext;

  try {
    switch (routeKey) {
      case '$connect':
        return await handleConnect(connectionId!);
      case '$disconnect':
        return await handleDisconnect(connectionId!);
      case 'sendMessage':
        return await handleSendMessage(JSON.parse(event.body || '{}'), connectionId!);
      default:
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Unknown route' })
        };
    }
  } catch (error) {
    console.error('WebSocket handler error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function handleConnect(connectionId: string): Promise<APIGatewayProxyResult> {
  const ttl = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

  await dynamoClient.send(new PutItemCommand({
    TableName: connectionsTableName,
    Item: {
      connectionId: { S: connectionId },
      ttl: { N: ttl.toString() },
      connectedAt: { S: new Date().toISOString() }
    }
  }));

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: 'Connected' })
  };
}

async function handleDisconnect(connectionId: string): Promise<APIGatewayProxyResult> {
  await dynamoClient.send(new DeleteItemCommand({
    TableName: connectionsTableName,
    Key: {
      connectionId: { S: connectionId }
    }
  }));

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: 'Disconnected' })
  };
}

async function handleSendMessage(body: any, connectionId: string): Promise<APIGatewayProxyResult> {
  console.log('Received message:', body, 'from connection:', connectionId);
  
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: 'Message received' })
  };
}

export async function broadcastEvent(event: any) {
  const apiGateway = new ApiGatewayManagementApiClient({
    endpoint: `http://${process.env.WEBSOCKET_API_ID}.execute-api.${process.env.AWS_REGION}.amazonaws.com/${process.env.NODE_ENV}`
  });

  const connections: string[] = [];

  const broadcastPromises = connections.map(async (connectionId: string) => {
    try {
      await apiGateway.send(new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(event)
      }));
    } catch (error) {
      console.error(`Failed to send message to connection ${connectionId}:`, error);
      
      await dynamoClient.send(new DeleteItemCommand({
        TableName: connectionsTableName,
        Key: { connectionId: { S: connectionId } }
      }));
    }
  });

  await Promise.allSettled(broadcastPromises);
}
