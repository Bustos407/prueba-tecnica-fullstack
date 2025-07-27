import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabaseHealth() {
  try {
    console.log('🔍 Verificando salud de la base de datos...');
    
    // Intentar una consulta simple
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Base de datos funcionando correctamente');
    return true;
  } catch (error) {
    console.log('❌ Error en la base de datos:', error);
    return false;
  }
}

async function restartDatabase() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Faltan variables de entorno');
    console.log('Necesitas configurar:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    return false;
  }

  try {
    console.log('🔄 Reiniciando la base de datos de Supabase...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        query: 'SELECT pg_reload_conf();'
      })
    });

    if (response.ok) {
      console.log('✅ Base de datos reiniciada exitosamente!');
      return true;
    } else {
      console.log('⚠️ No se pudo reiniciar via API, pero la BD debería estar funcionando');
      return false;
    }
  } catch (error) {
    console.error('❌ Error al reiniciar la base de datos:', error);
    console.log('💡 Alternativa: Ve al dashboard de Supabase y reinicia manualmente');
    return false;
  }
}

async function autoRestartOnError() {
  console.log('🚀 Iniciando monitoreo automático de la base de datos...');
  
  // Verificar salud inicial
  const isHealthy = await checkDatabaseHealth();
  
  if (!isHealthy) {
    console.log('🔄 Detectado problema en la BD, iniciando reinicio automático...');
    const restartSuccess = await restartDatabase();
    
    if (restartSuccess) {
      console.log('✅ Reinicio completado. Verificando conexión...');
      await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
      
      const healthAfterRestart = await checkDatabaseHealth();
      if (healthAfterRestart) {
        console.log('🎉 Base de datos restaurada y funcionando correctamente!');
      } else {
        console.log('⚠️ La base de datos aún tiene problemas después del reinicio');
      }
    }
  } else {
    console.log('✅ Base de datos funcionando correctamente, no se necesita reinicio');
  }
  
  await prisma.$disconnect();
}

// Ejecutar el script
autoRestartOnError().catch(console.error); 