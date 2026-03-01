const { Sequelize } = require('sequelize');
const path = require('path');

// Use SQLITE_FILE env var or default to database.sqlite in project root
const storagePath = process.env.SQLITE_FILE || path.join(__dirname, 'database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false,
});

module.exports = sequelize;
