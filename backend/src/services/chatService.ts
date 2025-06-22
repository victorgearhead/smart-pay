import { Client } from '@opensearch-project/opensearch';
import { ChatRequest, ChatResponse, OllamaRawResponse } from '../types/api';
import { logger } from '../utils/logger';
import { cacheService } from '../utils/cache';

const opensearchClient = new Client({
  node: process.env.OPENSEARCH_HOST || 'http://localhost:9200',
  auth: {
    username: process.env.OPENSEARCH_USERNAME || 'admin',
    password: process.env.OPENSEARCH_PASSWORD || 'admin'
  },
  ssl: {
    rejectUnauthorized: false
  }
});

export class ChatService {
  private static readonly KNOWLEDGE_INDEX = 'smartpay-knowledge';
  private static readonly TRANSACTION_INDEX = 'smartpay-transactions';
  private static readonly CONTEXT_CACHE_TTL = 3600;
  private static readonly OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  private static readonly OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:latest';

  static async processChat(request: ChatRequest): Promise<ChatResponse> {
    const timer = logger.time('chat_processing');
    
    logger.info('Processing chat request', {
      userId: request.userId,
      sessionId: request.sessionId,
      messageLength: request.message.length
    });

    try {
      const context = await this.getConversationContext(request.sessionId);
      
      const [knowledgeResults, transactionResults] = await Promise.all([
        this.searchKnowledgeBase(request.message),
        this.searchUserTransactions(request.userId, request.message)
      ]);

      // ragContext = this.buildRAGContext(knowledgeResults, transactionResults);
      const ragContext = ''
      
      const response = await this.generateResponseWithOllama(request.message, context, ragContext);
      
      await this.updateConversationContext(request.sessionId, request.message, response.message);
      
      const chatResponse: ChatResponse = {
        message: response.message,
        sessionId: request.sessionId,
        timestamp: new Date().toISOString(),
        sources: response.sources,
        suggestions: response.suggestions,
        processingTime: timer.end()
      };

      logger.info('Chat processing completed', {
        userId: request.userId,
        sessionId: request.sessionId,
        processingTime: chatResponse.processingTime,
        sourcesCount: response.sources.length
      });

      return chatResponse;

    } catch (error:any) {
      const processingTime = timer.end();
      
      logger.error('Chat processing failed', error, {
        userId: request.userId,
        sessionId: request.sessionId,
        processingTime
      });

      return {
        message: "I'm experiencing some technical difficulties. Please try again in a moment, or contact our support team for immediate assistance.",
        sessionId: request.sessionId,
        timestamp: new Date().toISOString(),
        sources: [],
        suggestions: [
          "Check transaction status",
          "Contact support",
          "View payment methods"
        ],
        processingTime,
        error: error.message
      };
    }
  }

  private static async searchKnowledgeBase(query: string): Promise<any[]> {
    try {
      const searchResponse = await opensearchClient.search({
        index: this.KNOWLEDGE_INDEX,
        body: {
          query: {
            multi_match: {
              query: query,
              fields: ['title^2', 'content', 'tags'],
              type: 'best_fields',
              fuzziness: 'AUTO'
            }
          },
          highlight: {
            fields: {
              content: {},
              title: {}
            }
          },
          size: 5
        }
      });

      return searchResponse.body.hits.hits.map((hit: any) => ({
        title: hit._source.title,
        content: hit._source.content,
        category: hit._source.category,
        score: hit._score,
        highlight: hit.highlight
      }));

    } catch (error:any) {
      logger.warn('Knowledge base search failed', { error: error.message, query });
      return [];
    }
  }

  private static async searchUserTransactions(userId: string, query: string): Promise<any[]> {

    try {
      const searchResponse = await opensearchClient.search({
        index: this.TRANSACTION_INDEX,
        body: {
          query: {
            bool: {
              must: [
                { match: { userId: userId } },
                {
                  multi_match: {
                    query: query,
                    fields: ['transactionId', 'gateway', 'status', 'errorMessage'],
                    fuzziness: 'AUTO'
                  }
                }
              ]
            }
          },
          sort: [
            { timestamp: { order: 'desc' } }
          ],
          size: 3
        }
      });

      return searchResponse.body.hits.hits.map((hit: any) => ({
        transactionId: hit._source.transactionId,
        amount: hit._source.amount,
        currency: hit._source.currency,
        gateway: hit._source.gateway,
        status: hit._source.status,
        timestamp: hit._source.timestamp,
        errorMessage: hit._source.errorMessage
      }));

    } catch (error:any) {
      logger.warn('Transaction search failed', { error: error.message, userId, query });
      return [];
    }
  }

  private static buildRAGContext(knowledgeResults: any[], transactionResults: any[]): string {
    let context = '';

    if (knowledgeResults.length > 0) {
      context += 'Relevant Knowledge Base Information:\n';
      knowledgeResults.forEach((result, idx) => {
        context += `${idx + 1}. ${result.title}: ${result.content}\n`;
      });
      context += '\n';
    }

    if (transactionResults.length > 0) {
      context += 'Recent User Transactions:\n';
      transactionResults.forEach((tx, idx) => {
        context += `${idx + 1}. Transaction ${tx.transactionId}: $${tx.amount} ${tx.currency} via ${tx.gateway} - Status: ${tx.status}`;
        if (tx.errorMessage) {
          context += ` (Error: ${tx.errorMessage})`;
        }
        context += '\n';
      });
      context += '\n';
    }

    return context;
  }

