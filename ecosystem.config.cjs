module.exports = {
  apps: [
    {
      name: "hpvc-server",
      script: "server.js",
      cwd: "./server",
      watch: false,
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "hpvc-client",
      script: "npm",
      args: "run preview -- --host --port 5173",
      cwd: "./client",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    },
    {
      name: "hpvc-admin",
      script: "npm",
      args: "run preview -- --host --port 5174",
      cwd: "./admin",
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
