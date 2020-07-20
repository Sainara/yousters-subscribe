import dbQuery from '../db/dbQuery';

const create_entersessions = async () => {
  var query = 'CREATE TABLE entersessions(id serial PRIMARY KEY, sessionID VARCHAR, code VARCHAR, tryCounter int, expiretime timestamptz, number VARCHAR)';

  try {
    const {rows} = await dbQuery.query(query, []);
  } catch (e) {

  }
}

export default {
  initDBs() {
    console.log('getPaymentQuery');
  }
};
