describe('Formato de moneda', () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  test('debe formatear números correctamente', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('1000');
    expect(result).toContain('US$');
  });

  test('debe formatear números decimales correctamente', () => {
    const result = formatCurrency(1500.5);
    expect(result).toContain('1500');
    expect(result).toContain('US$');
  });

  test('debe formatear cero correctamente', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('US$');
  });
});

describe('Formato de fecha', () => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES');
  };

  test('debe formatear fechas correctamente', () => {
    const result = formatDate('2024-01-15');
    expect(result).toMatch(/\d+\/\d+\/\d+/);
  });
});

describe('Cálculo de saldo', () => {
  const calculateBalance = (
    transactions: Array<{ amount: number; type: string }>
  ) => {
    return transactions.reduce((balance, transaction) => {
      return transaction.type === 'INCOME'
        ? balance + transaction.amount
        : balance - transaction.amount;
    }, 0);
  };

  test('debe calcular el saldo correctamente con ingresos y egresos', () => {
    const transactions = [
      { amount: 1000, type: 'INCOME' },
      { amount: 300, type: 'EXPENSE' },
      { amount: 500, type: 'INCOME' },
      { amount: 200, type: 'EXPENSE' },
    ];

    expect(calculateBalance(transactions)).toBe(1000);
  });

  test('debe manejar solo ingresos', () => {
    const transactions = [
      { amount: 1000, type: 'INCOME' },
      { amount: 500, type: 'INCOME' },
    ];

    expect(calculateBalance(transactions)).toBe(1500);
  });

  test('debe manejar solo egresos', () => {
    const transactions = [
      { amount: 300, type: 'EXPENSE' },
      { amount: 200, type: 'EXPENSE' },
    ];

    expect(calculateBalance(transactions)).toBe(-500);
  });
});
