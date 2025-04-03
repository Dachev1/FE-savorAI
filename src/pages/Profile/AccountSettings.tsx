import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { FiUser, FiEdit3, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/apiService';
import { AnimatePresence } from 'framer-motion';
import { ProfileCard, TabContainer } from '../../components/common';

// Profile information interface
interface ProfileFormState {
  username: string;
  email: string;
}

// Username change form state interface
interface UsernameFormState {
  newUsername: string;
  password: string;
}

// Form error state interface
interface ErrorState {
  newUsername: string;
  password: string;
}

const AccountSettings: React.FC = () => {
  // Tabs: 'profile', 'username', 'password'
  const [activeTab, setActiveTab] = useState('profile');
  
  // Get authentication context
  const { user, updateUsername, isLoading } = useAuth();
  const toastContext = useToast();
  
  // Helper function for showing toasts
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration?: number) => {
    if (toastContext) {
      toastContext.showToast(message, type, duration);
    }
  }, [toastContext]);
  
  // Profile info state
  const [profile, setProfile] = useState<ProfileFormState>({
    username: '',
    email: ''
  });
  
  // Username change form state
  const [usernameForm, setUsernameForm] = useState<UsernameFormState>({
    newUsername: '',
    password: ''
  });
  
  // Error state
  const [errors, setErrors] = useState<ErrorState>({
    newUsername: '',
    password: ''
  });

  // Initialize profile data from user
  useEffect(() => {
    if (user) {
      setProfile({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);
  
  // Tab change handler
  const handleTabChange = (tab: string) => {
    // Reset errors when changing tabs
    setErrors({
      newUsername: '',
      password: ''
    });
    setActiveTab(tab);
  };
  
  // Username form change handler
  const handleUsernameFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUsernameForm(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Clear error when field is modified
    setErrors(prev => ({ ...prev, [id]: '' }));
  };
  
  // Validate username form
  const validateUsernameForm = (): boolean => {
    let isValid = true;
    const newErrors: ErrorState = {
      newUsername: '',
      password: ''
    };
    
    // Validate new username
    if (!usernameForm.newUsername) {
      newErrors.newUsername = 'Username is required';
      isValid = false;
    } else if (usernameForm.newUsername.length < 3) {
      newErrors.newUsername = 'Username must be at least 3 characters';
      isValid = false;
    } else if (usernameForm.newUsername === profile.username) {
      newErrors.newUsername = 'New username must be different from current username';
      isValid = false;
    }
    
    // Validate password
    if (!usernameForm.password) {
      newErrors.password = 'Password is required to confirm changes';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle username change form submission
  const handleUsernameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateUsernameForm()) {
      return;
    }
    
    // Call API to update username
    const result = await updateUsername(usernameForm.password, usernameForm.newUsername);
    
    if (result.success) {
      // Show success message
      showToast(result.message || 'Username updated successfully', 'success');
      
      // Reset form
      setUsernameForm({
        newUsername: '',
        password: ''
      });
      
      // Switch back to profile tab
      setActiveTab('profile');
    } else {
      // Show error message
      showToast(result.error || 'Failed to update username', 'error');
      
      // Set error if it's related to password
      if (result.error?.toLowerCase().includes('password')) {
        setErrors(prev => ({
          ...prev,
          password: result.error || 'Invalid password'
        }));
      }
    }
  };
  
  // Button style classes
  const buttonClass = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center";
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => handleTabChange('profile')}
          className={`mr-4 py-2 px-1 ${
            activeTab === 'profile'
              ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => handleTabChange('username')}
          className={`mr-4 py-2 px-1 ${
            activeTab === 'username'
              ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
              : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
          }`}
        >
          Change Username
        </button>
      </div>
      
      <AnimatePresence mode="wait">
        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <TabContainer title="Profile Information" icon={<FiUser size={22} />}>
            <div className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <ProfileCard label="Username" value={profile.username} />
                <ProfileCard label="Email" value={profile.email} />
              </div>
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  This information is visible to other users on the platform. To change your email, please contact support.
                </p>
              </div>
            </div>
          </TabContainer>
        )}
        
        {/* Change Username Tab */}
        {activeTab === 'username' && (
          <TabContainer title="Change Username" icon={<FiEdit3 size={22} />}>
            <form onSubmit={handleUsernameSubmit} className="space-y-6">
              <div>
                <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Username
                </label>
                <div className="mt-1">
                  <input
                    id="newUsername"
                    name="newUsername"
                    type="text"
                    autoComplete="username"
                    required
                    value={usernameForm.newUsername}
                    onChange={handleUsernameFormChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.newUsername ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.newUsername && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.newUsername}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password (to verify it's you)
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={usernameForm.password}
                    onChange={handleUsernameFormChange}
                    className={`appearance-none block w-full px-3 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white`}
                  />
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                  )}
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={buttonClass}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-3"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Username"
                  )}
                </button>
              </div>
            </form>
          </TabContainer>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountSettings; 