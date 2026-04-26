import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock user for development
  useEffect(() => {
    // Simulate checking for existing session
    const timer = setTimeout(() => {
      setUser({
        id: 'supplier123',
        name: 'Test Supplier',
        email: 'supplier@example.com',
        role: 'supplier',
        shopName: 'Test Fashion Store',
        status: 'approved'
      });
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const login = async (email, password) => {
    // Mock login
    setUser({
      id: 'supplier123',
      name: 'Test Supplier',
      email: email,
      role: 'supplier',
      shopName: 'Test Fashion Store',
      status: 'approved'
    });
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    return { success: true };
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
