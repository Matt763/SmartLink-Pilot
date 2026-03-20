const Database = require('better-sqlite3');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const db = new Database('./dev.db');

function cuid() {
  return crypto.randomBytes(12).toString('hex');
}

async function main() {
  try {
    const id = cuid();
    
    const passwordHash = await bcrypt.hash('@Mambo763dagas', 10);
    
    const now = new Date().getTime();
    
    const stmt = db.prepare(`
      INSERT INTO User (id, email, name, password, role, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, 'mclean@smartlinkpilot.com', 'Admin User', passwordHash, 'admin', now, now);
    console.log('Successfully inserted custom admin user via raw SQLite!');
  } catch (e) {
    if (e.message.includes('UNIQUE constraint failed')) {
      console.log('User already exists. Updating password and role...');
      const passwordHash = await bcrypt.hash('@Mambo763dagas', 10);
      db.prepare(`UPDATE User SET password = ?, role = 'admin' WHERE email = ?`)
        .run(passwordHash, 'mclean@smartlinkpilot.com');
      console.log('Successfully updated custom admin user.');
    } else {
      console.error("Error inserting admin:", e.message);
    }
  }
}

main();
