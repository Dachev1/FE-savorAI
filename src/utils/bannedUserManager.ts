import { storage } from './storage';

const BANNED_USERS_KEY = 'banned_users';

interface BannedUser {
  userId: string;
  username: string;
  reason?: string;
  bannedAt: number;
  expiresAt?: number;
}

export const bannedUserManager = {
  /**
   * Get all banned users
   */
  getBannedUsers: (): BannedUser[] => {
    return storage.getItem<BannedUser[]>(BANNED_USERS_KEY) || [];
  },

  /**
   * Add a user to the banned list
   */
  banUser: (
    userId: string, 
    username: string, 
    reason?: string, 
    duration?: number
  ): void => {
    const bannedUsers = bannedUserManager.getBannedUsers();
    
    // Create banned user object
    const bannedUser: BannedUser = {
      userId,
      username,
      reason,
      bannedAt: Date.now(),
      expiresAt: duration ? Date.now() + duration : undefined
    };
    
    // Check if user is already banned
    const existingIndex = bannedUsers.findIndex(u => u.userId === userId);
    
    if (existingIndex >= 0) {
      // Update existing ban
      bannedUsers[existingIndex] = bannedUser;
    } else {
      // Add new ban
      bannedUsers.push(bannedUser);
    }
    
    storage.setItem(BANNED_USERS_KEY, bannedUsers);
  },

  /**
   * Remove a user from the banned list
   */
  unbanUser: (userId: string): void => {
    const bannedUsers = bannedUserManager.getBannedUsers();
    const filteredUsers = bannedUsers.filter(u => u.userId !== userId);
    storage.setItem(BANNED_USERS_KEY, filteredUsers);
  },

  /**
   * Check if a user is banned
   */
  isUserBanned: (userId: string): boolean => {
    const bannedUsers = bannedUserManager.getBannedUsers();
    const bannedUser = bannedUsers.find(u => u.userId === userId);
    
    if (!bannedUser) return false;
    
    // Check if ban has expired
    if (bannedUser.expiresAt && bannedUser.expiresAt < Date.now()) {
      // Ban expired, remove user from list
      bannedUserManager.unbanUser(userId);
      return false;
    }
    
    return true;
  },

  /**
   * Clean up expired bans
   */
  cleanupExpiredBans: (): void => {
    const bannedUsers = bannedUserManager.getBannedUsers();
    const currentTime = Date.now();
    
    const validBans = bannedUsers.filter(user => {
      // Keep permanent bans (no expiration) and non-expired bans
      return !user.expiresAt || user.expiresAt > currentTime;
    });
    
    storage.setItem(BANNED_USERS_KEY, validBans);
  }
}; 