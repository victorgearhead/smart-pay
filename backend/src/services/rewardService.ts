// // src/services/rewardService.ts

// import {
//   Connection,
//   PublicKey,
//   Keypair,
//   Transaction,
//   SystemProgram
// } from '@solana/web3.js';
// import {
//   createMintToInstruction,
//   getAssociatedTokenAddress,
//   createAssociatedTokenAccountInstruction,
//   getMint,
//   TOKEN_PROGRAM_ID,
//   ASSOCIATED_TOKEN_PROGRAM_ID
// } from '@solana/spl-token';  // ensure `npm install @solana/spl-token` is done

// import { RewardRequest, RewardResponse } from '../types/api';
// import {
//   EventBridgeClient,
//   PutEventsCommand
// } from '@aws-sdk/client-eventbridge';
// import { logger } from '../utils/logger';
// import { cacheService } from '../utils/cache';

// const solanaConnection = new Connection(
//   process.env.SOLANA_RPC_URL!,
//   'confirmed'
// );

// const eventBridge = new EventBridgeClient({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
//   }
// });

// export class RewardService {
//   private static readonly SPL_TOKEN_MINT_ADDRESS =
//     process.env.SPL_TOKEN_MINT_ADDRESS!;
//   private static readonly TOKEN_DECIMALS = 6;

//   // 1️⃣ Mint rewards on Solana
//   static async mintRewards(
//     request: RewardRequest
//   ): Promise<RewardResponse> {
//     const timer = logger.time('reward_minting');
//     try {
//       // Authority keypair
//       const secret = process.env.MINT_AUTHORITY_SECRET_KEY!;
//       const mintAuthority = Keypair.fromSecretKey(
//         Uint8Array.from(JSON.parse(secret))
//       );

//       const mintPubkey = new PublicKey(
//         RewardService.SPL_TOKEN_MINT_ADDRESS
//       );
//       const userWallet = new PublicKey(
//         request.userWalletAddress ||
//           process.env.DEFAULT_USER_WALLET!
//       );

//       // Derive ATA
//       const ata = await getAssociatedTokenAddress(
//         mintPubkey,
//         userWallet
//       );

//       const { blockhash, lastValidBlockHeight } =
//         await solanaConnection.getLatestBlockhash();

//       const tx = new Transaction({
//         feePayer: mintAuthority.publicKey,
//         blockhash,
//         lastValidBlockHeight
//       });

//       // Create ATA if missing
//       const accountInfo = await solanaConnection.getAccountInfo(ata);
//       if (!accountInfo) {
//         tx.add(
//           createAssociatedTokenAccountInstruction(
//             mintAuthority.publicKey,
//             ata,
//             userWallet,
//             mintPubkey,
//             TOKEN_PROGRAM_ID,
//             ASSOCIATED_TOKEN_PROGRAM_ID
//           )
//         );
//       }

//       // Mint instruction
//       const amount = request.rewardTokens * 10 ** RewardService.TOKEN_DECIMALS;
//       tx.add(
//         createMintToInstruction(
//           mintPubkey,
//           ata,
//           mintAuthority.publicKey,
//           amount
//         )
//       );

//       tx.sign(mintAuthority);
//       const signature = await solanaConnection.sendTransaction(tx, [
//         mintAuthority
//       ]);
//       const conf = await solanaConnection.confirmTransaction({
//         signature,
//         blockhash,
//         lastValidBlockHeight
//       });
//       if (conf.value.err) {
//         throw new Error(`Mint failed: ${JSON.stringify(conf.value.err)}`);
//       }

//       // Cache new balance
//       const newBal = await RewardService.getUserTokenBalance(
//         userWallet.toString()
//       );
//       await cacheService.cacheUserTokenBalance(
//         request.userId,
//         newBal,
//         300
//       );

//       const response: RewardResponse = {
//         tokenMintTx: signature,
//         walletAddress: userWallet.toString(),
//         associatedTokenAccount: ata.toString(),
//         tokensAwarded: request.rewardTokens,
//         totalTokenAmount: amount,
//         mintAddress: mintPubkey.toString(),
//         timestamp: new Date().toISOString(),
//         explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
//         processingTime: timer.end()
//       };

