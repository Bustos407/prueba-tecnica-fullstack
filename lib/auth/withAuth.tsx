import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession } from './client';
import { useUserRole } from './UserRoleContext';

interface WithAuthProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
}

export const withAuth = (Component: React.ComponentType<any>, requiredRole?: 'USER' | 'ADMIN') => {
  return function AuthenticatedComponent(props: any) {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const { userRole, isLoading: roleLoading } = useUserRole();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const [testSession, setTestSession] = useState(null);

    useEffect(() => {
      const checkAuth = async () => {
        if (!isPending && !hasChecked) {
          setHasChecked(true);
          
          // Si no hay sesión de Better Auth, verificar sesión de prueba
          if (!session) {
            try {
              const response = await fetch('/api/auth/check-test-session');
              const data = await response.json();
              
              if (data.authenticated) {
                setTestSession(data.user);
                
                // Verificar si el usuario tiene el rol requerido
                if (requiredRole && data.user.role !== requiredRole) {
                  router.push('/');
                  return;
                }
                
                setIsAuthorized(true);
                return;
              } else {
                router.push('/');
                return;
              }
            } catch (error) {
              console.error('Error al verificar sesión de prueba:', error);
              router.push('/');
              return;
            }
          }
          
          // Verificar si el usuario tiene el rol requerido (Better Auth)
          const effectiveUserRole = userRole || (session.user as any)?.role;
          
          if (requiredRole && effectiveUserRole !== requiredRole) {
            router.push('/');
            return;
          }
          
          setIsAuthorized(true);
        }
      };

      checkAuth();
    }, [session, isPending, router, requiredRole, hasChecked, userRole, roleLoading]);

    if (isPending || roleLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      );
    }

    if (!isAuthorized && hasChecked) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Redirigiendo...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}; 