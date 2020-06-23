const express = require('express')
const path = require('path')

import moment from 'moment';


import env from './env';
import authRoute from './app/routes/authRoute';
import docsValidationRoute from './app/routes/docsValidationRoute';
import agreementsRoute from './app/routes/agreementsRoute'
import publicAgreementRoute from './app/routes/publicAgreementRoute'




const PORT = env.port


var app = express()
const API_PATH = "/api/v1";

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({limit: '50mb'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use((req, res, next) => {
    res.locals.moment = moment;
    next();
});

app.use(API_PATH, authRoute);
app.use(API_PATH, docsValidationRoute);
app.use(API_PATH, agreementsRoute);
//

app.use('', publicAgreementRoute);



app.get('/', async (req, res) => {
     res.json({result:"COOLL"});
   });
app.get('/support', (req, res) => res.render('pages/index'));


app.listen(PORT, () => console.log(`Listening on ${ PORT } 🚀`))

export default app;
