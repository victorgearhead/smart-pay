export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  gateway: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  timestamp: string;
  fraudScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress?: string;
  tokenBalance: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: string;
}

export interface FraudAnalysis {
  transactionId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: 'APPROVE' | 'REVIEW' | 'BLOCK';
  modelSource: string;
  timestamp: string;
}

export interface RoutingDecision {
  contextHash: string;
  gateway: string;
  confidence: number;
  timestamp: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'payment_update' | 'fraud_alert' | 'routing_update' | 'reward_minted';
  data: any;
  timestamp: string;
  userId?: string;
}

export interface EventPayload {
  eventType: string;
  data: any;
  source: string;
  timestamp: string;
}