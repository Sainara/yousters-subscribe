const express = require('express')
const path = require('path')



import env from './env';
import authRoute from './app/routes/authRoute';
import docsValidationRoute from './app/routes/docsValidationRoute';
import agreementsRoute from './app/routes/agreementsRoute'




const PORT = env.port


var app = express()
const API_PATH = "/api/v1";

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({limit: '50mb'}));
  //.set('views', path.join(__dirname, 'views'))
  //.set('view engine', 'ejs')


app.use(API_PATH, authRoute);
app.use(API_PATH, docsValidationRoute);
app.use(API_PATH, agreementsRoute);
//



app.get('/', async (req, res) => {
     res.json({result:"COOLL"});
   });
app.get('/support', (req, res) => res.render('pages/index'));


app.listen(PORT, () => console.log(`Listening on ${ PORT } 🚀`))

export default app;
