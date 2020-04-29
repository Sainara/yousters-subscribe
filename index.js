const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

// const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true
// });

var multer  = require('multer')
var cloudinary = require('cloudinary')
var cloudinaryStorage = require('multer-storage-cloudinary')

var storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'avas',
  allowedFormats: ['jpg', 'png'],
  filename: function (req, file, cb) {
    //console.log(req.query);
    //console.log(file);
    //console.log(cb);
    cb(undefined, req.query.id);
  }
});

/* Initialize multer middleware with the multer-storage-cloudinary based
   storage engine */
var parser = multer({ storage: storage });

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();

var apn = require('apn');

var options = {
  token: {
    key: "AuthKey_P7K88X6929.p8",
    keyId: "P7K88X6929",
    teamId: "A7FRCYXJJN"
  },
  production: true
};

var apnProvider = new apn.Provider(options);

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json({limit: '50mb'}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/support', (req, res) => res.render('pages/index'))
  //.get('/lawyers', (req, res) => res.json(lawyers))
  .get('/login', async (req, res) => {
     try {

       const result = await client.query('SELECT * FROM users WHERE login = $1 AND password = $2', [req.query.login, req.query.password]);
       //const results = { 'results': (result) ? result.rows : null};
       //res.render('pages/db', results );
       var logd = false
       if (result.rows.length > 0) {
         res.json({
              login : true,
              user : result.rows[0]
            })
         //isA = result.rows[0].is_admin == 1
       } else {
       res.json({
            login : logd
          })
        }
     } catch (err) {
       console.error(err);
       res.json({
          login : false
       })
     }
   })
   .get('/checklogin', async (req, res) => {
      try {
        const result = await client.query('SELECT login FROM users WHERE login = $1', [req.query.login]);
        var isFree = true
        if (result.rows.length > 0) {
          isFree = false
        }
        res.json({
             result : true,
             is_free : isFree
           })
      } catch (err) {
        console.error(err);
        res.json({
          result : false
        })
      }
    })
    .post('/updatedevicetoken', async (req, res) => {
       try {
         const result = await client.query('UPDATE users SET device_token = $2, device_type = $3 WHERE id = $1', [req.body.id, req.body.token, req.body.type]);
         //console.log(req.file)
         res.json({
              result : true
            })
       } catch (err) {
         console.error(err);
         res.json({
           result : false
         })
       }
     })
     .post('/resetdevicetoken', async (req, res) => {
        try {
          const result = await client.query('UPDATE users SET device_token = $2 WHERE id = $1', [req.body.id, null]);
          //console.log(req.file)
          res.json({
               result : true
             })
        } catch (err) {
          console.error(err);
          res.json({
            result : false
          })
        }
      })
    .post('/updatepassword', async (req, res) => {
       try {
         const result = await client.query('SELECT id, password FROM users WHERE id = $1', [req.body.id]);
         if (result.rows.length > 0) {
           if (result.rows[0].password == req.body.oldpass) {
             const update = await client.query('UPDATE users SET password = $2 WHERE id = $1', [req.body.id, req.body.newpass]);
             res.json({
                  result : true
                })
           } else {
             res.json({
                  result : false
              })
           }
         } else {
           res.json({
                result : false
            })
         }
       } catch (err) {
         console.error(err);
         res.json({
           result : false
         })
       }
     })
   .post('/adduser', async (req, res) => {
      try {
        const result = await client.query('INSERT INTO users (login, name, password, user_type, email, city, phone, ava) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
       [req.body.login, req.body.name, req.body.pass, req.body.type, req.body.email, req.body.city, req.body.phone, req.body.ava]);
        const id = await client.query('SELECT * FROM users WHERE login = $1', [req.body.login]);
        res.json({
             result : true,
             userID : id.rows[0].id
           })
      } catch (err) {
        console.error(err);
        res.json({
          result : false
        })
      }
    })
    .get('/hints', async (req, res) => {
       try {
         const result = await client.query('SELECT * FROM hints');
         const result2 = await client.query('SELECT * FROM sub_hints');
         res.json({
              result : true,
              hints : result.rows,
              subhints : result2.rows
            })
       } catch (err) {
         console.error(err);
         res.json({
           result : false
         })
       }
     })
     .get('/subhints', async (req, res) => {
        try {
          const result = await client.query('SELECT * FROM sub_hints WHERE parent_hint = $1', [req.query.id]);
          res.json({
               result : true,
               hints : result.rows
             })
        } catch (err) {
          console.error(err);
          res.json({
            result : false
          })
        }
      })
    .post('/updatehint', async (req, res) => {
        try {
           const result = await client.query('UPDATE hints SET ishint = $2 WHERE id = $1', [req.body.id, req.body.ishint]);
           //console.log(req.file)
           res.json({
                result : true
              })
         } catch (err) {
           console.error(err);
           res.json({
             result : false
           })
        }
    })
    .get('/updatelikes', async (req, res) => {
       try {
         const result = await client.query('UPDATE main_news SET liked_by = $2 WHERE id = $1', [req.query.id, req.query.liked_by]);

         res.json({
              result : true
            })
       } catch (err) {
         console.error(err);
         res.json({
           result : false
         })
       }
     })
     .get('/updatelawyerlikes', async (req, res) => {
        try {
          const result = await client.query('UPDATE users SET liked_by = $2 WHERE id = $1', [req.query.id, req.query.liked_by]);

          res.json({
               result : true
             })
        } catch (err) {
          console.error(err);
          res.json({
            result : false
          })
        }
      })
     .post('/updatefavs', async (req, res) => {
        try {
          const result = await client.query('UPDATE users SET favs = $2 WHERE id = $1', [req.body.id, req.body.favs]);
          res.json({
               result : true
             })
        } catch (err) {
          console.error(err);
          res.json({
            result : false
          })
        }
      })
    .post('/editsubhint', async (req, res) => {
         try {
           const result = await client.query('UPDATE sub_hints SET hintkey = $2, hinttext = $3 WHERE id = $1', [req.body.id, req.body.key, req.body.text]);
           //console.log(req.file);
           res.json({
                result : true
              })
         } catch (err) {
           console.error(err);
           res.json({
             result : false
           })
         }
    })
   .post('/edituser', async (req, res) => {
      try {
        const result = await client.query('UPDATE users SET name = $2, email = $3, city = $4, phone = $5, ava = $6 WHERE id = $1', [req.body.id, req.body.name, req.body.email, req.body.city, req.body.phone, req.body.ava]);
        console.log(req.file);
        res.json({
             result : true
           })
      } catch (err) {
        console.error(err);
        res.json({
          result : false
        })
      }
    })
    .post('/editlawyer', async (req, res) => {
       try {
         const result = await client.query('UPDATE users SET name = $2, email = $3, city = $4, phone = $5, latitude = $6, longitude = $7, cv = $8, uslugi = $9, sp = $10, status = $11, price = $12, langs = $13, link = $14, ava = $15, address = $16 WHERE id = $1', [req.body.id, req.body.name, req.body.email, req.body.city, req.body.phone, req.body.la, req.body.lo, req.body.cv, req.body.uslugi, req.body.sp, req.body.status, req.body.price, req.body.langs, req.body.link, req.body.ava, req.body.address]);
         //console.log(req.file)
         res.json({
              result : true
            })
       } catch (err) {
         console.error(err);
         res.json({
           result : false
         })
       }
     })
     .post('/makeactive', async (req, res) => {
        try {
          const result = await client.query('UPDATE users SET isactive = true WHERE id = $1', [req.body.id]);
          //console.log(req.file)
          res.json({
               result : true
             })
        } catch (err) {
          console.error(err);
          res.json({
            result : false
          })
        }
      })
      .post('/makedeactive', async (req, res) => {
         try {
           const result = await client.query('UPDATE users SET isactive = false WHERE id = $1', [req.body.id]);
           //console.log(req.file)
           res.json({
                result : true
              })
         } catch (err) {
           console.error(err);
           res.json({
             result : false
           })
         }
       })
       .post('/makepartner', async (req, res) => {
          try {
            const result = await client.query('UPDATE users SET user_type = $2 WHERE id = $1', [req.body.id, "Партнёр"]);
            //console.log(req.file)
            res.json({
                 result : true
               })
          } catch (err) {
            console.error(err);
            res.json({
              result : false
            })
          }
        })
        .post('/makelawyer', async (req, res) => {
           try {
             const result = await client.query('UPDATE users SET user_type = $2 WHERE id = $1', [req.body.id, "Юрист"]);
             //console.log(req.file)
             res.json({
                  result : true
                })
           } catch (err) {
             console.error(err);
             res.json({
               result : false
             })
           }
         })
    .post('/upload', parser.single('image'), async (req, res) => {
      try {
        const result = await client.query('UPDATE users SET avaurl = $2 WHERE id = $1', [req.query.id, req.file.secure_url]);
        res.json({
          result : true,
          url : req.file.secure_url
        });
      } catch (err) {
        console.error(err);
        res.json({
          result : false
        })
      }

     })
    .get('/getuser', async (req, res) => {
       try {
         const result = await client.query('SELECT * FROM users WHERE id = $1', [req.query.id]);

         res.json({
              result : true,
              user : result.rows[0]
            })
       } catch (err) {
         console.error(err);
         res.json({
           result : false
         })
       }
     })
     .get('/getlawyers', async (req, res) => {
        try {
          const result = await client.query('SELECT id, name, login, email, is_admin, city, phone, user_type, latitude, longitude, cv, uslugi, sp, status, price, langs, link, want, avaurl, isactive, liked_by FROM users WHERE user_type = $1 OR user_type = $2 ORDER BY id DESC', ['Юрист', 'Партнёр']);

          res.json({
               result : true,
               lawyers : result.rows
             })
        } catch (err) {
          console.error(err);
          res.json({
            result : false
          })
        }
      })
  .post('/add', async (req, res) => {
    try {
      const result = await client.query('INSERT INTO users (login, password) VALUES ($1, $2)', [req.body.login, req.body.password]);
      res.json({
        result : true
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/addhint', async (req, res) => {
    try {
      const result = await client.query('INSERT INTO hints (hintkey, hinttext) VALUES ($1, $2)', [req.body.key, req.body.text]);
      res.json({
        result : true
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/addsubhint', async (req, res) => {
    try {
      const result = await client.query('INSERT INTO sub_hints (parent_hint, hintkey, hinttext) VALUES ($1, $2, $3)', [req.body.parent, req.body.key, req.body.text]);
      res.json({
        result : true
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/addadmin', async (req, res) => {
    try {
      const result = await client.query('INSERT INTO users (login, password, is_admin) VALUES ($1, $2, $3)', [req.body.login, req.body.password, 1]);
      res.json({
        result : true
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .get('/news', async (req, res) => {
    try {
      const result = await client.query('Select c.*, u.name, u.avaurl From main_news as c Inner Join users as u on c.author = u.id ORDER BY c.id DESC');
      res.json({
        result: result.rows
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .get('/deletenews', async (req, res) => {
    try {
      const result = await client.query('DELETE FROM main_news WHERE id = $1', [req.query.id]);
      res.json({
        result : true
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .get('/messages', async (req, res) => {
    try {
      const result = await client.query('SELECT m.*, r.name as r_name, r.avaurl as r_url, s.name as s_name, s.avaurl as s_url From messages as m Inner Join users as r on m.recevier = r.id Inner Join users as s on m.sender = s.id WHERE m.sender = $1 OR m.recevier = $1 ORDER BY m.id DESC', [req.query.id]);
      res.json({
        result: result.rows
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/sendmessage', async (req, res) => {
    try {
      const result = await client.query('INSERT INTO messages (sender, recevier, message, m_type) VALUES ($1, $2, $3, $4)', [req.body.sender, req.body.recevier, req.body.message, 'text']);
      res.json({
        result : true
      })

      const result_device = await client.query('SELECT device_token FROM users WHERE id = $1', [req.body.recevier]);

      if (result_device.rows[0].device_token === null) {
        return
      }

      const result_name = await client.query('SELECT name FROM users WHERE id = $1', [req.body.sender]);

      console.error(result_device.rows[0].device_token);
      console.error(result_name.rows[0].name);

      var name = result_name.rows[0].name

      let notification = new apn.Notification();

      notification.title = name;
      notification.body = req.body.message;
      notification.sound = "default";
      notification.topic = "com.yousters.youstersapp";

      var deviceToken = result_device.rows[0].device_token

      apnProvider.send(notification, deviceToken).then( (result) => {
        console.log(result.sent);
        console.log(result.failed);
      });

    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/uploadmessage', parser.single('image'), async (req, res) => {
    try {
      const result = await client.query('INSERT INTO messages (sender, recevier, message, m_type) VALUES ($1, $2, $3, $4)', [req.query.sender, req.query.recevier, req.file.secure_url, 'image']);
      res.json({
        result : true,
      });

      const result_device = await client.query('SELECT device_token FROM users WHERE id = $1', [req.query.recevier]);

      if (result_device.rows[0].device_token === null) {
        return
      }

      const result_name = await client.query('SELECT name FROM users WHERE id = $1', [req.query.sender]);

      console.error(result_device.rows[0].device_token);
      console.error(result_name.rows[0].name);

      var name = result_name.rows[0].name

      let notification = new apn.Notification();

      notification.title = name;
      notification.body = "🖼 Изображение";
      //notification.badge = 1;
      notification.topic = "com.yousters.youstersapp";

      var deviceToken = result_device.rows[0].device_token

      apnProvider.send(notification, deviceToken).then( (result) => {
        console.log(result.sent);
        console.log(result.failed);
      });

    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }

   })
  .get('/useravatar', async (req, res) => {
    try {
      const result = await client.query('SELECT ava FROM users WHERE id = $1', [req.query.id]);
      res.json({
        result: result.rows[0].ava
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/addnews', async (req, res) => {
    try {
      const result = await client.query('INSERT INTO "main_news" ("author", "liked_by", "stringtime", "news_text") VALUES ($1, $2, $3, $4);', [req.body.author, req.body.liked_by, req.body.date, req.body.news_text]);
      res.json({
        result : true
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/addlawyer', async (req, res) => {
    try {
      const result = await client.query('INSERT INTO "users" ("name", "login", "password", "email", "city", "phone", "user_type", "latitude", "longitude", "cv", "uslugi", "sp", "status", "price", "langs", "link", "want", "ava", "address") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11, $12, $13, $14, $15, $16, $17, $18, $19);',
                                                          [req.body.name, req.body.login, req.body.pass, req.body.email, req.body.city, req.body.phone, req.body.type, req.body.la, req.body.lo, req.body.cv, req.body.uslugi, req.body.sp, req.body.status, req.body.price, req.body.langs, req.body.link, req.body.want, req.body.ava, req.body.address]);

      const id = await client.query('SELECT * FROM users WHERE login = $1', [req.body.login]);
      res.json({
           result : true,
           userID : id.rows[0].id
         })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/delete', async (req, res) => {
    try {
      const result = await client.query('DELETE FROM users WHERE id = $1', [req.body.id]);
      res.json({
        result : true
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/deletehint', async (req, res) => {
    try {
      const result = await client.query('DELETE FROM hints WHERE id = $1', [req.body.id]);
      res.json({
        result : true
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .post('/deletesubhint', async (req, res) => {
    try {
      const result = await client.query('DELETE FROM sub_hints WHERE id = $1', [req.body.id]);
      res.json({
        result : true
      })
    } catch (err) {
      console.error(err);
      res.json({
        result : false
      })
    }
  })
  .get('/dbtest', async (req, res) => {
    try {
      const result = await client.query('SELECT id, name, login, password, email, is_admin, city, phone, user_type, latitude, longitude, cv, uslugi, sp, status, price, langs, link, want, avaurl, isactive, liked_by FROM users WHERE user_type = $1 OR user_type = $2 ORDER BY id DESC', ['Юрист', 'Партнёр']);

      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/admin/lawyers', async (req, res) => {
    try {
      const result = await client.query('SELECT id, name, login, password, email, is_admin, city, phone, user_type, latitude, longitude, address, cv, uslugi, sp, status, price, langs, link, want, avaurl, isactive, liked_by FROM users WHERE user_type = $1 OR user_type = $2 ORDER BY id DESC', ['Юрист', 'Партнёр']);

      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/lawyers', results );
      //.render('pages/main')
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/admin/lawyers/:id', async (req, res) => {
    try {
      const result = await client.query('SELECT id, name, login, email, is_admin, city, phone, user_type, latitude, longitude, address, cv, uslugi, sp, status, price, langs, link, want, avaurl, isactive, liked_by FROM users WHERE id = $1', [req.params.id]);

      const results = { 'results': (result) ? result.rows : null};
      //res.json(result.rows)
      res.render('pages/person/lawyer', results);
      //.render('pages/main')
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .get('/admin/users', async (req, res) => {
    try {
      const result = await client.query('SELECT id, name, login, password, email, city, phone, user_type FROM users WHERE user_type = $1 ORDER BY id DESC', ['Пользователь']);

      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/users', results );
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
