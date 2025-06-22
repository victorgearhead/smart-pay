
import { FraudService } from '../../services/fraudService';
import { FraudRequest } from '../../types/api';

describe('FraudService', () => {
  const mockRequest: FraudRequest = {
    userId: 'test-user-123',
    cardId: 'test-card-456',
    amount: 1500,
    merchantCategory: 'online_retail',
    location: 'New York, NY',
    deviceInfo: 'Desktop Chrome'
  };

  beforeEach(() => {
    // Reset environment variables
    process.env.AWS_REGION = 'us-east-1';
    process.env.FRAUD_ENDPOINT_NAME = 'test-fraud-endpoint';
  });

  it('should analyze fraud and return risk assessment', async () => {
    const result = await FraudService.analyzeFraud(mockRequest);

    expect(result).toHaveProperty('riskScore');
    expect(result).toHaveProperty('riskLevel');
    expect(result).toHaveProperty('recommendation');
    expect(result).toHaveProperty('confidence');
    expect(result).toHaveProperty('features');

    expect(typeof result.riskScore).toBe('number');
    expect(['low', 'medium', 'high']).toContain(result.riskLevel);
    expect(['APPROVE', 'REVIEW', 'BLOCK']).toContain(result.recommendation);
    expect(typeof result.confidence).toBe('number');
  });

  it('should handle high-risk transactions', async () => {
    const highRiskRequest = {
      ...mockRequest,
      amount: 50000 // High amount
    };

    const result = await FraudService.analyzeFraud(highRiskRequest);
    
    // For high amounts, should have some anomaly detection
    expect(result.features.amountAnomaly).toBe(true);
  });

  it('should return fallback analysis on SageMaker failure', async () => {
    // Mock SageMaker failure by setting invalid endpoint
    process.env.FRAUD_ENDPOINT_NAME = '';

    const result = await FraudService.analyzeFraud(mockRequest);

    expect(result).toHaveProperty('riskScore');
    expect(result.confidence).toBe(75); // Fallback confidence
  });
});
