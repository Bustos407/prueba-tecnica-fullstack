import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from './client';

interface UserRoleContextType {
  userRole: string | null;
  isLoading: boolean;
  refreshRole: () => Promise<void>;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

export const useUserRole = () => {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider');
  }
  return context;
};

interface UserRoleProviderProps {
  children: ReactNode;
}

export const UserRoleProvider: React.FC<UserRoleProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifyAndSetRole = async () => {
    // Si no hay sesión de Better Auth, verificar si hay sesión de prueba
    if (!session?.user) {
      try {
        const response = await fetch('/api/auth/check-test-session');
        const data = await response.json();
        
        if (data.authenticated) {
          setUserRole('USER');
          setIsLoading(false);
          return;
        } else {
          setUserRole(null);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error al verificar sesión de prueba:', error);
        setUserRole(null);
        setIsLoading(false);
        return;
      }
    }

    // Verificar si es una sesión de prueba (no usar debug-session para estas)
    const isTestSession = session.user.email === 'test-user@example.com';
    
    if (isTestSession) {
      setUserRole('USER');
      setIsLoading(false);
      return;
    }

    try {
      // Para usuarios de GitHub, usar el rol de la sesión directamente
      const userRole = (session.user as any)?.role || 'ADMIN';
      setUserRole(userRole);
    } catch (error) {
      console.error('Error al verificar rol:', error);
      const fallbackRole = (session.user as any)?.role || 'ADMIN';
      setUserRole(fallbackRole);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRole = async () => {
    setIsLoading(true);
    await verifyAndSetRole();
  };

  useEffect(() => {
    verifyAndSetRole();
  }, [session]);

  const value = {
    userRole,
    isLoading,
    refreshRole
  };

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  );
}; 