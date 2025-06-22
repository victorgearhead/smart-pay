import Stripe from 'stripe';
import 'dotenv/config';
import { Connection, PublicKey, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PaymentRequest, PaymentResponse } from '../types/api';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { logger } from '../utils/logger';
import { LocalPaymentService } from './localPaymentService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2023-10-16' 
});

const solanaConnection = new Connection(
  process.env.SOLANA_RPC_URL!,
  'confirmed'
);

const eventBridge = new EventBridgeClient({ 
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
  }
});

export class PaymentService {
  private static readonly AMAZON_PAY_CONFIG = {
    merchantId: process.env.AMAZON_PAY_MERCHANT_ID || 'FAKE_MERCHANT_ID',
    accessKey: process.env.AMAZON_PAY_ACCESS_KEY || 'FAKE_ACCESS_KEY',
    secretKey: process.env.AMAZON_PAY_SECRET_KEY || 'FAKE_SECRET_KEY',
    region: process.env.AMAZON_PAY_REGION || 'us',
    sandbox: process.env.NODE_ENV !== 'production'
  };

  static async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (process.env.NODE_ENV === 'local' || process.env.USE_MOCK_SERVICES === 'true') {
      const local = await LocalPaymentService.processPayment(request);
      return {
        transactionId: local.transactionId,
        status: local.success ? 'success' : 'failed',
        gatewayResponse: local,
        timestamp: local.timestamp,
        processingTime: local.processingTime
      };
    }

