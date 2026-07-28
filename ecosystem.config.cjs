module.exports = {
  apps: [
    {
      name: "hpvc-server",
      script: "server.js",
      cwd: "/home/web/HPVC/HPVC/server",
      watch: false,
      env: {
        NODE_ENV: "production",
      }
    }
  ]
};
