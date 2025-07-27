describe('Validación de datos de transacciones', () => {
  const validateTransactionData = (data: {
    amount?: number;
    concept?: string;
    type?: string;
    date?: string;
  }) => {
    const errors: string[] = [];

    if (!data.amount || data.amount <= 0) {
      errors.push('El monto debe ser mayor a 0');
    }

    if (!data.concept || data.concept.trim().length < 3) {
      errors.push('El concepto debe tener al menos 3 caracteres');
    }

    if (!data.type || !['INCOME', 'EXPENSE'].includes(data.type)) {
      errors.push('El tipo debe ser INCOME o EXPENSE');
    }

    if (!data.date) {
      errors.push('La fecha es requerida');
    }

    return errors.length === 0 ? null : { error: errors.join(', ') };
  };

  test('debe validar transacción correcta', () => {
    const validTransaction = {
      amount: 1000,
      concept: 'Salario mensual',
      type: 'INCOME',
      date: '2024-01-15',
    };

    const result = validateTransactionData(validTransaction);
    expect(result).toBeNull();
  });

  test('debe rechazar monto inválido', () => {
    const invalidTransaction = {
      amount: 0,
      concept: 'Salario mensual',
      type: 'INCOME',
      date: '2024-01-15',
    };

    const result = validateTransactionData(invalidTransaction);
    expect(result).toEqual({ error: 'El monto debe ser mayor a 0' });
  });

  test('debe rechazar concepto muy corto', () => {
    const invalidTransaction = {
      amount: 1000,
      concept: 'Ab',
      type: 'INCOME',
      date: '2024-01-15',
    };

    const result = validateTransactionData(invalidTransaction);
    expect(result).toEqual({
      error: 'El concepto debe tener al menos 3 caracteres',
    });
  });

  test('debe rechazar tipo inválido', () => {
    const invalidTransaction = {
      amount: 1000,
      concept: 'Salario mensual',
      type: 'INVALID',
      date: '2024-01-15',
    };

    const result = validateTransactionData(invalidTransaction);
    expect(result).toEqual({ error: 'El tipo debe ser INCOME o EXPENSE' });
  });

  test('debe rechazar fecha faltante', () => {
    const invalidTransaction = {
      amount: 1000,
      concept: 'Salario mensual',
      type: 'INCOME',
      date: '',
    };

    const result = validateTransactionData(invalidTransaction);
    expect(result).toEqual({ error: 'La fecha es requerida' });
  });
});

describe('Validación de datos de usuario', () => {
  const validateUserData = (data: {
    name?: string;
    email?: string;
    role?: string;
  }) => {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!data.email || !data.email.includes('@')) {
      errors.push('El email debe ser válido');
    }

    if (data.role && !['USER', 'ADMIN'].includes(data.role)) {
      errors.push('El rol debe ser USER o ADMIN');
    }

    return errors.length === 0 ? null : { error: errors.join(', ') };
  };

  test('debe validar usuario correcto', () => {
    const validUser = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'USER',
    };

    const result = validateUserData(validUser);
    expect(result).toBeNull();
  });

  test('debe rechazar nombre muy corto', () => {
    const invalidUser = {
      name: 'J',
      email: 'juan@example.com',
      role: 'USER',
    };

    const result = validateUserData(invalidUser);
    expect(result).toEqual({
      error: 'El nombre debe tener al menos 2 caracteres',
    });
  });

  test('debe rechazar email inválido', () => {
    const invalidUser = {
      name: 'Juan Pérez',
      email: 'juanexample.com',
      role: 'USER',
    };

    const result = validateUserData(invalidUser);
    expect(result).toEqual({ error: 'El email debe ser válido' });
  });

  test('debe rechazar rol inválido', () => {
    const invalidUser = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'INVALID',
    };

    const result = validateUserData(invalidUser);
    expect(result).toEqual({ error: 'El rol debe ser USER o ADMIN' });
  });
});
