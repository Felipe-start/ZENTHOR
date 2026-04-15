module.exports = {
  apps: [
    {
      name: 'zenthor-api',
      script: './src/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    },
    {
      name: 'zenthor-recordatorios',
      script: './src/recordatorios.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
