
describe('Cálculos financieros', () => {
  const calculateTotalIncome = (transactions: Array<{ amount: number; type: string }>) => {
    return transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTotalExpenses = (transactions: Array<{ amount: number; type: string }>) => {
    return transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateBalance = (transactions: Array<{ amount: number; type: string }>) => {
    const income = calculateTotalIncome(transactions);
    const expenses = calculateTotalExpenses(transactions);
    return income - expenses;
  };

  const calculatePercentage = (part: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  test('debe calcular ingresos totales correctamente', () => {
    const transactions = [
      { amount: 1000, type: 'INCOME' },
      { amount: 500, type: 'INCOME' },
      { amount: 300, type: 'EXPENSE' }
    ];

    expect(calculateTotalIncome(transactions)).toBe(1500);
  });

  test('debe calcular gastos totales correctamente', () => {
    const transactions = [
      { amount: 1000, type: 'INCOME' },
      { amount: 300, type: 'EXPENSE' },
      { amount: 200, type: 'EXPENSE' }
    ];

    expect(calculateTotalExpenses(transactions)).toBe(500);
  });

  test('debe calcular balance correctamente', () => {
    const transactions = [
      { amount: 1000, type: 'INCOME' },
      { amount: 300, type: 'EXPENSE' },
      { amount: 500, type: 'INCOME' },
      { amount: 200, type: 'EXPENSE' }
    ];

    expect(calculateBalance(transactions)).toBe(1000);
  });

  test('debe calcular porcentajes correctamente', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(0, 100)).toBe(0);
    expect(calculatePercentage(100, 0)).toBe(0);
  });
});

describe('Filtrado y búsqueda', () => {
  const filterTransactionsByType = (transactions: Array<{ type: string; amount: number; concept: string }>, type: string) => {
    return transactions.filter(t => t.type === type);
  };

  const searchTransactionsByConcept = (transactions: Array<{ concept: string; amount: number; type: string }>, searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return transactions.filter(t => 
      t.concept.toLowerCase().includes(term)
    );
  };

  const filterTransactionsByDateRange = (
    transactions: Array<{ date: string; amount: number; type: string; concept: string }>,
    startDate: string,
    endDate: string
  ) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    });
  };

  test('debe filtrar transacciones por tipo', () => {
    const transactions = [
      { type: 'INCOME', amount: 1000, concept: 'Salario' },
      { type: 'EXPENSE', amount: 300, concept: 'Comida' },
      { type: 'INCOME', amount: 500, concept: 'Bonus' }
    ];

    const incomeTransactions = filterTransactionsByType(transactions, 'INCOME');
    expect(incomeTransactions).toHaveLength(2);
    expect(incomeTransactions[0].concept).toBe('Salario');
    expect(incomeTransactions[1].concept).toBe('Bonus');
  });

  test('debe buscar transacciones por concepto', () => {
    const transactions = [
      { concept: 'Salario mensual', amount: 1000, type: 'INCOME' },
      { concept: 'Comida del día', amount: 300, type: 'EXPENSE' },
      { concept: 'Salario extra', amount: 500, type: 'INCOME' }
    ];

    const salarioResults = searchTransactionsByConcept(transactions, 'salario');
    expect(salarioResults).toHaveLength(2);
    expect(salarioResults[0].concept).toBe('Salario mensual');
    expect(salarioResults[1].concept).toBe('Salario extra');
  });

  test('debe filtrar transacciones por rango de fechas', () => {
    const transactions = [
      { date: '2024-01-15', amount: 1000, type: 'INCOME', concept: 'Salario' },
      { date: '2024-01-20', amount: 300, type: 'EXPENSE', concept: 'Comida' },
      { date: '2024-02-01', amount: 500, type: 'INCOME', concept: 'Bonus' }
    ];

    const filtered = filterTransactionsByDateRange(transactions, '2024-01-10', '2024-01-25');
    expect(filtered).toHaveLength(2);
    expect(filtered[0].concept).toBe('Salario');
    expect(filtered[1].concept).toBe('Comida');
  });
});

describe('Validación de reglas de negocio', () => {
  const canDeleteUser = (userEmail: string, currentUserRole: string) => {
    // No se puede eliminar el usuario de pruebas
    if (userEmail === 'test-user@example.com') {
      return false;
    }
    
    // Solo los ADMIN pueden eliminar usuarios
    if (currentUserRole !== 'ADMIN') {
      return false;
    }
    
    return true;
  };

  const canCreateTransaction = (userRole: string) => {
    return userRole === 'ADMIN';
  };

  const validateTransactionAmount = (amount: number, userRole: string) => {
    const maxAmount = userRole === 'ADMIN' ? 1000000 : 10000;
    return amount > 0 && amount <= maxAmount;
  };

  test('debe permitir eliminar usuario válido por ADMIN', () => {
    expect(canDeleteUser('user@example.com', 'ADMIN')).toBe(true);
  });

  test('debe denegar eliminar usuario de pruebas', () => {
    expect(canDeleteUser('test-user@example.com', 'ADMIN')).toBe(false);
  });

  test('debe denegar eliminar usuario por USER', () => {
    expect(canDeleteUser('user@example.com', 'USER')).toBe(false);
  });

  test('debe permitir crear transacción por ADMIN', () => {
    expect(canCreateTransaction('ADMIN')).toBe(true);
  });

  test('debe denegar crear transacción por USER', () => {
    expect(canCreateTransaction('USER')).toBe(false);
  });

  test('debe validar monto de transacción para ADMIN', () => {
    expect(validateTransactionAmount(500000, 'ADMIN')).toBe(true);
    expect(validateTransactionAmount(2000000, 'ADMIN')).toBe(false);
  });

  test('debe validar monto de transacción para USER', () => {
    expect(validateTransactionAmount(5000, 'USER')).toBe(true);
    expect(validateTransactionAmount(15000, 'USER')).toBe(false);
  });
}); 