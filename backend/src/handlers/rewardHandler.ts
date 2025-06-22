
// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
// import { RewardService } from '../services/rewardService';
// import { validateJWT } from '../utils/auth';
// import { corsHeaders } from '../utils/cors';
// import { logger, withLogging } from '../utils/logger';

// const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//   try {
//     // Validate JWT token
//     const user = await validateJWT(event.headers.Authorization || '');
//     if (!user) {
//       return {
//         statusCode: 401,
//         headers: corsHeaders,
//         body: JSON.stringify({ error: 'Unauthorized' })
//       };
//     }

//     // Parse request body
//     const requestBody = JSON.parse(event.body || '{}');
    
//     // Validate required fields
//     const { userId, transactionId, amount } = requestBody;
//     if (!userId || !transactionId || !amount) {
//       return {
//         statusCode: 400,
//         headers: corsHeaders,
//         body: JSON.stringify({ 
//           error: 'Missing required fields',
//           required: ['userId', 'transactionId', 'amount']
//         })
//       };
//     }

//     // Calculate reward tokens if not provided
//     const rewardTokens = requestBody.rewardTokens || 
//       RewardService.calculateRewardTokens(
//         requestBody.amount, 
//         requestBody.currency || 'USD',
//         requestBody.userTier || 'standard'
//       );

//     const rewardRequest = {
//       ...requestBody,
//       rewardTokens,
//       userWalletAddress: requestBody.userWalletAddress || process.env.DEFAULT_USER_WALLET
//     };

//     logger.info('Processing reward minting request', {
//       transactionId: rewardRequest.transactionId,
//       userId: rewardRequest.userId,
//       amount: rewardRequest.amount,
//       rewardTokens: rewardRequest.rewardTokens
//     });

//     // Process reward minting with real Solana/SPL integration
//     const result = await RewardService.mintRewards(rewardRequest);

//     logger.info('Reward minting completed', {
//       transactionId: result.tokenMintTx,
//       tokensAwarded: result.tokensAwarded,
//       walletAddress: result.walletAddress,
//       processingTime: result.processingTime
//     });

//     return {
//       statusCode: 200,
//       headers: corsHeaders,
//       body: JSON.stringify(result)
//     };
//   } catch (error:any) {
//     logger.error('Reward handler error', error);
    
//     return {
//       statusCode: 500,
//       headers: corsHeaders,
//       body: JSON.stringify({ 
//         error: 'Internal server error',
//         message: process.env.NODE_ENV === 'development' ? error.message : undefined
//       })
//     };
//   }
// };

// export { handler };
// export const rewardHandler = withLogging(handler);
