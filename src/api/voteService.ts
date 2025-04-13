import axios from './axiosConfig';
import { recipeServiceAxios } from './axiosConfig';

/**
 * Vote types for a recipe
 */
export enum VoteType {
  UP = 'up',
  DOWN = 'down'
}

/**
 * Service for handling vote-related API calls
 */
export const VoteService = {
  /**
   * Vote on a recipe (up or down)
   * @param recipeId - Recipe ID
   * @param voteType - Vote type ('up' or 'down')
   * @returns The updated recipe data
   */
  voteRecipe: async (recipeId: string, voteType: VoteType) => {
    try {
      const response = await recipeServiceAxios.post(`/v1/recipes/${recipeId}/vote`, {
        voteType
      });
      return response.data;
    } catch (error) {
      console.error('Error voting on recipe:', error);
      throw error;
    }
  }
};

export default VoteService; 