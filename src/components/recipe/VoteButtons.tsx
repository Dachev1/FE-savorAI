import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useAuth } from '../../context';
import VoteService, { VoteType } from '../../api/voteService';

interface VoteButtonsProps {
  recipeId: string;
  authorId: string;
  upvotes?: number;
  downvotes?: number;
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
  size?: 'small' | 'medium' | 'large';
  onVoteChange?: (updatedVote: { upvotes: number, downvotes: number, userVote: 'UPVOTE' | 'DOWNVOTE' | null }) => void;
  className?: string;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({
  recipeId,
  authorId,
  upvotes = 0,
  downvotes = 0,
  userVote = null,
  size = 'medium',
  onVoteChange,
  className = '',
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);
  const [localUserVote, setLocalUserVote] = useState(userVote);

  const isAuthor = user && user.id === authorId;

  const sizeClasses = {
    small: { container: 'text-xs', button: 'px-1.5 py-0.5', icon: 'text-xs' },
    medium: { container: 'text-sm', button: 'px-3 py-1.5', icon: 'text-base' },
    large: { container: 'text-base', button: 'px-4 py-2', icon: 'text-lg' },
  };

  const handleVote = async (voteType: VoteType) => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (isAuthor) {
      alert('You cannot vote on your own recipe');
      return;
    }

    try {
      setIsVoting(true);
      console.log(`[DEBUG] Starting vote on recipe ${recipeId}, type: ${voteType}, current upvotes: ${localUpvotes}, downvotes: ${localDownvotes}`);
      
      // Determine vote action type
      const isToggle = (voteType === VoteType.UP && localUserVote === 'UPVOTE') || 
                     (voteType === VoteType.DOWN && localUserVote === 'DOWNVOTE');
      const isChangeDirection = localUserVote && !isToggle;
      
      console.log(`[DEBUG] Vote analysis - isToggle: ${isToggle}, isChangeDirection: ${isChangeDirection}, current userVote: ${localUserVote}`);
      
      // Calculate new state values
      let newUpvotes = localUpvotes;
      let newDownvotes = localDownvotes;
      let newUserVote = localUserVote;
      
      // Update local vote counts based on the action
      if (isToggle) {
        // User is turning off their vote
        if (voteType === VoteType.UP) {
          newUpvotes = Math.max(0, newUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, newDownvotes - 1);
        }
        newUserVote = null;
        console.log(`[DEBUG] Toggling vote OFF, new counts: up ${newUpvotes}, down ${newDownvotes}`);
      } 
      else if (isChangeDirection) {
        // User is changing vote direction
        if (voteType === VoteType.UP) {
          newUpvotes = Math.max(0, newUpvotes + 1);
          newDownvotes = Math.max(0, newDownvotes - 1);
        } else {
          newDownvotes = Math.max(0, newDownvotes + 1);
          newUpvotes = Math.max(0, newUpvotes - 1);
        }
        newUserVote = voteType === VoteType.UP ? 'UPVOTE' : 'DOWNVOTE';
        console.log(`[DEBUG] Changing vote direction, new counts: up ${newUpvotes}, down ${newDownvotes}`);
      } 
      else {
        // New vote
        if (voteType === VoteType.UP) {
          newUpvotes = Math.max(0, newUpvotes + 1);
        } else {
          newDownvotes = Math.max(0, newDownvotes + 1);
        }
        newUserVote = voteType === VoteType.UP ? 'UPVOTE' : 'DOWNVOTE';
        console.log(`[DEBUG] New vote, new counts: up ${newUpvotes}, down ${newDownvotes}`);
      }
      
      // Update local state optimistically
      setLocalUpvotes(newUpvotes);
      setLocalDownvotes(newDownvotes);
      setLocalUserVote(newUserVote);
      
      if (onVoteChange) {
        onVoteChange({ upvotes: newUpvotes, downvotes: newDownvotes, userVote: newUserVote });
      }
      
      // Call API
      console.log(`[DEBUG] Calling API to vote on recipe ${recipeId}`);
      const updated = await VoteService.voteRecipe(recipeId, voteType);
      console.log(`[DEBUG] API response:`, updated);
      
      // Update with server response
      const serverUpvotes = updated.upvotes || 0;
      const serverDownvotes = updated.downvotes || 0;
      const serverUserVote = updated.userVote || null;
      
      setLocalUpvotes(serverUpvotes);
      setLocalDownvotes(serverDownvotes);
      setLocalUserVote(serverUserVote);
      
      console.log(`[DEBUG] Updated state from server: up ${serverUpvotes}, down ${serverDownvotes}, userVote: ${serverUserVote}`);
      
      if (onVoteChange) {
        onVoteChange({
          upvotes: serverUpvotes,
          downvotes: serverDownvotes,
          userVote: serverUserVote
        });
      }
    } catch (err) {
      console.error('Error voting:', err);
      
      // Revert to original values on error
      setLocalUpvotes(upvotes);
      setLocalDownvotes(downvotes);
      setLocalUserVote(userVote);
      
      if (onVoteChange) {
        onVoteChange({ upvotes, downvotes, userVote });
      }
      
      alert('Failed to vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  if (isAuthor || !user) {
    return (
      <div className={`flex items-center gap-3 ${sizeClasses[size].container} ${className}`}>
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <FaArrowUp className="text-green-600 dark:text-green-400" />
          <span>{localUpvotes}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <FaArrowDown className="text-red-600 dark:text-red-400" />
          <span>{localDownvotes}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button 
        onClick={() => handleVote(VoteType.UP)}
        disabled={isVoting}
        className={`flex items-center gap-2 ${sizeClasses[size].button} rounded-l-lg border ${
          localUserVote === 'UPVOTE'
            ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-600 dark:text-green-300'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600'
        } transition-colors`}
        aria-label="Up"
      >
        <FaArrowUp className={`${sizeClasses[size].icon} ${localUserVote === 'UPVOTE' ? 'text-green-600 dark:text-green-400' : ''}`} />
        <span>{localUpvotes}</span>
      </button>
      <button 
        onClick={() => handleVote(VoteType.DOWN)}
        disabled={isVoting}
        className={`flex items-center gap-2 ${sizeClasses[size].button} rounded-r-lg border ${
          localUserVote === 'DOWNVOTE'
            ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-600 dark:text-red-300'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600'
        } transition-colors`}
        aria-label="Down"
      >
        <FaArrowDown className={`${sizeClasses[size].icon} ${localUserVote === 'DOWNVOTE' ? 'text-red-600 dark:text-red-400' : ''}`} />
        <span>{localDownvotes}</span>
      </button>
    </div>
  );
};

export default VoteButtons; 