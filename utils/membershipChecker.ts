import { getUsers, saveUsers } from './auth';

export interface MembershipExpiredUser {
  id: string;
  email: string;
  username: string;
  expiredAt: Date;
}

// Check for expired memberships and downgrade them
export const checkExpiredMemberships = (): MembershipExpiredUser[] => {
  const users = getUsers();
  const expiredUsers: MembershipExpiredUser[] = [];
  const now = new Date();
  
  const updatedUsers = users.map(user => {
    // Check if user has premium membership with expiry date
    if (user.membershipType === 'premium' && user.membershipExpiry) {
      const expiry = new Date(user.membershipExpiry);
      
      if (now > expiry) {
        // Membership has expired, downgrade to free
        expiredUsers.push({
          id: user.id,
          email: user.email,
          username: user.username,
          expiredAt: expiry
        });
        
        return {
          ...user,
          membershipType: 'free' as const,
          membershipExpiry: undefined
        };
      }
    }
    
    return user;
  });
  
  // Save updated users if any changes were made
  if (expiredUsers.length > 0) {
    saveUsers(updatedUsers);
    console.log(`Expired ${expiredUsers.length} premium memberships:`, expiredUsers);
  }
  
  return expiredUsers;
};

// Get membership statistics
export const getMembershipStats = () => {
  const users = getUsers();
  const now = new Date();
  
  const stats = {
    total: users.length,
    free: 0,
    premium: 0,
    expired: 0,
    expiringIn7Days: 0,
    expiringIn30Days: 0
  };
  
  users.forEach(user => {
    if (user.membershipType === 'free') {
      stats.free++;
    } else if (user.membershipType === 'premium') {
      if (user.membershipExpiry) {
        const expiry = new Date(user.membershipExpiry);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          stats.expired++;
        } else {
          stats.premium++;
          
          if (daysUntilExpiry <= 7) {
            stats.expiringIn7Days++;
          } else if (daysUntilExpiry <= 30) {
            stats.expiringIn30Days++;
          }
        }
      } else {
        // Lifetime premium
        stats.premium++;
      }
    }
  });
  
  return stats;
};

// Get users expiring soon (for notifications)
export const getUsersExpiringSoon = (days: number = 7) => {
  const users = getUsers();
  const now = new Date();
  const expiringSoon = [];
  
  for (const user of users) {
    if (user.membershipType === 'premium' && user.membershipExpiry) {
      const expiry = new Date(user.membershipExpiry);
      const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry > 0 && daysUntilExpiry <= days) {
        expiringSoon.push({
          ...user,
          daysUntilExpiry
        });
      }
    }
  }
  
  return expiringSoon;
};

// Auto-run membership checker (can be called on app startup)
export const initMembershipChecker = () => {
  // Run immediately
  checkExpiredMemberships();
  
  // Set up interval to check every hour
  const interval = setInterval(() => {
    checkExpiredMemberships();
  }, 60 * 60 * 1000); // 1 hour
  
  // Return cleanup function
  return () => clearInterval(interval);
};

// Manual renewal helper
export const renewMembership = (userId: string, type: 'monthly' | 'yearly'): boolean => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return false;
  }
  
  const now = new Date();
  const expiry = new Date(now);
  
  if (type === 'monthly') {
    expiry.setMonth(expiry.getMonth() + 1);
  } else {
    expiry.setFullYear(expiry.getFullYear() + 1);
  }
  
  users[userIndex] = {
    ...users[userIndex],
    membershipType: 'premium',
    membershipExpiry: expiry
  };
  
  saveUsers(users);
  return true;
}; 