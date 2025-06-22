
// Jest setup file
import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.test' });

// Mock AWS SDK
jest.mock('@aws-sdk/client-sagemaker-runtime');
jest.mock('@aws-sdk/client-cognito-identity-provider');
jest.mock('@aws-sdk/client-eventbridge');
jest.mock('@aws-sdk/client-opensearch');

// Global test timeout
jest.setTimeout(30000);
