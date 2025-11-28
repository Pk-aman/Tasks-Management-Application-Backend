// In-memory data store (replaces database)
export const users = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      password: '$2a$10$X8qHvJ5K.rZ9Y7fZ7Z7Z7O7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7', // 'admin123'
      role: 'admin',
    },
    {
      id: '2',
      name: 'Normal User',
      email: 'user@example.com',
      password: '$2a$10$X8qHvJ5K.rZ9Y7fZ7Z7Z7O7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7Z7', // 'user123'
      role: 'user',
    },
  ];
  
  // Store OTPs temporarily (in production, use Redis)
  export const otpStore = new Map();
  
  // Store refresh tokens (in production, use Redis or database)
  export const refreshTokenStore = new Map();
  
  // Helper functions
  export const findUserByEmail = (email) => {
    return users.find(user => user.email === email);
  };
  
  export const findUserById = (id) => {
    return users.find(user => user.id === id);
  };
  
  export const createUser = (userData) => {
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      role: userData.role || 'user',
    };
    users.push(newUser);
    return newUser;
  };
  
  export const updateUserPassword = (email, newPassword) => {
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      return users[userIndex];
    }
    return null;
  };
  
  // OTP Management
  export const saveOTP = (email, otp, expiresIn = 5 * 60 * 1000) => {
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + expiresIn,
    });
  };
  
  export const getOTP = (email) => {
    return otpStore.get(email);
  };
  
  export const deleteOTP = (email) => {
    otpStore.delete(email);
  };
  
  // Refresh Token Management
  export const saveRefreshToken = (userId, token) => {
    if (!refreshTokenStore.has(userId)) {
      refreshTokenStore.set(userId, []);
    }
    refreshTokenStore.get(userId).push(token);
  };
  
  export const findRefreshToken = (userId, token) => {
    const tokens = refreshTokenStore.get(userId);
    return tokens ? tokens.includes(token) : false;
  };
  
  export const deleteRefreshToken = (userId, token) => {
    const tokens = refreshTokenStore.get(userId);
    if (tokens) {
      const filteredTokens = tokens.filter(t => t !== token);
      refreshTokenStore.set(userId, filteredTokens);
    }
  };
  