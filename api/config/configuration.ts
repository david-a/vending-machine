const port = 3000;
export default () => ({
  baseUrl: process.env.BASE_URL || 'http://localhost:' + port,
  port,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3302',
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  redis: {
    // TODO: use TLS
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  },
  auth: {
    keyEncodingPassphrase: process.env.AUTH_SECRET, // used for encrypting the private keys
    oneTimeCodeExpiration: 600,
    accessTokenExpiration: 60 * 60 * 24, // 1 day
    refreshTokenExpiration: 60 * 60 * 24 * 7, // 7 days, used as session expiration
  },
});
