import React, { useState, useEffect, useCallback } from 'react';
import { FaComment, FaEdit, FaTrash } from 'react-icons/fa';
import commentService, { Comment } from '../../services/CommentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface CommentListProps {
  recipeId: string;
}

const CommentList: React.FC<CommentListProps> = ({ recipeId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  
  const fetchComments = useCallback(async () => {
    if (!showComments || !recipeId) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await commentService.getComments(recipeId, currentPage);
      setComments(result.content);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [recipeId, currentPage, showComments]);
  
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);
  
  const toggleComments = () => {
    setShowComments(prev => !prev);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    try {
      const addedComment = await commentService.addComment(recipeId, newComment);
      setComments(prev => [addedComment, ...prev]);
      setNewComment('');
      showToast('Comment added successfully', 'success');
    } catch (err) {
      showToast('Failed to add comment', 'error');
      console.error(err);
    }
  };
  
  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };
  
  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    try {
      const updatedComment = await commentService.updateComment(recipeId, commentId, editContent);
      setComments(prev => prev.map(c => c.id === commentId ? updatedComment : c));
      setEditingComment(null);
      setEditContent('');
      showToast('Comment updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update comment', 'error');
      console.error(err);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await commentService.deleteComment(recipeId, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      showToast('Comment deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete comment', 'error');
      console.error(err);
    }
  };
  
  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <button 
        onClick={toggleComments}
        className="flex items-center text-blue-600 mb-4 hover:text-blue-800 transition"
      >
        <FaComment className="mr-2" />
        {showComments ? 'Hide Comments' : 'Show Comments'}
      </button>
      
      {showComments && (
        <div className="space-y-4">
          {isAuthenticated && (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex flex-col">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md self-end hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Post Comment
                </button>
              </div>
            </form>
          )}
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : comments.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingComment(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <div className="font-medium text-blue-800 dark:text-blue-300">{comment.username}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.content}</p>
                      {comment.isOwner && (
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditComment(comment)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="Edit comment"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-800"
                            aria-label="Delete comment"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === i
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentList; 