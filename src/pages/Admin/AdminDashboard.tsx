import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { FiEye, FiSlash, FiCopy, FiEdit2, FiCheck, FiX, FiLock, FiUnlock, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/apiService';
import { LoadingSpinner } from '../../components/common';
import { ToastType } from '../../components/common/Toast';
import auth from '../../utils/auth';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  banned: boolean;
  lastLogin?: string;
}

// Helper to ensure banned status is consistently a boolean
const normalizeBannedStatus = (value: any): boolean => {
  // Enhanced parsing - first check string representations
  if (typeof value === 'string') {
    const lowercased = value.toLowerCase();
    return lowercased === 'true' || lowercased === '1' || lowercased === 'yes';
  }
  
  // Then handle direct boolean or number values
  return value === true || value === 1;
};

// Session storage keys
const SESSION_KEYS = {
  ADMIN_ROLE_VERIFIED: 'adminRoleVerified',
  ADMIN_USERS_FETCHED: 'adminUsersFetched',
  ADMIN_USERS_CACHE: 'adminUsersCache',
  ADMIN_USERS_TIMESTAMP: 'adminUsersCacheTimestamp'
} as const;

// Cache expiration time - 2 minutes
const CACHE_EXPIRY = 2 * 60 * 1000;

const ROLE_CHANGES_KEY = 'role_changes';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const { isAdmin, user, logout, refreshUserData } = useAuth();
  const toastContext = useToast();
  const navigate = useNavigate();
  
  // Safe toast function with fallback
  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    if (toastContext) {
      toastContext.showToast(message, type, duration);
    } else {
      console.error('Toast context is undefined, message:', message);
    }
  }, [toastContext]);

  // Enforce backend validation before allowing admin operations
  const validateAdminStatus = useCallback(async () => {
    try {
      // Force token validation refresh
      auth.forceTokenRefresh();
      
      // Check if we still have a valid token
      if (!auth.isTokenValid()) {
        throw new Error('Invalid authentication');
      }
      
      // Wait for user data refresh
      const success = await refreshUserData();
      if (!success) {
        throw new Error('Failed to refresh user data');
      }
      
      // Verify admin status
      if (!isAdmin) {
        throw new Error('You do not have administrator privileges');
      }
      
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Admin validation failed';
      showToast(errorMsg, 'error');
      
      // Force logout if admin validation fails
      logout();
      navigate('/signin');
      return false;
    }
  }, [isAdmin, navigate, logout, showToast, refreshUserData]);

  const fetchUsers = useCallback(async (forceRefresh: boolean = false) => {
    try {
      // Validate admin status before proceeding
      const isValidAdmin = await validateAdminStatus();
      if (!isValidAdmin) {
        return;
      }
      
      setLoading(true);
      
      // Force a token/auth check before making admin requests
      if (!auth.isTokenValid()) {
        throw new Error('Your session has expired');
      }
      
      // Check for valid cache first if not forcing refresh
      if (!forceRefresh) {
        const cacheTimestamp = sessionStorage.getItem(SESSION_KEYS.ADMIN_USERS_TIMESTAMP);
        const cachedUsers = sessionStorage.getItem(SESSION_KEYS.ADMIN_USERS_CACHE);
        
        // Use cache if it exists and is not expired
        if (cacheTimestamp && cachedUsers) {
          const timestamp = parseInt(cacheTimestamp, 10);
          const now = Date.now();
          
          // Cache is still valid (less than 2 minutes old)
          if (now - timestamp < CACHE_EXPIRY) {
            try {
              const parsedUsers = JSON.parse(cachedUsers);
              // Still process the users to ensure banned is a boolean
              const processedUsers = parsedUsers.map((user: any) => ({
                ...user,
                banned: normalizeBannedStatus(user.banned)
              }));
              
              setUsers(processedUsers || []);
              setLoading(false);
              console.log('Using cached user data (age: ' + ((now - timestamp) / 1000).toFixed(1) + 's)');
              return;
            } catch (err) {
              console.error('Error parsing cached users:', err);
              // Continue to fetch from API if parsing fails
            }
          } else {
            console.log('Cache expired, fetching fresh data');
          }
        }
      } else {
        console.log('Force refresh requested, bypassing cache');
      }
      
      // Apply explicit authorization header for admin requests
      const token = auth.getToken();
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Prevent caching of admin requests
        params: {
          '_': Date.now(), // Add timestamp to prevent caching
          'forceRefresh': forceRefresh ? 'true' : 'false'
        }
      };
      
      // Get users from server with enhanced error handling
      const response = await api.get('/api/v1/admin/users', config);
      
      // Validate response data
      if (!response || !response.data) {
        throw new Error('Invalid server response');
      }
      
      console.log('API Response - User Data:', response.data);
      
      // Process the user data to ensure banned is always a boolean
      const processedUsers = response.data.map((user: any) => {
        const isBanned = normalizeBannedStatus(user.banned);
        console.log(`Raw user data for ${user.username}: banned=${user.banned}, type=${typeof user.banned}, parsed=${isBanned}`);
        
        return {
          ...user,
          // Convert banned property to a strict boolean
          banned: isBanned,
          // Store original value for debugging
          bannedType: typeof user.banned
        };
      });
      
      // Log the processed users to verify the banned status is correct
      console.log('Processed Users:', processedUsers);
      
      // Update the cache
      try {
        sessionStorage.setItem(SESSION_KEYS.ADMIN_USERS_CACHE, JSON.stringify(processedUsers));
        sessionStorage.setItem(SESSION_KEYS.ADMIN_USERS_TIMESTAMP, Date.now().toString());
        sessionStorage.setItem(SESSION_KEYS.ADMIN_USERS_FETCHED, 'true');
      } catch (err) {
        console.error('Error caching user data:', err);
      }
      
      // Set users with properly processed banned property
      setUsers(processedUsers || []);
      setLoading(false);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error fetching users';
      showToast(errorMessage, 'error');
      setLoading(false);
    }
  }, [validateAdminStatus, showToast]);

  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmounting
    let isMounted = true;
    
    const checkAndFetchUsers = async () => {
      console.log("====== ADMIN DASHBOARD INITIALIZATION ======");
      
      // Clear user data cache to ensure fresh data
      sessionStorage.removeItem(SESSION_KEYS.ADMIN_USERS_FETCHED);
      sessionStorage.removeItem(SESSION_KEYS.ADMIN_USERS_CACHE);
      sessionStorage.removeItem(SESSION_KEYS.ADMIN_USERS_TIMESTAMP);
      
      // First, ensure the admin role is verified, but only once per session
      if (!sessionStorage.getItem(SESSION_KEYS.ADMIN_ROLE_VERIFIED)) {
        const success = await refreshUserData();
        
        // If the component unmounted during the async operation, abort
        if (!isMounted) return;
        
        // Mark admin role as verified for this session
        if (success && isAdmin) {
          sessionStorage.setItem(SESSION_KEYS.ADMIN_ROLE_VERIFIED, 'true');
        }
        
        // If not admin, redirect and don't fetch users
        if (!isAdmin) {
          showToast('Access denied. You do not have administrator privileges.', 'error');
          navigate('/');
          return;
        }
      } else if (!isAdmin) {
        // If we've verified before but no longer admin
        showToast('Access denied. You do not have administrator privileges.', 'error');
        navigate('/');
        return;
      }
      
      // Always fetch fresh data on component mount
      await fetchUsers(true);
    };
    
    checkAndFetchUsers();
    
    return () => {
      isMounted = false;
    };
  }, [isAdmin, navigate, showToast, refreshUserData, fetchUsers]);

  const handleEditClick = (user: User) => {
    // Don't allow editing banned users
    if (normalizeBannedStatus(user.banned)) {
      showToast("Banned users cannot be edited", "error");
      return;
    }
    
    setEditingUser(user.id);
    setSelectedRole(user.role);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setSelectedRole('');
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
  };

  const handleRoleSave = useCallback(async (userId: string) => {
    try {
      // Validate admin status before proceeding
      const isValidAdmin = await validateAdminStatus();
      if (!isValidAdmin) {
        return;
      }
      
      // Get the user being modified
      const targetUser = users.find(user => user.id === userId);
      if (!targetUser) {
        showToast("User not found", "error");
        return;
      }
      
      // Show confirmation dialog for role changes
      const currentRole = targetUser.role;
      const isRoleDowngrade = 
        (currentRole === 'ADMIN' && selectedRole !== 'ADMIN') || 
        (currentRole === 'MODERATOR' && selectedRole === 'USER');
        
      const roleChangeMessage = isRoleDowngrade 
        ? `Are you sure you want to downgrade user "${targetUser.username}" from ${currentRole} to ${selectedRole}?`
        : `Are you sure you want to change user "${targetUser.username}" role from ${currentRole} to ${selectedRole}?`;
        
      if (!window.confirm(roleChangeMessage)) {
        return;
      }
      
      setActionInProgress(userId);
      
      // Get token for request
      const token = auth.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create request config with auth token
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Send role update request
      const response = await api.put(
        `/api/v1/admin/users/${userId}/role?role=${selectedRole}`, 
        {}, 
        config
      );
      
      // Handle successful response
      if (response.data && response.data.success) {
        showToast(response.data.message || 'Role updated successfully', 'success');
        
        // Clear any cached data
        sessionStorage.removeItem(SESSION_KEYS.ADMIN_USERS_FETCHED);
        
        // Fetch fresh data from server
        await fetchUsers();
        
        // Force a refresh of the user data to ensure roles are in sync
        await refreshUserData();
      } else {
        throw new Error(response.data?.message || 'Failed to update role');
      }
    } catch (error: any) {
      // Handle error
      const errorMessage = error.response?.data?.message || error.message || 'Error updating role';
      showToast(errorMessage, 'error');
    } finally {
      // Reset state
      setEditingUser(null);
      setSelectedRole('');
      setActionInProgress(null);
    }
  }, [selectedRole, showToast, validateAdminStatus, fetchUsers, refreshUserData]);

  // Toggle user ban status with enhanced confirmation
  const handleToggleBan = useCallback(async (userId: string, currentlyBanned: boolean) => {
    try {
      // First validate admin status
      const isValidAdmin = await validateAdminStatus();
      if (!isValidAdmin) {
        return;
      }
      
      // Get the user being banned/unbanned
      const targetUser = users.find(user => user.id === userId);
      if (!targetUser) {
        showToast("User not found", "error");
        return;
      }
      
      // Ensure we have the correct banned status
      const isBanned = normalizeBannedStatus(targetUser.banned);
      
      // Show enhanced confirmation dialog with user details
      const action = isBanned ? 'unban' : 'ban';
      const message = isBanned
        ? `Are you sure you want to UNBAN user "${targetUser.username}" (${targetUser.email})?\n\nThis will restore their access to the platform.`
        : `Are you sure you want to BAN user "${targetUser.username}" (${targetUser.email})?\n\nThis will completely restrict their access to the platform and invalidate all active sessions.`;
        
      if (!window.confirm(message)) {
        return;
      }
      
      setActionInProgress(userId);
      
      // Get token for request
      const token = auth.getToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Create request config
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Send ban toggle request
      const response = await api.put(`/api/v1/admin/users/${userId}/ban`, {}, config);
      
      // Handle successful response
      if (response.data && response.data.success) {
        const actionType = response.data.message.includes('banned') ? 'banned' : 'unbanned';
        showToast(`User ${actionType} successfully`, 'success');
        
        // Clear any cached data
        sessionStorage.removeItem(SESSION_KEYS.ADMIN_USERS_FETCHED);
        sessionStorage.removeItem(SESSION_KEYS.ADMIN_ROLE_VERIFIED);
        
        // Force token refresh first
        auth.forceTokenRefresh();
        
        // Immediately update the UI to show the change while the refresh happens
        setUsers(prev => prev.map(user => {
          if (user.id === userId) {
            return {
              ...user,
              banned: !isBanned
            };
          }
          return user;
        }));
        
        console.log(`User ${targetUser.username} has been ${actionType}. Refreshing data...`);
        
        // Fetch fresh data from server
        await fetchUsers();
      } else {
        throw new Error(response.data?.message || `Failed to ${action} user`);
      }
    } catch (error: any) {
      // Handle error
      const errorMessage = error.response?.data?.message || error.message || 'Error updating ban status';
      showToast(errorMessage, 'error');
    } finally {
      setActionInProgress(null);
    }
  }, [showToast, validateAdminStatus, users, fetchUsers]);

  const handleCopyId = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      navigator.clipboard.writeText(user.id)
        .then(() => showToast('ID copied to clipboard', 'success'))
        .catch(() => showToast('Failed to copy to clipboard', 'error'));
    }
  };
  
  // Toggle ID visibility
  const handleRevealId = (userId: string) => {
    setRevealedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Never';
    return formatDistanceToNow(new Date(lastLogin), { addSuffix: true });
  };

  // Render user rows with enhanced UI and status badges
  const renderUserRows = useCallback(() => {
    return users.map(user => {
      const isBanned = normalizeBannedStatus(user.banned);
      const isEditing = editingUser === user.id;
      const isProcessing = actionInProgress === user.id;
      const isCurrentUser = user?.id === auth.getUser<User>()?.id;
      const isIdRevealed = revealedIds.has(user.id);
      
      // Status badge styling
      const statusBadge = isBanned 
        ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
            <FiSlash className="mr-1 h-3 w-3" /> Banned
          </span>
        : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <FiCheck className="mr-1 h-3 w-3" /> Active
          </span>;
      
      // Role badge styling based on role
      let roleBadge;
      switch(user.role?.toLowerCase()) {
        case 'admin':
        case 'administrator':
          roleBadge = (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Admin
            </span>
          );
          break;
        case 'moderator':
          roleBadge = (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Moderator
            </span>
          );
          break;
        default:
          roleBadge = (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              User
            </span>
          );
      }

      return (
        <tr key={user.id} className={`transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isBanned ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className={`flex-shrink-0 h-10 w-10 ${isBanned ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                {user.username?.substring(0, 1).toUpperCase() || user.email?.substring(0, 1).toUpperCase() || '?'}
              </div>
              <div className="ml-4">
                <div className={`text-sm font-medium ${isBanned ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                  {user.username || 'No username'}{isBanned && ' (Banned)'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{user.email}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm">
            {isIdRevealed ? (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">{user.id}</span>
                <button
                  onClick={() => handleCopyId(user.id)}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  aria-label="Copy ID"
                >
                  <FiCopy className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleRevealId(user.id)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center"
              >
                <FiEye className="h-4 w-4 mr-1" /> Reveal ID
              </button>
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={isProcessing}
                >
                  <option value="USER">User</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleRoleSave(user.id)}
                    className="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    disabled={isProcessing}
                  >
                    <FiCheck className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    disabled={isProcessing}
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div>{roleBadge}</div>
            )}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'Never'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {statusBadge}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex justify-end space-x-2">
              {!isEditing && !isBanned && (
                <button
                  onClick={() => handleEditClick(user)}
                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                  disabled={isProcessing || isCurrentUser}
                  title={isCurrentUser ? "Cannot edit yourself" : "Edit user role"}
                >
                  <FiEdit2 className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => handleToggleBan(user.id, isBanned)}
                className={`p-1 rounded-full transition-colors ${
                  isBanned 
                    ? "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30" 
                    : "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                }`}
                disabled={isProcessing || isCurrentUser}
                title={isCurrentUser ? "Cannot ban yourself" : isBanned ? "Unban user" : "Ban user"}
              >
                {isBanned ? <FiUnlock className="h-5 w-5" /> : <FiLock className="h-5 w-5" />}
              </button>
            </div>
          </td>
        </tr>
      );
    });
  }, [users, editingUser, actionInProgress, revealedIds, selectedRole, handleRoleSave, handleCancelEdit, handleEditClick, handleToggleBan, handleRevealId, handleCopyId]);

  // Improve the forceRefresh function to ensure complete cache clearing
  const forceRefresh = useCallback(async () => {
    try {
      setLoading(true);
      console.log("===== FORCE REFRESH STARTED =====");
      
      // Validate admin status before proceeding
      const isValidAdmin = await validateAdminStatus();
      if (!isValidAdmin) {
        return;
      }
      
      // Reset users state
      setUsers([]);
      
      // Force token refresh first
      auth.forceTokenRefresh();
      
      // Clear ALL session data related to admin users
      console.log("Clearing all admin user cache data");
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('admin') || key.includes('user')) {
          console.log(`Clearing sessionStorage item: ${key}`);
          sessionStorage.removeItem(key);
        }
      });
      
      // Also clear localStorage cache if any exists
      Object.keys(localStorage).forEach(key => {
        if (key.includes('user') || key.includes('admin')) {
          console.log(`Clearing localStorage item: ${key}`);
          localStorage.removeItem(key);
        }
      });
      
      // Force role refresh
      await refreshUserData();
      
      // Fetch fresh data (passing true to force API refresh)
      await fetchUsers(true);
      
      showToast('User list refreshed', 'success');
      console.log("===== FORCE REFRESH COMPLETED =====");
    } catch (error) {
      console.error("Error during force refresh:", error);
      showToast('Failed to refresh user list', 'error');
    } finally {
      setLoading(false);
    }
  }, [refreshUserData, showToast, validateAdminStatus, fetchUsers]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg mb-8 p-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">
            Admin Dashboard
          </h1>
          <div className="flex space-x-4">
            <button 
              onClick={forceRefresh}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-indigo-700 font-medium rounded-lg shadow transition-colors duration-200 flex items-center"
            >
              <FiClock className="mr-2" />
              Refresh Users
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{users.length}</h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Admin Users</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {users.filter(user => user.role === 'ADMIN' || user.role === 'admin').length}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Banned Users</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {users.filter(user => normalizeBannedStatus(user.banned)).length}
              </h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <FiSlash className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-10 border border-gray-200 dark:border-gray-700 flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '25%'}}>
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '15%'}}>
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '18%'}}>
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '12%'}}>
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '12%'}}>
                    Last Login
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '10%'}}>
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" style={{width: '8%'}}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {renderUserRows()}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 