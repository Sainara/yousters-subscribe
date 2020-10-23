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

const isLawyer = async (req, res, next) => {

  const errorMessage = Object.assign({}, eMessage);

  const lawyerLVLs = ['economy, profi, premium'];

  if (lawyerLVLs.includes(req.user.level)) {
    next();
  } else {
    errorMessage.error = 'Authentication Failed';
    return res.status(status.unauthorized).send(errorMessage);
  }
};


export {
  isAgreementExist,
  isLawyer
};
