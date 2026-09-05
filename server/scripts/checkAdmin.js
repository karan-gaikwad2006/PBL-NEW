require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { query, closePool } = require('../src/config/db');

async function main() {
  try {
    console.log('--- Checking admin user in database ---');
    const { rows } = await query(
      "SELECT id, firebase_uid, email, full_name, role, status FROM users WHERE email = 'admin@gmail.com'"
    );
    if (rows.length === 0) {
      console.log('No user found with email admin@gmail.com in the database!');
    } else {
      console.log('Found admin user record:');
      console.log(JSON.stringify(rows[0], null, 2));
    }

    console.log('\n--- All users in database ---');
    const { rows: allUsers } = await query(
      "SELECT id, firebase_uid, email, role, status FROM users ORDER BY id"
    );
    console.log(JSON.stringify(allUsers, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await closePool();
  }
}

main();
