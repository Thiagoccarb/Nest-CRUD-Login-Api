/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'fumico-dev',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'fumico-test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
};
