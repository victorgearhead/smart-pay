
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("SmartPayRewards111111111111111111111111111");

#[program]
pub mod smartpay_rewards {
    use super::*;

    pub fn initialize_mint(
        ctx: Context<InitializeMint>,
        decimals: u8,
        mint_authority: Pubkey,
        freeze_authority: Option<Pubkey>,
    ) -> Result<()> {
        let mint = &mut ctx.accounts.mint;
        let rent = Rent::get()?;
        
        // Initialize mint account
        token::initialize_mint(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::InitializeMint {
                    mint: mint.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            decimals,
            &mint_authority,
            freeze_authority.as_ref(),
        )?;

        // Initialize program state
        let program_state = &mut ctx.accounts.program_state;
        program_state.mint = mint.key();
        program_state.mint_authority = mint_authority;
        program_state.total_minted = 0;
        program_state.total_transactions = 0;
        program_state.reward_rate = 200; // 2% = 200 basis points
        program_state.admin = ctx.accounts.admin.key();
        program_state.bump = *ctx.bumps.get("program_state").unwrap();

        msg!("SmartReward token mint initialized");
        Ok(())
    }

    pub fn mint_rewards(
        ctx: Context<MintRewards>,
        amount: u64,
        transaction_id: String,
    ) -> Result<()> {
        let program_state = &mut ctx.accounts.program_state;
        
        // Validate transaction
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(transaction_id.len() <= 64, ErrorCode::TransactionIdTooLong);
        
        // Check if transaction already processed
        let transaction_seed = format!("transaction_{}", transaction_id);
        let transaction_account = &ctx.accounts.transaction_record;
        require!(!transaction_account.is_processed, ErrorCode::TransactionAlreadyProcessed);

        // Calculate reward amount (2% of transaction amount)
        let reward_amount = (amount * program_state.reward_rate as u64) / 10000;
        require!(reward_amount > 0, ErrorCode::RewardTooSmall);

        // Mint tokens to user's associated token account
        let seeds = &[
            b"program_state",
            &[program_state.bump],
        ];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: program_state.to_account_info(),
                },
                signer,
            ),
            reward_amount,
        )?;

        // Update program state
        program_state.total_minted = program_state.total_minted.checked_add(reward_amount).unwrap();
        program_state.total_transactions = program_state.total_transactions.checked_add(1).unwrap();

        // Mark transaction as processed
        let transaction_record = &mut ctx.accounts.transaction_record;
        transaction_record.transaction_id = transaction_id.clone();
        transaction_record.user = ctx.accounts.user.key();
        transaction_record.amount = amount;
        transaction_record.reward_amount = reward_amount;
        transaction_record.timestamp = Clock::get()?.unix_timestamp;
        transaction_record.is_processed = true;

        // Create user reward account if first time
        let user_rewards = &mut ctx.accounts.user_rewards;
        if user_rewards.user == Pubkey::default() {
            user_rewards.user = ctx.accounts.user.key();
            user_rewards.total_earned = 0;
            user_rewards.total_redeemed = 0;
            user_rewards.transaction_count = 0;
        }

        // Update user rewards
        user_rewards.total_earned = user_rewards.total_earned.checked_add(reward_amount).unwrap();
        user_rewards.transaction_count = user_rewards.transaction_count.checked_add(1).unwrap();

        msg!("Minted {} SmartReward tokens for transaction {}", reward_amount, transaction_id);
        
        emit!(RewardMinted {
            user: ctx.accounts.user.key(),
            transaction_id,
            amount,
            reward_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn redeem_rewards(
        ctx: Context<RedeemRewards>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        
        let user_rewards = &mut ctx.accounts.user_rewards;
        let current_balance = ctx.accounts.user_token_account.amount;
        
        require!(current_balance >= amount, ErrorCode::InsufficientBalance);
        
        // Burn tokens from user account
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Burn {
                    mint: ctx.accounts.mint.to_account_info(),
                    from: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update user rewards tracking
        user_rewards.total_redeemed = user_rewards.total_redeemed.checked_add(amount).unwrap();

        msg!("Redeemed {} SmartReward tokens", amount);
        
        emit!(RewardRedeemed {
            user: ctx.accounts.user.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn update_reward_rate(
        ctx: Context<UpdateRewardRate>,
        new_rate: u16,
    ) -> Result<()> {
        require!(new_rate <= 1000, ErrorCode::RewardRateTooHigh); // Max 10%
        
        let program_state = &mut ctx.accounts.program_state;
        program_state.reward_rate = new_rate;

        msg!("Reward rate updated to {} basis points", new_rate);
        Ok(())
    }

    pub fn get_user_stats(ctx: Context<GetUserStats>) -> Result<UserStats> {
        let user_rewards = &ctx.accounts.user_rewards;
        let token_balance = ctx.accounts.user_token_account.amount;
        
        Ok(UserStats {
            total_earned: user_rewards.total_earned,
            total_redeemed: user_rewards.total_redeemed,
            current_balance: token_balance,
            transaction_count: user_rewards.transaction_count,
        })
    }
}

#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 32 + 32 + 8 + 8 + 2 + 32 + 1,
        seeds = [b"program_state"],
        bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(
        init,
        payer = admin,
        mint::decimals = 6,
        mint::authority = program_state,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(transaction_id: String)]
pub struct MintRewards<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(
        mut,
        address = program_state.mint
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = user,
        space = 8 + 64 + 32 + 8 + 8 + 8 + 1,
        seeds = [b"transaction", transaction_id.as_bytes()],
        bump
    )]
    pub transaction_record: Account<'info, TransactionRecord>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8,
        seeds = [b"user_rewards", user.key().as_ref()],
        bump
    )]
    pub user_rewards: Account<'info, UserRewards>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RedeemRewards<'info> {
    #[account(
        seeds = [b"program_state"],
        bump = program_state.bump
    )]
    pub program_state: Account<'info, ProgramState>,
    
    #[account(
        mut,
        address = program_state.mint
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"user_rewards", user.key().as_ref()],
        bump
    )]
    pub user_rewards: Account<'info, UserRewards>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateRewardRate<'info> {
    #[account(
        mut,
        seeds = [b"program_state"],
        bump = program_state.bump,
        has_one = admin
    )]
    pub program_state: Account<'info, ProgramState>,
    
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetUserStats<'info> {
    #[account(
        seeds = [b"user_rewards", user.key().as_ref()],
        bump
    )]
    pub user_rewards: Account<'info, UserRewards>,
    
    #[account(
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub mint: Account<'info, Mint>,
    pub user: Signer<'info>,
}

