import React, { useState, useEffect, useCallback } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { FiUser, FiEdit3 } from 'react-icons/fi';
import { useAuth, useToast } from '../../context';
import { AnimatePresence } from 'framer-motion';
import { ProfileCard, TabContainer } from '../../components/common';
import auth from '../../utils/auth';

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

const TABS = [
  { id: 'profile' as TabType, label: 'Profile', icon: <FiUser size={22} /> },
  { id: 'username' as TabType, label: 'Change Username', icon: <FiEdit3 size={22} /> }
];

const AccountSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  
  const { user, updateUsername } = useAuth();
  const { showToast } = useToast();
  
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
    
    // Show toast notification when user enters the Change Username tab
    if (tab === 'username') {
      showToast('Enter your new username and current password to update your profile', 'info');
    }
  }, [resetForms, showToast]);
  
  const handleUsernameFormChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUsernameForm(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: '' }));
  }, []);
  
  const handleUsernameSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: ErrorState = { newUsername: '', password: '' };
    let isValid = true;
    
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
      newErrors.password = 'Password is required';
      isValid = false;
    }
    
    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const oldUsername = user?.username;
    const newUsername = usernameForm.newUsername;

    // Create a redirect overlay
    const showOverlay = () => {
      if (document.getElementById('redirect-overlay')) return;
      
      const overlay = document.createElement('div');
      overlay.id = 'redirect-overlay';
      overlay.className = 'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/70 text-white text-lg text-center p-5';
      
      const message = document.createElement('div');
      message.innerHTML = 'Username successfully updated!<br>Redirecting to login page...';
      
      const spinner = document.createElement('div');
      spinner.className = 'w-10 h-10 my-5 mx-auto rounded-full border-4 border-white/30 border-t-blue-500 animate-spin';
      
      overlay.appendChild(message);
      overlay.appendChild(spinner);
      document.body.appendChild(overlay);
    };
    
    const removeOverlay = () => {
      const overlay = document.getElementById('redirect-overlay');
      if (overlay) document.body.removeChild(overlay);
    };

    try {
      showOverlay();
      const result = await updateUsername(usernameForm.password, newUsername);
      
      if (result.success) {
        showToast(`Username changed from "${oldUsername}" to "${newUsername}". You will need to log in again.`, "success", 5000);
        resetForms();
        
        if (result.requiresRelogin) {
          // Use a shorter delay for better UX
          setTimeout(() => {
            sessionStorage.setItem('username_changed', 'true');
            sessionStorage.removeItem('username_change_in_progress');
            window.location.href = '/signin';
          }, 800);
        } else {
          removeOverlay();
          setActiveTab('profile');
        }
      } else {
        removeOverlay();
        showToast(result.error || "Failed to update username", "error");
      }
    } catch (error: any) {
      removeOverlay();
      
      // Handle cancelled requests specifically
      if (error.isCancel || error.isCancelled) {
        showToast("Your request was cancelled. Please try again.", "warning");
      } else {
        showToast(error.message || "An unexpected error occurred", "error");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // UI component classes
  const buttonClass = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center";
  
  const inputClass = useCallback((error: string) => 
    `appearance-none block w-full px-3 py-2 border ${
      error ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white`, 
  []);
  
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
                  disabled={loading}
                  className={buttonClass}
                >
                  {loading ? 'Updating...' : 'Update Username'}
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