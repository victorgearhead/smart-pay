
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../handlers/fraudHandler';

describe('Fraud Handler', () => {
  const mockEvent: Partial<APIGatewayProxyEvent> = {
    headers: {
      Authorization: 'Bearer valid-jwt-token'
    },
    body: JSON.stringify({
      userId: 'test-user-123',
      cardId: 'test-card-456',
      amount: 1500,
      merchantCategory: 'online_retail',
      location: 'New York, NY',
      deviceInfo: 'Desktop Chrome'
    })
  };

  beforeEach(() => {
    // Mock validateJWT to return a valid user
    jest.mock('../../utils/auth', () => ({
      validateJWT: jest.fn().mockResolvedValue({
        id: 'test-user-123',
        email: 'test@example.com',
        username: 'testuser'
      })
    }));
  });

  it('should return 401 for missing authorization', async () => {
    const eventWithoutAuth = {
      ...mockEvent,
      headers: {}
    };

    const result = await handler(eventWithoutAuth as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(401);
    expect(JSON.parse(result.body)).toEqual({ error: 'Unauthorized' });
  });

  it('should return 400 for missing required fields', async () => {
    const eventWithMissingFields = {
      ...mockEvent,
      body: JSON.stringify({
        userId: 'test-user-123'
        // Missing other required fields
      })
    };

    const result = await handler(eventWithMissingFields as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: 'Missing required fields' });
  });

  it('should process valid fraud analysis request', async () => {
    const result = await handler(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    const response = JSON.parse(result.body);
    expect(response).toHaveProperty('riskScore');
    expect(response).toHaveProperty('recommendation');
  });
});
