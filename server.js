const express = require('express')
const path = require('path')

import moment from 'moment';


import env from './env';

import authRoute from './app/routes/authRoute';
import docsValidationRoute from './app/routes/docsValidationRoute';
import agreementsRoute from './app/routes/agreementsRoute'
import publicAgreementRoute from './app/routes/publicAgreementRoute'
import adminRoute from './app/routes/adminRoute'

import aasa from './ios/apple-app-site-association';



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
app.use('/admin', adminRoute);



app.get('/', async (req, res) => {
     res.render('pages/index');
   });
app.get('/support', (req, res) => res.render('pages/index'));
app.get('/apple-app-site-association', (req, res) => res.json(aasa));


app.listen(PORT, () => console.log(`Listening on ${ PORT } 🚀`))

export default app;
