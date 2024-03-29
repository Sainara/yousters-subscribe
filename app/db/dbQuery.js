import pool from './pool';

export default {
  /**
   * DB Query
   * @param {object} req
   * @param {object} res
   * @returns {object} object
   */
  query(quertText, params) {
    return new Promise((resolve, reject) => {
      pool.query(quertText, params)
        .then((res) => {
          //console.log(res);
          resolve(res);
        })
        .catch((err) => {
          //console.error(err);
          reject(err);
        });
    });
  },
};
