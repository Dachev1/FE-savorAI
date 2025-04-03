import { parseJwt } from '../../api/apiService';

export class AuthAPI {
  private apiService: any;
  private refreshToken: () => Promise<boolean>;
  
  constructor(apiService: any, refreshToken: () => Promise<boolean>) {
    this.apiService = apiService;
    this.refreshToken = refreshToken;
  }
  
  /**
   * Fetches the current user's profile
   */
  async getProfile(): Promise<any> {
    try {
      // Check if we need to refresh the token before proceeding
      await this.refreshTokenIfNeeded();
      
      const response = await this.apiService.get('/users/profile');
      return response.data;
    } catch (error) {
      this.handleApiError(error, 'Failed to get user profile');
      return null;
    }
  }
  
  /**
   * Checks if token needs refreshing and handles it
   */
  private async refreshTokenIfNeeded(): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
      // Check if token is expired or close to expiration
      const tokenData = parseJwt(token);
      if (!tokenData || !tokenData.exp) return;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiration = tokenData.exp - currentTime;
      
      // If token expires in less than 5 minutes, refresh it
      if (timeUntilExpiration < 300) {
        await this.refreshToken();
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
    }
  }
  
  /**
   * Handle API errors consistently
   */
  private handleApiError(error: any, defaultMessage: string): void {
    const errorMessage = error.response?.data?.message || defaultMessage;
    console.error(errorMessage, error);
  }
} 