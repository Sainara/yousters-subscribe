const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});
//
// let users = {
//   [{
//     id: '1',
//     username: 'Robin Wieruch',
//   },
//   {
//     id: '2',
//     username: 'Dave Davids'
//   }]
// };

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
   .get('/login', async (req, res) => {
     try {
       const client = await pool.connect()
       const result = await client.query('SELECT * FROM users WHERE login = $1 AND password = $2', [req.query.login, req.query.password]);
       //const results = { 'results': (result) ? result.rows : null};
       //res.render('pages/db', results );
       var logd = false, isA = false
       if (result.rows.length > 0) {
         logd = true
         isA = result.rows[0].is_admin == 1
       }
       res.json({
            login : logd,
            is_admin : isA
          })
       client.release();
     } catch (err) {
       console.error(err);
       res.json({
         result : false
       })
     }
   })
   // {
  //   res.json({
  //     login : req.query.login == "111" || req.query.login == "admin",
  //     is_admin : req.query.login == "admin"
  //   })
  // })
  .post('/add', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('INSERT INTO users (login, password) VALUES ($1, $2)', [req.body.login, req.body.password]);
      res.json({
        result : true
      })
      client.release();
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/addadmin', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('INSERT INTO users (login, password, is_admin) VALUES ($1, $2, $3)', [req.body.login, req.body.password, 1]);
      res.json({
        result : true
      })
      client.release();
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/delete', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('DELETE FROM users WHERE login = $1', [req.body.login]);
      res.json({
        result : true
      })
      client.release();
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .get('/dbtest', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM users');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
