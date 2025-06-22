
export const fraudTestRecords = [
  {
    transactionId: "tx1001",
    userId: "user_123",
    cardId: "card_abc",
    amount: 45.20,
    currency: "USD",
    merchantCategory: "online_retail",
    location: "New York, USA",
    deviceInfo: "Desktop Chrome",
    previousDeclines: 0,
    velocityLastHour: 2,
    expectedRisk: "low"
  },
  {
    transactionId: "tx1002", 
    userId: "user_456",
    cardId: "card_def",
    amount: 1200.00,
    currency: "USD",
    merchantCategory: "electronics",
    location: "Los Angeles, USA",
    deviceInfo: "Mobile Safari",
    previousDeclines: 3,
    velocityLastHour: 10,
    expectedRisk: "high"
  },
  {
    transactionId: "tx1003",
    userId: "user_789",
    cardId: "card_ghi", 
    amount: 9.99,
    currency: "EUR",
    merchantCategory: "subscription",
    location: "Berlin, Germany",
    deviceInfo: "Desktop Firefox",
    previousDeclines: 0,
    velocityLastHour: 1,
    expectedRisk: "low"
  },
  {
    transactionId: "tx1004",
    userId: "user_456",
    cardId: "card_def",
    amount: 15000.00,
    currency: "USD", 
    merchantCategory: "luxury_goods",
    location: "Los Angeles, USA",
    deviceInfo: "Mobile Safari",
    previousDeclines: 5,
    velocityLastHour: 15,
    expectedRisk: "high"
  },
  {
    transactionId: "tx1005",
    userId: "user_321",
    cardId: "card_jkl",
    amount: 250.75,
    currency: "GBP",
    merchantCategory: "travel",
    location: "London, UK", 
    deviceInfo: "Desktop Edge",
    previousDeclines: 1,
    velocityLastHour: 4,
    expectedRisk: "medium"
  }
];

export const gatewayMetrics = [
  {
    name: "Stripe",
    successRate: 97.8,
    cost: 2.9,
    latency: 150,
    features: ["Cards", "ACH", "Wallets"],
    status: "active"
  },
  {
    name: "AmazonPay", 
    successRate: 96.2,
    cost: 2.5,
    latency: 120,
    features: ["Amazon Users", "Fast Checkout"],
    status: "active"
  },
  {
    name: "Solana",
    successRate: 99.1, 
    cost: 0.1,
    latency: 800,
    features: ["Crypto", "Low Fees", "Fast"],
    status: "active"
  }
];

export const routingTestCases = [
  {
    amount: 50.00,
    currency: "USD",
    riskScore: 15.2,
    merchantType: "subscription",
    region: "North America",
    expectedGateway: "Stripe"
  },
  {
    amount: 1200.00,
    currency: "USD", 
    riskScore: 87.3,
    merchantType: "electronics",
    region: "North America",
    expectedGateway: "AmazonPay"
  },
  {
    amount: 25.99,
    currency: "USD",
    riskScore: 8.1,
    merchantType: "gaming",
    region: "Global",
    expectedGateway: "Solana"
  }
];

export const chatTestQueries = [
  {
    query: "Why was my payment declined?",
    expectedTopics: ["fraud", "decline", "risk"]
  },
  {
    query: "How do I connect my Phantom wallet?",
    expectedTopics: ["solana", "wallet", "setup"]
  },
  {
    query: "What is a SmartReward token?",
    expectedTopics: ["rewards", "tokens", "redeem"]
  },
  {
    query: "Why did tx1002 fail?",
    expectedTopics: ["transaction", "failure", "risk"]
  }
];

export const userProfiles = [
  {
    userId: "user_123",
    spendLast30Days: 800,
    preferredGateway: "AmazonPay",
    riskProfile: "low"
  },
  {
    userId: "user_456", 
    spendLast30Days: 15000,
    preferredGateway: "Solana",
    riskProfile: "high"
  },
  {
    userId: "user_321",
    spendLast30Days: 3000, 
    preferredGateway: "Stripe",
    riskProfile: "medium"
  }
];
