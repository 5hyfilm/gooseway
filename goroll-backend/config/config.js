import { config } from 'dotenv';

config();

const env_config = {
    project_env: process.env.PROJECT_ENV,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port_db: process.env.DB_PORT,
    port: +(process.env.PORT ?? 3000),

    email_user: process.env.EMAIL_USER,
    email_pass: process.env.EMAIL_PASSWORD,

    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    ignore_database_sync: process.env.IS_IGNORE_SYNC === 'true',

    cloudflare_account_id: process.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflare_api_token: process.env.CLOUDFLARE_API_TOKEN,
};

console.log('ENV:', env_config);

export default env_config;
