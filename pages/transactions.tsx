import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/auth/withAuth';
import { useUserRole } from '@/lib/auth/UserRoleContext';

interface Transaction {
  id: string;
  amount: number;
  concept: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  user: {
    name: string;
    email: string;
  };
}

const TransactionsPage = () => {
  const router = useRouter();
  const { userRole } = useUserRole();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    concept: '',
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = userRole === 'ADMIN';

  // Cargar transacciones desde la API
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        console.error('Error fetching transactions');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTransaction = await response.json();
        setTransactions([newTransaction, ...transactions]);
        setShowForm(false);
        setFormData({
          amount: '',
          concept: '',
          type: 'INCOME',
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      concept: transaction.concept,
      type: transaction.type,
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedTransaction = await response.json();
        setTransactions(
          transactions.map((t) =>
            t.id === editingTransaction.id ? updatedTransaction : t
          )
        );
        setEditingTransaction(null);
        setFormData({
          amount: '',
          concept: '',
          type: 'INCOME',
          date: new Date().toISOString().split('T')[0],
        });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (transactionId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTransactions(transactions.filter((t) => t.id !== transactionId));
        alert('Transacción eliminada exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la transacción');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
    setFormData({
      amount: '',
      concept: '',
      type: 'INCOME',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-ES');

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      {/* Header */}
      <header className='bg-white shadow-lg border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div className='flex items-center'>
              <button
                onClick={() => router.push('/')}
                className='mr-6 text-gray-600 hover:text-gray-900 transition-colors flex items-center'
              >
                <span className='mr-2'>←</span>
                Volver
              </button>
              <h1 className='text-3xl font-bold text-gray-900 flex items-center'>
                <span className='mr-3'>💰</span>
                Gestión de Ingresos y Gastos
              </h1>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowForm(true)}
                className='px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center'
              >
                <span className='mr-2'>➕</span>
                Nuevo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex items-center'>
              <div className='p-3 bg-green-100 rounded-xl'>
                <span className='text-2xl'>📈</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Ingresos Totales</p>
                <p className='text-2xl font-bold text-green-600'>
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex items-center'>
              <div className='p-3 bg-red-100 rounded-xl'>
                <span className='text-2xl'>📉</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Gastos Totales</p>
                <p className='text-2xl font-bold text-red-600'>
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex items-center'>
              <div className='p-3 bg-blue-100 rounded-xl'>
                <span className='text-2xl'>💼</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Balance</p>
                <p className={`text-2xl font-bold ${
                  balance >= 0 
                    ? 'text-green-600 group-hover:text-green-700' 
                    : 'text-red-600 group-hover:text-red-700'
                }`}>
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className='bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200'>
          <div className='px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100'>
            <h2 className='text-xl font-semibold text-gray-900 flex items-center'>
              <span className='mr-2'>📊</span>
              Transacciones
            </h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Concepto
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Monto
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Fecha
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Usuario
                  </th>
                  <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                    Tipo
                  </th>
                  {isAdmin && (
                    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-100'>
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 6 : 5}
                      className='px-6 py-12 text-center text-gray-500'
                    >
                      <div className='flex flex-col items-center'>
                        <span className='text-4xl mb-2'>📝</span>
                        <p className='text-lg font-medium'>No hay transacciones registradas</p>
                        <p className='text-sm text-gray-400'>Comienza agregando tu primera transacción</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction, index) => (
                    <tr key={transaction.id} className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {transaction.concept}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <span
                          className={`font-semibold ${
                            transaction.type === 'INCOME'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? '+' : '-'}{' '}
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {formatDate(transaction.date)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        <div className='flex items-center'>
                          <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2'>
                            <span className='text-xs font-medium text-blue-600'>
                              {transaction.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          {transaction.user?.name || 'N/A'}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
                            transaction.type === 'INCOME'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? '💰 Ingreso' : '💸 Gasto'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <div className='flex items-center space-x-2'>
                            <button
                              onClick={() => handleEdit(transaction)}
                              className='inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200'
                            >
                              <span className='mr-1'>✏️</span>
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className='inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200'
                            >
                              <span className='mr-1'>🗑️</span>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Form - Crear Transacción */}
      {showForm && isAdmin && (
        <div className='fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4'>
          <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all'>
            {/* Header */}
            <div className='px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-2xl'>
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-semibold text-gray-900 flex items-center'>
                  <span className='mr-2'>➕</span>
                  Nueva Transacción
                </h3>
                <button
                  onClick={handleCancel}
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Concepto
                </label>
                <input
                  type='text'
                  value={formData.concept}
                  onChange={(e) =>
                    setFormData({ ...formData, concept: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  placeholder='Ej: Salario, Comida, etc.'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Monto
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  placeholder='0.00'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'INCOME' | 'EXPENSE',
                    })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  required
                >
                  <option value='INCOME'>💰 Ingreso</option>
                  <option value='EXPENSE'>💸 Gasto</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Fecha
                </label>
                <input
                  type='date'
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  required
                />
              </div>

              {/* Buttons */}
              <div className='flex justify-end space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={handleCancel}
                  className='px-6 py-2.5 text-gray-600 hover:text-gray-800 transition-colors'
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando...' : 'Crear Transacción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Form - Editar Transacción */}
      {editingTransaction && isAdmin && (
        <div className='fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4'>
          <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all'>
            {/* Header */}
            <div className='px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100 rounded-t-2xl'>
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-semibold text-gray-900 flex items-center'>
                  <span className='mr-2'>✏️</span>
                  Editar Transacción
                </h3>
                <button
                  onClick={handleCancel}
                  className='text-gray-400 hover:text-gray-600 transition-colors'
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Concepto
                </label>
                <input
                  type='text'
                  value={formData.concept}
                  onChange={(e) =>
                    setFormData({ ...formData, concept: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  placeholder='Ej: Salario, Comida, etc.'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Monto
                </label>
                <input
                  type='number'
                  step='0.01'
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  placeholder='0.00'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'INCOME' | 'EXPENSE',
                    })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  required
                >
                  <option value='INCOME'>💰 Ingreso</option>
                  <option value='EXPENSE'>💸 Gasto</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Fecha
                </label>
                <input
                  type='date'
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                  required
                />
              </div>

              {/* Buttons */}
              <div className='flex justify-end space-x-3 pt-4'>
                <button
                  type='button'
                  onClick={handleCancel}
                  className='px-6 py-2.5 text-gray-600 hover:text-gray-800 transition-colors'
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Actualizando...' : 'Actualizar Transacción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(TransactionsPage);
