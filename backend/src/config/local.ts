
export const localConfig = {
  mockSageMakerEndpoints: {
    fraud: {
      endpoint: 'fraud-xgboost-endpoint-local',
      mockResponse: {
        predictions: [{ score: 0.15 }]
      }
    },
    routing: {
      endpoint: 'routing-vw-bandit-endpoint-local',
      mockResponse: {
        chosen_action: 0,
        action_probability: 0.85,
        exploration: false,
        expected_reward: 0.95
      }
    }
  },

  mockPaymentResponses: {
    stripe: {
      success: true,
      transactionId: 'pi_mock_stripe_' + Date.now(),
      status: 'succeeded',
      processingTime: 150
    },
    amazonPay: {
      success: true,
      transactionId: 'amzn_mock_' + Date.now(),
      status: 'completed',
      processingTime: 200
    },
    solana: {
      success: true,
      transactionId: 'sol_mock_' + Date.now(),
      status: 'confirmed',
      processingTime: 800,
      blockHeight: 12345
    } as const,
  },

  testData: {
    userId: 'user_local_test_123',
    cardId: 'card_4242424242424242',
    merchantCategory: 'online_retail',
    location: 'San Francisco, CA',
    deviceInfo: 'Chrome/Mac'
  }
};
export type PaymentGateway = keyof typeof localConfig.mockPaymentResponses;