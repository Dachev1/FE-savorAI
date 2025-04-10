import React, { useState, useEffect } from 'react';
import axios from '../../api/axiosConfig';
import { useAuth } from '../../context';
import { FaUser, FaTrash, FaSpinner, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

interface CommentProps {
  id: string;
  content: string;
  userId: string;
  username: string;
  recipeId: string;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
}

interface RecipeCommentsProps {
  recipeId: string;
  isRecipeOwner: boolean;
}

const RecipeComments: React.FC<RecipeCommentsProps> = ({ recipeId, isRecipeOwner }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/v1/recipes/${recipeId}/comments`);
      setComments(response.data.content || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setDeletingCommentId(commentId);
    try {
      await axios.delete(`/v1/recipes/comments/${commentId}`);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 m-4">
          <div className="flex">
            <FaExclamationCircle className="text-red-500 mt-0.5 mr-2" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="p-8 flex justify-center">
          <FaSpinner className="animate-spin text-blue-500 text-xl" />
        </div>
      ) : (
        <>
          {/* Comments list */}
          {comments.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {comments.map(comment => (
                <div key={comment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex justify-between">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
                        <FaUser className="text-blue-500 dark:text-blue-400 text-sm" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {comment.username}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Delete button (only for comment owner or recipe owner) */}
                    {(comment.isOwner || isRecipeOwner) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Delete comment"
                      >
                        {deletingCommentId === comment.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line pl-10">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No comments yet.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecipeComments; 