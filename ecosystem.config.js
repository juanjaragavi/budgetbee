module.exports = {
  apps: [
    {
      name: "budgetbee",
      script: "./dist/server/entry.mjs",
      cwd: "/var/www/html/budgetbee",
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: 4321,
      },
      error_file: "/var/log/pm2/budgetbee-error.log",
      out_file: "/var/log/pm2/budgetbee-out.log",
      log_file: "/var/log/pm2/budgetbee-combined.log",
      time: true,
    },
  ],
};
