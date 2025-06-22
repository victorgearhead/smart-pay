
import { EventBridgeEvent, Context } from 'aws-lambda';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { broadcastEvent } from './websocketHandler';

const eventBridgeClient = new EventBridgeClient({ region: process.env.AWS_REGION });
const eventBusName = process.env.EVENT_BUS_NAME || 'smartpay-events-dev';

export const handler = async (event: EventBridgeEvent<string, any>, context: Context) => {
  console.log('Processing EventBridge event:', JSON.stringify(event, null, 2));

  try {
    switch (event['detail-type']) {
      case 'PaymentProcessed':
        await handlePaymentProcessed(event.detail);
        break;
      case 'RewardMinted':
        await handleRewardMinted(event.detail);
        break;
      case 'FraudDetected':
        await handleFraudDetected(event.detail);
        break;
      default:
        console.log('Unknown event type:', event['detail-type']);
    }

    await broadcastEvent({
      type: event['detail-type'],
      data: event.detail,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Event publisher error:', error);
    throw error;
  }
};

async function handlePaymentProcessed(detail: any) {
  console.log('Payment processed:', detail);
  
  await eventBridgeClient.send(new PutEventsCommand({
    Entries: [{
      Source: 'SmartPayOrchestrator.Analytics',
      DetailType: 'PaymentAnalytics',
      Detail: JSON.stringify({
        transactionId: detail.transactionId,
        gateway: detail.gateway,
        amount: detail.amount,
        processingTime: detail.processingTime,
        riskScore: detail.riskScore
      }),
      EventBusName: eventBusName
    }]
  }));
}

async function handleRewardMinted(detail: any) {
  console.log('Reward minted:', detail);
  
  await eventBridgeClient.send(new PutEventsCommand({
    Entries: [{
      Source: 'SmartPayOrchestrator.Notifications',
      DetailType: 'UserNotification',
      Detail: JSON.stringify({
        userId: detail.userId,
        type: 'reward_minted',
        message: `You've earned ${detail.amountMinted} SmartReward tokens!`,
        transactionId: detail.transactionId
      }),
      EventBusName: eventBusName
    }]
  }));
}

async function handleFraudDetected(detail: any) {
  console.log('Fraud detected:', detail);
  
  await eventBridgeClient.send(new PutEventsCommand({
    Entries: [{
      Source: 'SmartPayOrchestrator.Security',
      DetailType: 'SecurityAlert',
      Detail: JSON.stringify({
        severity: 'HIGH',
        type: 'fraud_detected',
        transactionId: detail.transactionId,
        riskScore: detail.riskScore,
        userId: detail.userId,
        timestamp: new Date().toISOString()
      }),
      EventBusName: eventBusName
    }]
  }));
}