  private static async generateResponseWithOllama(message: string, context: string[], ragContext: string): Promise<any> {
    try {
      const systemPrompt = `You are SmartPay Assistant, an AI helper for a payment processing platform. 

      Key capabilities:
      - Help users with payment issues, transaction status, and account questions
      - Explain fraud detection results and payment routing decisions  
      - Assist with SmartReward tokens and wallet integration
      - Provide technical support for payment methods (Stripe, Amazon Pay, Solana)

      Guidelines:
      - Be helpful, professional, and concise
      - Use the provided context to give accurate, personalized answers
      - If you can't find specific information, direct users to appropriate resources
      - For technical issues, provide step-by-step guidance
      - Always prioritize user security and privacy

      Context from knowledge base and user history:
      ${ragContext}

      Recent conversation:
      ${context.join('\n')}`;

      const ollamaResponse = await fetch(`${this.OLLAMA_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.OLLAMA_MODEL,
          prompt: `${systemPrompt}\n\nUser: ${message}\nAssistant:`,
          stream: false,
          options: {
            temperature: 0.7,
            max_tokens: 500,
            top_p: 0.9
          }
        })
      });

      if (!ollamaResponse.ok) {
        throw new Error(`Ollama API error: ${ollamaResponse.status}`);
      }

      const raw = await ollamaResponse.json();
      const result = raw as OllamaRawResponse;
      const responseMessage = result.response || 
        "I'm having trouble processing your request right now. Please try again.";

      const sources = this.extractSources(ragContext);
      const suggestions = this.generateSuggestions(message, responseMessage);

      return {
        message: responseMessage,
        sources,
        suggestions
      };

    } catch (error) {
      logger.error('Ollama API call failed', error);
      
      return this.generateFallbackResponse(message);
    }
  }

  private static extractSources(ragContext: string): string[] {
    const sources: string[] = [];
    
    const kbMatches = ragContext.match(/\d+\.\s+([^:]+):/g);
    if (kbMatches) {
      sources.push(...kbMatches.map(match => match.replace(/\d+\.\s+/, '').replace(':', '')));
    }
    
    return sources.slice(0, 3);
  }

  private static generateSuggestions(userMessage: string, response: string): string[] {
    const suggestions: string[] = [];
    
    if (userMessage.toLowerCase().includes('payment') || userMessage.toLowerCase().includes('transaction')) {
      suggestions.push('Check transaction status', 'View payment methods', 'Update payment info');
    }
    
    if (userMessage.toLowerCase().includes('reward') || userMessage.toLowerCase().includes('token')) {
      suggestions.push('View reward balance', 'How to earn more rewards', 'Connect wallet');
    }
    
    if (userMessage.toLowerCase().includes('failed') || userMessage.toLowerCase().includes('error')) {
      suggestions.push('Retry payment', 'Contact support', 'Try different payment method');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Help with payments', 'Check rewards', 'Account settings');
    }
    
    return suggestions.slice(0, 3);
  }

  private static generateFallbackResponse(message: string): any {
    const lowerMessage = message.toLowerCase();
    
    let fallbackMessage = "I'm here to help with your SmartPay questions. ";
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('transaction')) {
      fallbackMessage += "For payment-related issues, you can check your transaction history or try a different payment method.";
    } else if (lowerMessage.includes('reward') || lowerMessage.includes('token')) {
      fallbackMessage += "For rewards questions, you can view your SmartReward token balance in your wallet or learn about earning more rewards.";
    } else if (lowerMessage.includes('help')) {
      fallbackMessage += "I can help you with payments, rewards, account settings, and technical support.";
    } else {
      fallbackMessage += "Could you please provide more details about what you need help with?";
    }

    return {
      message: fallbackMessage,
      sources: [],
      suggestions: ['Help with payments', 'Check rewards', 'Contact support']
    };
  }

  private static async getConversationContext(sessionId: string): Promise<string[]> {
    try {
      const cached = await cacheService.get(`chat_context:${sessionId}`);
      return cached ? JSON.parse(cached) : [];
    } catch (error:any) {
      logger.warn('Failed to get conversation context', { error: error.message, sessionId });
      return [];
    }
  }

  private static async updateConversationContext(sessionId: string, userMessage: string, botResponse: string): Promise<void> {
    try {
      const context = await this.getConversationContext(sessionId);
      
      context.push(`User: ${userMessage}`);
      context.push(`Assistant: ${botResponse}`);
      
      const trimmedContext = context.slice(-10);
      
      await cacheService.set(`chat_context:${sessionId}`, JSON.stringify(trimmedContext), this.CONTEXT_CACHE_TTL);
      
    } catch (error:any) {
      logger.warn('Failed to update conversation context', { error: error.message, sessionId });
    }
  }

  static async indexKnowledge(documents: any[]): Promise<void> {
    try {
      for (const doc of documents) {
        await opensearchClient.index({
          index: this.KNOWLEDGE_INDEX,
          body: {
            title: doc.title,
            content: doc.content,
            category: doc.category,
            tags: doc.tags || [],
            timestamp: new Date().toISOString()
          }
        });
      }
      
      logger.info('Knowledge documents indexed', { count: documents.length });
      
    } catch (error) {
      logger.error('Failed to index knowledge', error);
      throw error;
    }
  }

  static async indexTransaction(transaction: any): Promise<void> {
    try {
      await opensearchClient.index({
        index: this.TRANSACTION_INDEX,
        body: {
          transactionId: transaction.transactionId,
          userId: transaction.userId,
          amount: transaction.amount,
          currency: transaction.currency,
          gateway: transaction.gateway,
          status: transaction.status,
          errorMessage: transaction.errorMessage,
          timestamp: transaction.timestamp
        }
      });
      
    } catch (error:any) {
      logger.warn('Failed to index transaction for search', { 
        error: error.message, 
        transactionId: transaction.transactionId 
      });
    }
  }
}
