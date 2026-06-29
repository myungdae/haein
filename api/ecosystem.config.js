// PM2 설정 파일
// 실행: pm2 start ecosystem.config.js
// 자동시작: pm2 save && pm2 startup

module.exports = {
  apps: [{
    name:        'haein-api',
    script:      'server.js',
    cwd:         '/home/ubuntu/haein/api',
    instances:   1,
    autorestart: true,
    watch:       false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
    },
    error_file:  '/home/ubuntu/haein/api/logs/err.log',
    out_file:    '/home/ubuntu/haein/api/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
