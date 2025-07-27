import { useRouter } from 'next/router';
import { useSession } from '@/lib/auth/client';
import { signIn, signOut } from '@/lib/auth/client';
import { UserInfo } from '@/components/UserInfo';
import { AccessDeniedModal } from '@/components/AccessDeniedModal';
import { useState, useEffect } from 'react';
import { useUserRole } from '@/lib/auth/UserRoleContext';

const Home = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [deniedFeature, setDeniedFeature] = useState('');
  const [testSession, setTestSession] = useState(null);
  const [isCheckingTestSession, setIsCheckingTestSession] = useState(false);

  // Usar el contexto global para el rol
  const { userRole } = useUserRole();

  const handleSignIn = async () => {
    try {
      await signIn.social({ provider: 'github' });
    } catch {
      // Error handling
    }
  };

  const handleTestUserLogin = async () => {
    try {
      // Usar el endpoint personalizado que crea la sesión y redirige
      window.location.href = '/api/auth/test-login';
    } catch (error) {
      alert(
        'Error al iniciar sesión: ' +
          (error instanceof Error ? error.message : 'Error desconocido')
      );
    }
  };

  // Verificar sesión de prueba al cargar la página
  useEffect(() => {
    const checkTestSession = async () => {
      // Solo verificar sesión de prueba si no hay sesión de Better Auth y no estamos cargando
      if (!session && !isPending && !testSession) {
        setIsCheckingTestSession(true);
        try {
          const response = await fetch('/api/auth/check-test-session');
          const data = await response.json();

          if (data.authenticated) {
            setTestSession(data.user);
          }
        } catch {
          // Error handling
        } finally {
          setIsCheckingTestSession(false);
        }
      } else if (session && testSession) {
        // Limpiar sesión de prueba si hay sesión de Better Auth
        setTestSession(null);
      }
    };

    checkTestSession();
  }, [session, isPending, testSession]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);

      // Si hay sesión de Better Auth, usar su método de logout
      if (session) {
        await signOut();
        // Better Auth maneja la redirección automáticamente
      } else if (testSession) {
        // Si hay sesión de prueba, usar el endpoint personalizado
        window.location.href = '/api/auth/logout-test';
      } else {
        setIsSigningOut(false);
      }
    } catch {
      setIsSigningOut(false);
    }
  };

  const menuItems = [
    {
      title: 'Gestión de Ingresos y Gastos',
      description: 'Visualiza y administra ingresos y egresos',
      href: '/transactions',
      availableFor: ['USER', 'ADMIN'],
      icon: '💰',
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administra usuarios del sistema',
      href: '/users',
      availableFor: ['ADMIN'],
      icon: '👥',
    },
    {
      title: 'Reportes',
      description: 'Visualiza reportes financieros',
      href: '/reports',
      availableFor: ['ADMIN'],
      icon: '📊',
    },
  ];

  if (isPending || isCheckingTestSession) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' />
          <p className='mt-4 text-gray-600'>Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay sesión de Better Auth ni de prueba, mostrar página de login
  if (!session && !testSession) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4'>
        <div className='max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-200'>
          <div className='text-center'>
            <div className='mb-6'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl text-white'>💰</span>
              </div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                Sistema de Gestión Financiera
              </h1>
              <p className='text-gray-600'>Inicia sesión para continuar</p>
            </div>

            <button
              onClick={handleSignIn}
              className='w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3 mb-6'
            >
              <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z'
                  clipRule='evenodd'
                />
              </svg>
              Continuar con GitHub
            </button>

            <div className='pt-6 border-t border-gray-200'>
              <p className='text-sm text-gray-600 mb-4 font-medium'>
                ¿Quieres probar el sistema con permisos limitados?
              </p>
              <button
                onClick={handleTestUserLogin}
                className='w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3'
              >
                <svg
                  className='w-6 h-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
                Acceder como Usuario (Rol USER)
              </button>
              <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-xs text-blue-700 text-center font-medium'>
                  ⚠️ Solo podrás acceder a la gestión de movimientos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usar el rol del contexto global, con fallback para sesiones de prueba
  const effectiveUserRole =
    userRole || (testSession as { role?: string } | null)?.role || 'USER';

  // Mostrar todas las opciones del menú, pero con indicadores de permisos
  const availableMenuItems = menuItems.map((item) => {
    const hasAccess = item.availableFor.includes(effectiveUserRole);
    const isRestricted = !item.availableFor.includes(effectiveUserRole);

    return {
      ...item,
      hasAccess,
      isRestricted,
    };
  });

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-gray-900'>
                Sistema de Gestión Financiera
              </h1>
            </div>
            <div className='flex items-center gap-4'>
              <div className='text-sm text-gray-600'>
                <span className='font-medium'>
                  {session?.user?.name ||
                    (testSession as { name?: string } | null)?.name ||
                    'Usuario'}
                </span>
                <span className='ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                  {effectiveUserRole}
                </span>
              </div>

              <button
                onClick={handleSignOut}
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                disabled={isSigningOut}
              >
                {isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* User Info */}
        <UserInfo />

        {/* Menu Items */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {availableMenuItems.map((item) => (
            <div
              key={item.href}
              onClick={() => {
                if (item.hasAccess) {
                  router.push(item.href);
                } else {
                  setDeniedFeature(item.title);
                  setShowAccessDenied(true);
                }
              }}
              className={`group relative bg-white rounded-xl shadow-lg p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 ${
                item.hasAccess
                  ? 'hover:shadow-2xl border-blue-200 hover:border-blue-400'
                  : 'border-gray-200 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Hover effect overlay */}
              {item.hasAccess && (
                <div className='absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              )}

              <div className='relative z-10'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center'>
                    <span className='text-4xl mr-4 transform group-hover:scale-110 transition-transform duration-200'>
                      {item.icon}
                    </span>
                    <h3 className='text-xl font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200'>
                      {item.title}
                    </h3>
                  </div>
                  {item.isRestricted && (
                    <span className='text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium'>
                      Solo ADMIN
                    </span>
                  )}
                </div>
                <p className='text-gray-600 mb-4 leading-relaxed'>
                  {item.description}
                </p>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center text-sm'>
                    <span
                      className={`px-3 py-1 rounded-full font-medium transition-all duration-200 ${
                        item.hasAccess
                          ? 'bg-green-100 text-green-800 group-hover:bg-green-200'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.hasAccess
                        ? '✅ Acceso permitido'
                        : '❌ Acceso restringido'}
                    </span>
                  </div>
                  {item.hasAccess ? (
                    <div className='flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors duration-200'>
                      Acceder
                      <svg
                        className='ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 5l7 7-7 7'
                        />
                      </svg>
                    </div>
                  ) : (
                    <span className='text-xs text-gray-400'>
                      Requiere rol ADMIN
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <AccessDeniedModal
        isOpen={showAccessDenied}
        onClose={() => setShowAccessDenied(false)}
        feature={deniedFeature}
      />
    </div>
  );
};

export default Home;
