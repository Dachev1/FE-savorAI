import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context';
import axios from '../../api/axiosConfig';
import { recipeServiceAxios } from '../../api/axiosConfig';
import { FaUser, FaClock, FaTrash, FaPaperPlane } from 'react-icons/fa';

interface Comment {
  id: string;
  content: string;
  userId: string;
  username: string;
  createdAt: string;
}

interface CommentListProps {
  recipeId: string;
  authorId?: string;
}

const CommentList: React.FC<CommentListProps> = ({ recipeId, authorId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if current user is the recipe owner
  const isRecipeOwner = user && authorId && user.id === authorId;

  // Fetch comments for the recipe
  const fetchComments = useCallback(async () => {
    if (!recipeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await recipeServiceAxios.get(`/api/v1/recipes/${recipeId}/comments`);
      setComments(response.data || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Unable to load comments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [recipeId]);

  // Load comments on component mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Submit a new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('You must be signed in to comment.');
      return;
    }
    
    if (isRecipeOwner) {
      setError('You cannot comment on your own recipe.');
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await recipeServiceAxios.post(`/api/v1/recipes/${recipeId}/comments`, {
        content: newComment.trim()
      });
      
      // Add the new comment to the list
      setComments(prevComments => [response.data, ...prevComments]);
      
      // Clear the input
      setNewComment('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
      setError('Failed to submit your comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated) return;
    
    try {
      await recipeServiceAxios.delete(`/api/v1/recipes/comments/${commentId}`);
      
      // Remove the deleted comment from the list
      setComments(prevComments => 
        prevComments.filter(comment => comment.id !== commentId)
      );
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mt-8">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
        <h3 className="text-lg font-semibold text-white">Comments</h3>
      </div>
      
      {/* Comment form */}
      {isAuthenticated && !isRecipeOwner ? (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmitComment} className="flex flex-col">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 dark:text-white resize-none"
              rows={3}
              disabled={isSubmitting}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  !newComment.trim() || isSubmitting
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } transition-colors`}
              >
                <FaPaperPlane className="mr-2" />
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      ) : isRecipeOwner ? (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
          <p>You cannot comment on your own recipe</p>
        </div>
      ) : (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400">Please sign in to leave a comment</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mx-4 my-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}
      
      {/* Comments list */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div 
                key={comment.id} 
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                      <FaUser className="text-blue-500" />
                    </div>
                    <div className="ml-2">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {comment.username}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <FaClock className="mr-1" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete button for user's own comments or recipe owner */}
                  {user && (user.id === comment.userId || recipeId === user.id) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete comment"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentList; 