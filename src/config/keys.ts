import 'dotenv/config';

interface IConfigKeys {
  node_env: string;
  port: number;
  db_name: string;
  couch_db_url: string;
}

const ENV = process.env;
const PORT: number = parseInt(ENV.PORT as string, 10);

const config: IConfigKeys = {
  node_env: ENV.NODE_ENV || 'production',
  port: PORT || 3000,
  db_name: 'node-otp',
  couch_db_url: `http://${ENV.COUCH_DB_USERNAME}:${ENV.COUCH_DB_PASSWORD}@127.0.0.1:5984`,
};

export default config;
