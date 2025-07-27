import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        } else {
          // Error handling
        }
      } catch {
        // Error handling
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
        [
          t.id,
          `"${t.concept}"`,
          t.amount,
          t.type,
          t.date,
          `"${t.user?.name || 'N/A'}"`,
        ].join(',')
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

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {isLoading ? (
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' />
            <p className='mt-4 text-gray-600'>Cargando reportes...</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Ingresos Totales
                    </p>
                    <p className='text-3xl font-bold text-green-600'>
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
                    <span className='text-2xl'>💰</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Gastos Totales
                    </p>
                    <p className='text-3xl font-bold text-red-600'>
                      {formatCurrency(totalExpense)}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center'>
                    <span className='text-2xl'>💸</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>Balance</p>
                    <p
                      className={`text-3xl font-bold ${
                        balance >= 0
                          ? 'text-green-600 group-hover:text-green-700'
                          : 'text-red-600 group-hover:text-red-700'
                      }`}
                    >
                      {formatCurrency(balance)}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-2xl'>📊</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
              {/* Bar Chart */}
              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Movimientos Financieros
                </h3>
                <div className='space-y-4'>
                  {chartData.map((item) => (
                    <div key={item.label} className='flex items-center'>
                      <div className='w-24 text-sm font-medium text-gray-700'>
                        {item.label}
                      </div>
                      <div className='flex-1 ml-4'>
                        <div className='relative'>
                          <div
                            className={`h-8 rounded-lg ${item.color}`}
                            style={{
                              width: `${(item.value / maxValue) * 100}%`,
                            }}
                          />
                          <span className='absolute inset-0 flex items-center justify-center text-white font-medium text-sm'>
                            {formatCurrency(item.value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie Chart */}
              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Distribución del Balance
                </h3>
                <div className='flex items-center justify-center'>
                  <div className='relative w-48 h-48'>
                    <svg
                      className='w-full h-full transform -rotate-90'
                      viewBox='0 0 100 100'
                    >
                      <circle
                        cx='50'
                        cy='50'
                        r='40'
                        fill='none'
                        stroke='#e5e7eb'
                        strokeWidth='8'
                      />
                      {totalIncome > 0 && (
                        <circle
                          cx='50'
                          cy='50'
                          r='40'
                          fill='none'
                          stroke='#10b981'
                          strokeWidth='8'
                          strokeDasharray={`${(totalIncome / (totalIncome + totalExpense)) * 251.2} 251.2`}
                        />
                      )}
                    </svg>
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='text-center'>
                        <p className='text-2xl font-bold text-gray-900'>
                          {totalIncome + totalExpense > 0
                            ? Math.round(
                                (totalIncome / (totalIncome + totalExpense)) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                        <p className='text-sm text-gray-600'>Ingresos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className='bg-white rounded-xl shadow-lg border border-gray-200'>
              <div className='px-6 py-4 border-b border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Últimas Transacciones
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
                        Tipo
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Fecha
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Usuario
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {transactions.slice(0, 10).map((transaction) => (
                      <tr key={transaction.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {transaction.concept}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          <span
                            className={
                              transaction.type === 'INCOME'
                                ? 'text-green-600 font-semibold'
                                : 'text-red-600 font-semibold'
                            }
                          >
                            {transaction.type === 'INCOME' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === 'INCOME'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.type === 'INCOME'
                              ? '💰 Ingreso'
                              : '💸 Gasto'}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {formatDate(transaction.date)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {transaction.user?.name || 'N/A'}
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
