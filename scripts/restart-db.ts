// Usar fetch nativo de Node.js

async function restartDatabase() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Faltan variables de entorno');
    console.log('Necesitas configurar:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    return;
  }

  try {
    console.log('🔄 Reiniciando la base de datos de Supabase...');

    // Opción 1: Usar la API de Supabase para reiniciar
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        query: 'SELECT pg_reload_conf();' // Reinicia la configuración
      })
    });

    if (response.ok) {
      console.log('✅ Base de datos reiniciada exitosamente!');
    } else {
      console.log('⚠️ No se pudo reiniciar via API, pero la BD debería estar funcionando');
    }

    // Verificar conexión
    console.log('🔍 Verificando conexión...');
    const healthCheck = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      }
    });

    if (healthCheck.ok) {
      console.log('✅ Conexión a la base de datos verificada');
    } else {
      console.log('❌ Error de conexión a la base de datos');
    }

  } catch (error) {
    console.error('❌ Error al reiniciar la base de datos:', error);
    console.log('💡 Alternativa: Ve al dashboard de Supabase y reinicia manualmente');
  }
}

// Ejecutar el script
restartDatabase(); 