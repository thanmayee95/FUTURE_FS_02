// Simple seed for admin user and sample leads using Sequelize/SQLite
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const sequelize = require('./db');
const User = require('./models/User');
const Lead = require('./models/Lead');

dotenv.config();

async function run() {
  // sync models (create tables if necessary)
  await sequelize.sync();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@crm.local';
  let existing = await User.findOne({ where: { email: adminEmail } });
  if (!existing) {
    const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin123!', 10);
    existing = await User.create({ name: 'Admin', email: adminEmail, passwordHash: hash, role: 'admin' });
    console.log('Created admin', adminEmail);
  } else {
    console.log('Admin exists');
  }

  // Add sample user and leads
  let user = await User.findOne({ where: { email: 'sales@crm.local' } });
  if (!user) {
    const hash = await bcrypt.hash('Sales123!', 10);
    user = await User.create({ name: 'Sales Rep', email: 'sales@crm.local', passwordHash: hash, role: 'user' });
    console.log('Created sales user');
  }

  const count = await Lead.count();
  if (count === 0) {
    await Lead.bulkCreate([
      { name: 'Alice Johnson', email: 'alice@example.com', phone: '555-1001', assignedTo: user.id },
      { name: 'Bob Smith', email: 'bob@example.com', phone: '555-1002' },
      { name: 'Charlie Green', email: 'charlie@example.com', phone: '555-1003', status: 'contacted', assignedTo: user.id },
    ]);
    console.log('Created sample leads');
  }
}

// If run directly, execute
if (require.main === module) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = run;

