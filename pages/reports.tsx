import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/auth/withAuth';

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

const ReportsPage = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar transacciones desde la API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        } else {
          console.error('Error al cargar transacciones');
        }
      } catch (error) {
        console.error('Error al cargar transacciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-ES');

  const downloadCSV = () => {
    const headers = ['ID', 'Concepto', 'Monto', 'Tipo', 'Fecha', 'Usuario'];
    const csvContent = [
      headers.join(','),
      ...transactions.map((t) =>
        [t.id, `"${t.concept}"`, t.amount, t.type, t.date, `"${t.user?.name || 'N/A'}"`].join(
          ','
        )
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `reporte_financiero_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple chart data
  const chartData = [
    { label: 'Ingresos', value: totalIncome, color: 'bg-green-500' },
    { label: 'Egresos', value: totalExpense, color: 'bg-red-500' },
  ];

  const maxValue = Math.max(totalIncome, totalExpense);

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <button
                onClick={() => router.push('/')}
                className='mr-4 text-gray-600 hover:text-gray-900'
              >
                ← Volver
              </button>
              <h1 className='text-2xl font-bold text-gray-900'>
                Reportes Financieros
              </h1>
            </div>
            <button
              onClick={downloadCSV}
              className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              Descargar CSV
            </button>
          </div>
        </div>
      </header>

            {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
              <p className='mt-4 text-gray-600'>Cargando reportes...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-green-100 rounded-lg'>
                <span className='text-2xl'>💰</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Total Ingresos
                </p>
                <p className='text-2xl font-bold text-green-600'>
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-red-100 rounded-lg'>
                <span className='text-2xl'>💸</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Total Egresos
                </p>
                <p className='text-2xl font-bold text-red-600'>
                  {formatCurrency(totalExpense)}
                </p>
              </div>
            </div>
          </div>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <div className='flex items-center'>
              <div className='p-2 bg-blue-100 rounded-lg'>
                <span className='text-2xl'>📊</span>
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Saldo Actual
                </p>
                <p
                  className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}
                >
                  {formatCurrency(balance)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Bar Chart */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Comparación Ingresos vs Egresos
            </h3>
            <div className='space-y-4'>
              {chartData.map((item) => (
                <div key={`chart-${item.label}`}>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm font-medium text-gray-700'>
                      {item.label}
                    </span>
                    <span className='text-sm font-bold text-gray-900'>
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-4'>
                    <div
                      className={`h-4 rounded-full ${item.color}`}
                      style={{ width: `${(item.value / maxValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Distribución de Movimientos
            </h3>
            <div className='flex items-center justify-center'>
              <div className='relative w-32 h-32'>
                <svg
                  className='w-32 h-32 transform -rotate-90'
                  viewBox='0 0 32 32'
                >
                  <circle
                    cx='16'
                    cy='16'
                    r='14'
                    fill='none'
                    stroke='#e5e7eb'
                    strokeWidth='4'
                  />
                  <circle
                    cx='16'
                    cy='16'
                    r='14'
                    fill='none'
                    stroke='#10b981'
                    strokeWidth='4'
                    strokeDasharray={`${(totalIncome / (totalIncome + totalExpense)) * 88} 88`}
                    strokeLinecap='round'
                  />
                </svg>
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center'>
                    <div className='text-lg font-bold text-gray-900'>
                      {Math.round(
                        (totalIncome / (totalIncome + totalExpense)) * 100
                      )}
                      %
                    </div>
                    <div className='text-xs text-gray-600'>Ingresos</div>
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-4 flex justify-center space-x-4'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-green-500 rounded-full mr-2'></div>
                <span className='text-sm text-gray-700'>Ingresos</span>
              </div>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-red-500 rounded-full mr-2'></div>
                <span className='text-sm text-gray-700'>Egresos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h3 className='text-lg font-semibold text-gray-900'>
              Transacciones Recientes
            </h3>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Concepto
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Monto
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Fecha
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Usuario
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {transactions.slice(0, 5).map((transaction) => (
                  <tr key={transaction.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {transaction.concept}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      <span
                        className={
                          transaction.type === 'INCOME'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}{' '}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {formatDate(transaction.date)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {transaction.user?.name || 'N/A'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === 'INCOME'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? 'Ingreso' : 'Egreso'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
};

export default withAuth(ReportsPage, 'ADMIN');