//       await RewardService.emitRewardEvent(request, response);
//       logger.info('Reward minting succeeded', {
//         transactionId: request.transactionId,
//         signature,
//         tokensAwarded: request.rewardTokens
//       });
//       return response;
//     } catch (err: any) {
//       const elapsed = timer.end();
//       logger.error('Reward minting failed', err, {
//         transactionId: request.transactionId,
//         elapsed
//       });
//       throw new Error(`Failed to mint rewards: ${err.message}`);
//     }
//   }

//   // 2️⃣ Calculate rewards with typed maps
//   static calculateRewardTokens(
//     amount: number,
//     currency: string = 'USD',
//     userTier: string = 'standard'
//   ): number {
//     // Use Record<string, number> so indexing is safe
//     const tierMultipliers: Record<string, number> = {
//       bronze: 1.0,
//       silver: 1.2,
//       gold: 1.5,
//       platinum: 2.0,
//       standard: 1.0
//     };
//     const currencyMultipliers: Record<string, number> = {
//       USD: 1.0,
//       EUR: 1.1,
//       GBP: 1.25,
//       default: 1.0
//     };

//     const tierMult =
//       tierMultipliers[userTier.toLowerCase()] ||
//       tierMultipliers.standard;
//     const currMult =
//       currencyMultipliers[currency.toUpperCase()] ||
//       currencyMultipliers.default;

//     let base = Math.floor(amount * currMult * 0.02 * tierMult);
//     if (amount * currMult > 10000) base *= 1.5;
//     else if (amount * currMult > 5000) base *= 1.3;
//     else if (amount * currMult > 1000) base *= 1.1;

//     return Math.max(1, Math.min(10000, base));
//   }

//   // 3️⃣ Fetch on‐chain balance
//   static async getUserTokenBalance(
//     walletAddress: string
//   ): Promise<number> {
//     try {
//       const userWallet = new PublicKey(walletAddress);
//       const mintPubkey = new PublicKey(
//         RewardService.SPL_TOKEN_MINT_ADDRESS
//       );
//       const ata = await getAssociatedTokenAddress(
//         mintPubkey,
//         userWallet
//       );
//       const balance = await solanaConnection.getTokenAccountBalance(
//         ata
//       );
//       return balance.value.uiAmount || 0;
//     } catch (err: any) {
//       logger.warn('Failed to fetch token balance', { err });
//       return 0;
//     }
//   }

//   // 4️⃣ Bulk mint with type guard on errors
//   static async bulkMintRewards(
//     requests: RewardRequest[]
//   ): Promise<RewardResponse[]> {
//     const results: RewardResponse[] = [];
//     const batchSize = 5;

//     for (let i = 0; i < requests.length; i += batchSize) {
//       const batch = requests.slice(i, i + batchSize);
//       const promises = batch.map((req) =>
//         RewardService.mintRewards(req).catch((e) => ({
//           error: e.message,
//           transactionId: req.transactionId
//         }))
//       );

//       const batchResults = await Promise.all(promises);

//       // 🎯 Use a `for…of` loop with a type guard
//       for (const r of batchResults) {
//         if ('error' in r) {
//           // r is the error object
//           logger.warn('Mint error in bulk', r);
//         } else {
//           // r is now narrowed to RewardResponse
//           results.push(r);
//         }
//       }

//       if (i + batchSize < requests.length) {
//         await new Promise((res) => setTimeout(res, 1000));
//       }
//     }

//     return results;
//   }


//   // 5️⃣ Helper: emit EventBridge event
//   private static async emitRewardEvent(
//     request: RewardRequest,
//     response: RewardResponse
//   ) {
//     try {
//       const entry = {
//         Source: 'SmartPayOrchestrator.Rewards',
//         DetailType: 'RewardMinted',
//         Detail: JSON.stringify({
//           transactionId: request.transactionId,
//           userId: request.userId,
//           tokensAwarded: request.rewardTokens,
//           walletAddress: response.walletAddress,
//           mintTx: response.tokenMintTx,
//           timestamp: response.timestamp,
//           processingTime: response.processingTime
//         }),
//         EventBusName: process.env.EVENT_BUS_NAME!
//       };
//       await eventBridge.send(new PutEventsCommand({ Entries: [entry] }));
//       logger.info('Emitted reward event', {
//         transactionId: request.transactionId
//       });
//     } catch (err: any) {
//       logger.error('Failed to emit reward event', err);
//     }
//   }
// }
