module.exports = {
  apps: [{
    name: 'budgetbee',
    script: 'serve',
    args: 'dist -s -l 3000',
    cwd: '/var/www/html/budgetbee',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
