import dbQuery from '../db/dbQuery';

const createTable = async (tableName, query) => {
  const checkExistQuery = 'SELECT to_regclass($1);';

  try {
    const check = await dbQuery.query(checkExistQuery, [tableName]);
    const dbResponse = check.rows[0].to_regclass;

    if (!dbResponse) {
      const createQuery = 'CREATE TABLE ' + tableName + query;

      console.log(createQuery);
      const create = await dbQuery.query(query, []);
      console.log(tableName + " created");
    } else {
      console.log(tableName + " exist");
    }
  } catch (error) {
    console.error(error);
  }
};

export default {
  initDBs() {
    var tableName = 'entersessions';
    var query = '(id serial PRIMARY KEY, sessionID VARCHAR, code VARCHAR, tryCounter int, expiretime timestamptz, number VARCHAR)';
    createTable(tableName, query);
    console.log('creating');
  }
};
