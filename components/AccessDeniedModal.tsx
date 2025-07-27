interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export const AccessDeniedModal = ({
  isOpen,
  onClose,
  feature,
}: AccessDeniedModalProps) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
        <div className='flex items-center mb-4'>
          <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4'>
            <span className='text-2xl'>🚫</span>
          </div>
          <div>
            <h3 className='text-lg font-semibold text-gray-900'>
              Acceso Denegado
            </h3>
            <p className='text-sm text-gray-600'>Permisos insuficientes</p>
          </div>
        </div>

        <div className='mb-6'>
          <p className='text-gray-700 mb-3'>
            No tienes permisos para acceder a <strong>{feature}</strong>.
          </p>
          <div className='bg-yellow-50 border border-yellow-200 rounded-md p-3'>
            <p className='text-sm text-yellow-800'>
              <strong>Requisito:</strong> Esta función está disponible solo para
              usuarios con rol de Administrador.
            </p>
          </div>
        </div>

        <div className='flex justify-end space-x-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors'
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
