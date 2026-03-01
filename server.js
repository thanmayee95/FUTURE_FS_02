const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const sequelize = require('./db');


dotenv.config();

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/users', userRoutes);

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // use sqlite via Sequelize; ensure model changes are applied
    await sequelize.sync({ alter: true });
    console.log('SQLite database ready');

    // seed the database on every launch (SQLite file persists between runs)
    try {
      const seed = require('./seed');
      await seed();
      console.log('Database seeded');
    } catch (e) {
      console.error('Failed to seed database', e);
    }

    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
