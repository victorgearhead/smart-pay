export interface FraudRequest {
  transactionId?: string;
  userId: string;
  cardId: string;
  amount: number;
  merchantCategory: string;
  location: string;
  deviceInfo: string;
  previousDeclines?: number;
  velocityLastHour?: number;
}

export interface FlaskFraudResponse {
  predictions: { score: number }[];
}


export interface FraudResponse {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: 'APPROVE' | 'REVIEW' | 'BLOCK';
  confidence: number;
  features: {
    amountAnomaly: boolean;
    locationAnomaly: boolean;
    velocityAnomaly: boolean;
    deviceAnomaly: boolean;
  };
  modelSource: string;
}

export interface RoutingRequest {
  amount: number;
  currency: string;
  riskScore: number;
  merchantType: string;
  region: string;
}

export interface RoutingResponse {
  recommended: {
    name: string;
    id: number;
    successRate: number;
    cost: number;
    latency: number;
    features: string[];
    regions: string[];
    score: number;
    reason: string;
    confidence: number;
  };
  alternatives: Array<{
    name: string;
    id: number;
    successRate: number;
    cost: number;
    latency: number;
    features: string[];
    regions: string[];
    score: number;
    reason: string;
  }>;
  decisionContext: {
    model: string;
    confidence: number;
    contextHash: string;
  };
}

export interface PaymentRequest {
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  gateway: string;
  paymentMethod: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: 'success' | 'failed' | 'pending';
  gatewayResponse: any;
  timestamp: string;
  processingTime: number;
}

export interface RewardRequest {
  userId: string;
  transactionId: string;
  amount: number;
  rewardTokens: number;
  userWalletAddress?: string;
}

export interface RewardResponse {
  tokenMintTx: string;
  walletAddress: string;
  associatedTokenAccount: string;
  tokensAwarded: number;
  totalTokenAmount: number;
  mintAddress: string;
  timestamp: string;
  explorerUrl: string;
  processingTime: number;
}

export interface ChatRequest {
  userId: string; 
  sessionId: string; 
  message: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  timestamp: string;
  sources: string[];
  suggestions: string[];
  processingTime: number;   
  error?: string;
}

export interface OllamaRawResponse {
  response?: string;
  sources?: string[];
  suggestions?: string[];
}
