import api from '../api/apiService';

export interface Comment {
  id: string;
  content: string;
  userId: string;
  username: string;
  recipeId: string;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
}

export interface CommentRequest {
  content: string;
}

export interface CommentResponse {
  content: Comment[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

class CommentService {
  /**
   * Get all comments for a recipe
   */
  async getComments(recipeId: string, page = 0, size = 10): Promise<CommentResponse> {
    try {
      const response = await api.get(`/api/v1/recipes/${recipeId}/comments`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  /**
   * Add a comment to a recipe
   */
  async addComment(recipeId: string, content: string): Promise<Comment> {
    try {
      const response = await api.post(`/api/v1/recipes/${recipeId}/comments`, {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Update a comment
   */
  async updateComment(recipeId: string, commentId: string, content: string): Promise<Comment> {
    try {
      const response = await api.put(`/api/v1/recipes/${recipeId}/comments/${commentId}`, {
        content
      });
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(recipeId: string, commentId: string): Promise<void> {
    try {
      await api.delete(`/api/v1/recipes/${recipeId}/comments/${commentId}`);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }
}

export default new CommentService(); 