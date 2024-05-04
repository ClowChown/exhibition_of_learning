// Update with your config settings.
const path = require('path');

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      database: 'demo',
      port: '5433',
      user: 'Emma',
      password: "postgres",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    },
  },

  production: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      port: 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      //conectionString: process.env.DATABASE_URL2,
      ssl: {rejectUnauthorized: false},
    },
    migrations: {
      directory: __dirname + '/db/migrations',
    },
    seeds: {
      directory: __dirname + '/db/seeds',
    },
  },
};