import Nano, { DocumentScope } from 'nano';

import config from './config/keys';

const DB_NAME = config.db_name;
const nano = Nano(config.couch_db_url);

let db: DocumentScope<unknown>;

export const setupDB = async () => {
  const dbList = await nano.db.list();

  console.log('CouchDB is ready');

  if (!dbList.includes(DB_NAME)) {
    await nano.db.create(DB_NAME);
    return await nano.use(DB_NAME);
  } else {
    return await nano.use(DB_NAME);
  }
};

(async () => {
  db = await setupDB();
})();

export { db };
