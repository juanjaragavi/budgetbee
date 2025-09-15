module.exports = {
  apps: [
    {
      name: "budgetbee-ssr",
      script: "serve",
      args: "dist -s -l 4321",
      cwd: "/var/www/html/budgetbee",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 4321,
      },
    },
  ],
};
