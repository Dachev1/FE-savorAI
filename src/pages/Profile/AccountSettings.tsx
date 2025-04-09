import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, useMemo } from 'react';
import { FiUser, FiEdit3 } from 'react-icons/fi';
import { useAuth, useToast } from '../../context';
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

type TabType = 'profile' | 'username';

const TABS: Array<{id: TabType, label: string, icon: React.ReactNode}> = [
  { id: 'profile', label: 'Profile', icon: <FiUser size={22} /> },
  { id: 'username', label: 'Change Username', icon: <FiEdit3 size={22} /> }
];

const AccountSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  const { user, updateUsername, isLoading, fetchUserProfile } = useAuth();
  const toastContext = useToast();
  
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration?: number) => {
    if (toastContext) {
      toastContext.showToast(message, type, duration);
    }
  }, [toastContext]);
  
  const [profile, setProfile] = useState<ProfileFormState>({
    username: '',
    email: ''
  });
  
  const [usernameForm, setUsernameForm] = useState<UsernameFormState>({
    newUsername: '',
    password: ''
  });
  
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
  
  const resetForms = useCallback(() => {
    setUsernameForm({ newUsername: '', password: '' });
    setErrors({ newUsername: '', password: '' });
  }, []);
  
  const handleTabChange = useCallback((tab: TabType) => {
    resetForms();
    setActiveTab(tab);
  }, [resetForms]);
  
  const handleUsernameFormChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUsernameForm(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: '' }));
  }, []);
  
  const validateUsernameForm = useCallback((): boolean => {
    let isValid = true;
    const newErrors: ErrorState = { newUsername: '', password: '' };
    
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
    
    if (!usernameForm.password) {
      newErrors.password = 'Password is required to confirm changes';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  }, [usernameForm, profile.username]);
  
  const handleUsernameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateUsernameForm()) return;
    
    const result = await updateUsername(usernameForm.password, usernameForm.newUsername);
    
    if (result.success) {
      showToast(result.message || 'Username updated successfully', 'success');
      resetForms();
      setActiveTab('profile');
    } else {
      showToast(result.error || 'Failed to update username', 'error');
      
      if (result.error?.toLowerCase().includes('password')) {
        setErrors(prev => ({ ...prev, password: result.error || 'Invalid password' }));
      }
    }
  };
  
  // Memoized UI components
  const buttonClass = useMemo(() => "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center", []);
  
  const inputClass = useCallback((error: string) => `appearance-none block w-full px-3 py-2 border ${
    error ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white`, []);
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h1>
      
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`mr-4 py-2 px-1 ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <TabContainer title="Profile Information" icon={<FiUser size={22} />}>
            <div className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2 flex-grow">
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
                    className={inputClass(errors.newUsername)}
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
                    className={inputClass(errors.password)}
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
                  {isLoading ? 'Updating...' : 'Update Username'}
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