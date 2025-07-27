import { useSession } from '@/lib/auth/client';
import { useUserRole } from '@/lib/auth/UserRoleContext';

export const UserInfo = () => {
  const { data: session } = useSession();

  // Usar el contexto global para el rol
  const { userRole } = useUserRole();

  // Para sesiones de prueba, el contexto ya maneja el rol
  const finalUserRole = userRole || 'USER';
  const userName = (session?.user as { name?: string })?.name || 'Usuario';
  const userEmail = (session?.user as { email?: string })?.email || '';

  // Solo mostrar si hay una sesión activa
  if (!session && !userRole) {
    return null;
  }

  const getRoleColor = (role: string) =>
    role === 'ADMIN'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-blue-100 text-blue-800 border-blue-200';

  const getRoleLabel = (role: string) =>
    role === 'ADMIN' ? 'Administrador' : 'Usuario';

  const getPermissions = (role: string) => {
    if (role === 'ADMIN') {
      return [
        { name: 'Ver todas las transacciones', allowed: true },
        { name: 'Crear transacciones', allowed: true },
        { name: 'Ver reportes', allowed: true },
        { name: 'Editar usuarios', allowed: true },
        { name: 'Descargar reportes CSV', allowed: true },
      ];
    } else {
      return [
        { name: 'Ver todas las transacciones', allowed: true },
        { name: 'Crear transacciones', allowed: false },
        { name: 'Ver reportes', allowed: false },
        { name: 'Editar usuarios', allowed: false },
        { name: 'Descargar reportes CSV', allowed: false },
      ];
    }
  };

  const permissions = getPermissions(finalUserRole);

  return (
    <div className='bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-4'>
          <div className='w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md'>
            <span className='text-blue-700 font-bold text-lg'>
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>{userName}</h3>
            <p className='text-sm text-gray-500'>{userEmail}</p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <span
            className={`px-4 py-2 text-sm font-semibold rounded-full border-2 shadow-sm ${getRoleColor(finalUserRole)}`}
          >
            {getRoleLabel(finalUserRole)}
          </span>
        </div>
      </div>

      <div className='border-t border-gray-200 pt-6'>
        <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <span className='mr-2'>🔐</span>
          Permisos actuales
        </h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {permissions.map((permission) => (
            <div
              key={permission.name}
              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200'
            >
              <span className='text-sm font-medium text-gray-700'>
                {permission.name}
              </span>
              <span
                className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  permission.allowed
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}
              >
                {permission.allowed ? '✅ Permitido' : '❌ Denegado'}
              </span>
            </div>
          ))}
        </div>

        {finalUserRole === 'USER' && (
          <div className='mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl'>
            <div className='flex items-start'>
              <span className='text-yellow-600 mr-3 mt-1'>⚠️</span>
              <div>
                <p className='text-sm font-semibold text-yellow-800 mb-1'>
                  Permisos Limitados
                </p>
                <p className='text-sm text-yellow-700'>
                  Como usuario con rol USER, puedes ver todas las transacciones
                  pero no puedes crear nuevas. Las páginas de usuarios y
                  reportes están restringidas para administradores.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
