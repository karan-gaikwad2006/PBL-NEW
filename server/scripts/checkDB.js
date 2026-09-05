require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query, closePool } = require('../src/config/db');

async function main() {
  try {
    console.log('--- Checking fraud_signals table ---');
    const { rows } = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('Tables in DB:', rows.map(r => r.table_name));

    // Check if fraud_signals table exists
    const hasFraud = rows.some(r => r.table_name === 'fraud_signals');
    console.log('\nfaud_signals table exists:', hasFraud);

    if (hasFraud) {
      const { rows: sample } = await query('SELECT COUNT(*) FROM fraud_signals');
      console.log('fraud_signals count:', sample[0].count);
    }

    // Also test the admin list endpoint for requirements
    console.log('\n--- Checking requirements table ---');
    const { rows: reqCount } = await query('SELECT COUNT(*), status FROM requirements GROUP BY status');
    console.log('Requirements by status:', reqCount);

    // Check institutions
    console.log('\n--- Checking institutions table ---');
    const { rows: instCount } = await query('SELECT COUNT(*), verification_status FROM institutions GROUP BY verification_status');
    console.log('Institutions by status:', instCount);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await closePool();
  }
}

main();