#[account]
pub struct ProgramState {
    pub mint: Pubkey,
    pub mint_authority: Pubkey,
    pub total_minted: u64,
    pub total_transactions: u64,
    pub reward_rate: u16, // Basis points (100 = 1%)
    pub admin: Pubkey,
    pub bump: u8,
}

#[account]
pub struct TransactionRecord {
    pub transaction_id: String,
    pub user: Pubkey,
    pub amount: u64,
    pub reward_amount: u64,
    pub timestamp: i64,
    pub is_processed: bool,
}

#[account]
pub struct UserRewards {
    pub user: Pubkey,
    pub total_earned: u64,
    pub total_redeemed: u64,
    pub transaction_count: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UserStats {
    pub total_earned: u64,
    pub total_redeemed: u64,
    pub current_balance: u64,
    pub transaction_count: u64,
}

#[event]
pub struct RewardMinted {
    pub user: Pubkey,
    pub transaction_id: String,
    pub amount: u64,
    pub reward_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct RewardRedeemed {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Transaction ID too long")]
    TransactionIdTooLong,
    #[msg("Transaction already processed")]
    TransactionAlreadyProcessed,
    #[msg("Reward amount too small")]
    RewardTooSmall,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Reward rate too high")]
    RewardRateTooHigh,
}
