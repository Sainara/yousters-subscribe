import dbQuery from '../db/dbQuery';

const isAgreementExist = async (uid) => {
    const checkQuery = 'SELECT id FROM agreements WHERE uid = $1';
    try {
      var check = await dbQuery.query(checkQuery, [uid]);
      const dbResponse = check.rows[0];

      return dbResponse;
  } catch (e) {
      return false;
  }
}


export {
  isAgreementExist
};
