import axios from '../api/axiosConfig';

export interface CommentData {
  id?: string;
  recipeId: string;
  content: string;
  userId?: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Service for managing recipe comments
 */
const CommentService = {
  /**
   * Get all comments for a recipe
   * @param recipeId The recipe ID to get comments for
   */
  getComments: async (recipeId: string): Promise<CommentData[]> => {
    try {
      if (!recipeId) throw new Error('Recipe ID is required');
      const response = await axios.get(`/v1/comments/${recipeId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  /**
   * Add a new comment to a recipe
   * @param recipeId Recipe ID to comment on
   * @param content Comment content
   */
  addComment: async (recipeId: string, content: string): Promise<CommentData> => {
    try {
      if (!content) throw new Error('Comment content is required');
      if (!recipeId) throw new Error('Recipe ID is required');
      
      const response = await axios.post('/v1/comments', {
        recipeId,
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  /**
   * Update an existing comment
   * @param commentId Comment ID to update
   * @param content New comment content
   */
  updateComment: async (commentId: string, content: string): Promise<CommentData> => {
    try {
      if (!commentId) throw new Error('Comment ID is required');
      if (!content) throw new Error('Comment content is required');
      
      const response = await axios.put(`/v1/comments/${commentId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  /**
   * Delete a comment
   * @param commentId Comment ID to delete
   */
  deleteComment: async (commentId: string): Promise<void> => {
    try {
      if (!commentId) throw new Error('Comment ID is required');
      
      await axios.delete(`/v1/comments/${commentId}`);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
  
  /**
   * Get comment count for a recipe
   * @param recipeId The recipe ID to get comment count for
   */
  getCommentCount: async (recipeId: string): Promise<number> => {
    try {
      if (!recipeId) return 0;
      
      const response = await axios.get(`/v1/comments/${recipeId}/count`);
      return response.data.count || 0;
    } catch (error) {
      console.error('Error getting comment count:', error);
      return 0;
    }
  }
};

export default CommentService; 