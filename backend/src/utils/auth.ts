
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import jwt from 'jsonwebtoken';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export const validateJWT = async (authHeader: string): Promise<AuthUser | null> => {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.decode(token) as any;
    
    if (!decoded || !decoded.sub) {
      return null;
    }

    const getUserCommand = new GetUserCommand({
      AccessToken: token
    });

    const response = await cognitoClient.send(getUserCommand);
    
    return {
      id: decoded.sub,
      email: response.UserAttributes?.find(attr => attr.Name === 'email')?.Value || '',
      username: response.Username || ''
    };
  } catch (error) {
    console.error('JWT validation error:', error);
    return null;
  }
};
