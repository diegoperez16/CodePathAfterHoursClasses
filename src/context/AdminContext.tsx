import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  adminPassword: string;
  setAdminMode: (password: string) => void;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Simple password - you can change this to whatever you want
const ADMIN_PASSWORD = 'instructor2024';

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const setAdminMode = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setAdminPassword(password);
      localStorage.setItem('adminMode', 'true');
    }
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminPassword('');
    localStorage.removeItem('adminMode');
  };

  return (
    <AdminContext.Provider value={{ isAdmin, adminPassword, setAdminMode, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