    const transactionId = `TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timer = logger.time('payment_processing');
    
    logger.info('Processing payment', {
      transactionId,
      gateway: request.gateway,
      amount: request.amount,
      currency: request.currency
    });

    try {
      let gatewayResponse;
      
      switch (request.gateway.toLowerCase()) {
        case 'stripe':
          gatewayResponse = await this.processStripePayment(request, transactionId);
          break;
        case 'amazonpay':
          gatewayResponse = await this.processAmazonPayPayment(request, transactionId);
          break;
        case 'solana':
          gatewayResponse = await this.processSolanaPayment(request, transactionId);
          break;
        default:
          throw new Error(`Unsupported gateway: ${request.gateway}`);
      }

      const response: PaymentResponse = {
        transactionId,
        status: 'success',
        gatewayResponse,
        timestamp: new Date().toISOString(),
        processingTime: timer.end()
      };

      await this.emitPaymentEvent(request, response);
      
      logger.info('Payment processed successfully', {
        transactionId,
        gateway: request.gateway,
        processingTime: response.processingTime
      });

      return response;

    } catch (error:any) {
      const processingTime = timer.end();
      
      logger.error('Payment processing failed', error, {
        transactionId,
        gateway: request.gateway,
        processingTime
      });
      
      return {
        transactionId,
        status: 'failed',
        gatewayResponse: { 
          error: error.message,
          errorCode: error.code || 'PAYMENT_FAILED'
        },
        timestamp: new Date().toISOString(),
        processingTime
      };
    }
  }

  private static async processStripePayment(
    request: PaymentRequest,
    transactionId: string
  ): Promise<any> {
    try {
      const customers = await stripe.customers.list({
        email: request.userEmail,
        limit: 1
      });
      const customer =
        customers.data[0] ||
        (await stripe.customers.create({
          email: request.userEmail,
          metadata: { userId: request.userId, transactionId }
        }));

      const pi = await stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100),
        currency: request.currency.toLowerCase(),
        customer: customer.id,
        payment_method: request.paymentMethod,
        confirmation_method: 'manual',
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/payment/return`,
        metadata: { transactionId, userId: request.userId }
      });

      const chargeList = await stripe.charges.list({
        payment_intent: pi.id,
        limit: 10
      });

      const simplifiedCharges = chargeList.data.map((c) => ({
        id: c.id,
        amount: c.amount,
        status: c.status
      }));

      return {
        stripePaymentIntentId: pi.id,
        stripeCustomerId: customer.id,
        status: pi.status,
        clientSecret: pi.client_secret!,
        charges: simplifiedCharges,
        nextAction: pi.next_action
      };
    } catch (err: any) {
      logger.error('Stripe payment failed', err);
      throw new Error(`Stripe payment failed: ${err.message}`);
    }
  }

  private static async processAmazonPayPayment(request: PaymentRequest, transactionId: string) {
    try {
      const amazonPayRequest = {
        merchantId: this.AMAZON_PAY_CONFIG.merchantId,
        chargeAmount: {
          amount: request.amount.toString(),
          currencyCode: request.currency.toUpperCase()
        },
        paymentDescriptor: `Payment for transaction ${transactionId}`,
        canHandlePendingAuthorization: false,
        captureNow: true,
        merchantReferenceId: transactionId,
        merchantStoreName: process.env.MERCHANT_STORE_NAME || 'SmartPay Store'
      };

      const mockResponse = {
        checkoutSessionId: `amzn_pay_${transactionId}`,
        webCheckoutDetails: {
          checkoutReviewReturnUrl: `${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment/amazon/review`,
          checkoutResultReturnUrl: `${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment/amazon/result`
        },
        productType: 'PayAndShip',
        paymentDetails: {
          paymentIntent: 'AuthorizeWithCapture',
          canHandlePendingAuthorization: false,
          chargeAmount: {
            amount: request.amount.toString(),
            currencyCode: request.currency.toUpperCase()
          }
        }
      };

      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        amazonPaySessionId: mockResponse.checkoutSessionId,
        checkoutUrl: `http://pay-api.amazon.${this.AMAZON_PAY_CONFIG.region}/checkout/v2/checkoutSessions/${mockResponse.checkoutSessionId}`,
        status: 'OPEN',
        paymentDetails: mockResponse.paymentDetails
      };

    } catch (error:any) {
      logger.error('Amazon Pay payment failed', error);
      throw new Error(`Amazon Pay payment failed: ${error.message}`);
    }
  }

  private static async processSolanaPayment(request: PaymentRequest, transactionId: string) {
    try {
      const payerSecretKey = process.env.SOLANA_PAYER_SECRET_KEY 
        ? JSON.parse(process.env.SOLANA_PAYER_SECRET_KEY)
        : Keypair.generate().secretKey;
      
      const payerKeypair = Keypair.fromSecretKey(new Uint8Array(payerSecretKey));
      
      const treasuryWallet = new PublicKey(
        process.env.SOLANA_TREASURY_WALLET || 'So11111111111111111111111111111111111111112'
      );

      const { blockhash, lastValidBlockHeight } = await solanaConnection.getLatestBlockhash();

      const transaction = new Transaction({
        feePayer: payerKeypair.publicKey,
        blockhash,
        lastValidBlockHeight
      });

      const lamports = Math.round(request.amount * LAMPORTS_PER_SOL);

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: payerKeypair.publicKey,
          toPubkey: treasuryWallet,
          lamports
        })
      );

      transaction.sign(payerKeypair);
      
      const signature = await solanaConnection.sendTransaction(transaction, [payerKeypair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      const confirmation = await solanaConnection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      return {
        solanaTransactionId: signature,
        fromAddress: payerKeypair.publicKey.toString(),
        toAddress: treasuryWallet.toString(),
        amount: request.amount,
        lamports,
        blockhash,
        slot: confirmation.context.slot,
        explorerUrl: `http://explorer.solana.com/tx/${signature}${process.env.NODE_ENV === 'production' ? '' : '?cluster=devnet'}`
      };

    } catch (error:any) {
      logger.error('Solana payment failed', error);
      throw new Error(`Solana payment failed: ${error.message}`);
    }
  }

  private static async emitPaymentEvent(request: PaymentRequest, response: PaymentResponse) {
    try {
      const event = {
        Source: 'SmartPayOrchestrator.Payment',
        DetailType: 'PaymentProcessed',
        Detail: JSON.stringify({
          transactionId: response.transactionId,
          userId: request.userId,
          amount: request.amount,
          currency: request.currency,
          gateway: request.gateway,
          status: response.status,
          processingTime: response.processingTime,
          timestamp: response.timestamp
        }),
        EventBusName: process.env.EVENT_BUS_NAME || 'smartpay-events-local'
      };

      const command = new PutEventsCommand({
        Entries: [event]
      });

      await eventBridge.send(command);
      
      logger.info('Payment event emitted to LocalStack', {
        transactionId: response.transactionId,
        eventBus: event.EventBusName
      });

    } catch (error) {
      logger.error('Failed to emit payment event to LocalStack', error);
    }
  }

  static async verifyPayment(transactionId: string, gateway: string): Promise<any> {
    try {
      if (process.env.NODE_ENV === 'local' || process.env.USE_MOCK_SERVICES === 'true') {
        return LocalPaymentService.verifyPayment(transactionId, gateway);
      }

      switch (gateway.toLowerCase()) {
        case 'stripe':
          const paymentIntents = await stripe.paymentIntents.list({
            limit: 1,
            expand: ['data.charges']
          });
          return paymentIntents.data.find(pi => 
            pi.metadata?.transactionId === transactionId
          );

        case 'solana':
          return { status: 'confirmed' };

        case 'amazonpay':
          return { status: 'completed' };

        default:
          throw new Error(`Verification not supported for gateway: ${gateway}`);
      }
    } catch (error) {
      logger.error('Payment verification failed', error, { transactionId, gateway });
      throw error;
    }
  }
}