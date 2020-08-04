const express = require('express');
const path = require('path');
const cors = require('cors');

import moment from 'moment';
import repeat from "repeat";


import env from './env';

import authRoute from './app/routes/authRoute';
import docsValidationRoute from './app/routes/docsValidationRoute';
import agreementsRoute from './app/routes/agreementsRoute';
import publicAgreementRoute from './app/routes/publicAgreementRoute';
import checkoutRoute from './app/routes/checkoutRoute';
import paketRoute from './app/routes/paketRoute';
import pushRoute from './app/routes/pushRoute';


import adminRoute from './app/routes/adminRoute';

import aasa from './ios/apple-app-site-association';

import legalRoute from './publicApp/routes/legalRoute';
import notFoundRoute from './publicApp/routes/404Route';

import signRoute from './publicApp/routes/signRoute';
import userPageRoute from './publicApp/routes/userPageRoute';


import nonPhizValidationWatcher from './app/watchers/authWatch';


var app = express();
const API_PATH = "/api/v1";
const PORT = env.port;

app.use(function(req, res, next){
    if (req.headers['x-forwarded-proto'] == 'http') {
        return res.redirect(301, 'https://' + req.headers.host + req.url);
    } else {
        return next();
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())
app.use(express.json({limit: '50mb'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use((req, res, next) => {
    res.locals.moment = moment;
    next();
});

app.use(function (req, res, next) {
  console.log('Time:', moment().format("DD.MM.YYYY, HH:mm:ss"));
  console.log(req.url);
  console.log(req.headers['x-real-ip']);
  next();
});

app.set('trust proxy', 1);

repeat()
  .do(() => console.log("check users to validate by nonPhiz"))
  .do(nonPhizValidationWatcher)
  .every(1000 * 60 * 30);


app.use(API_PATH, authRoute);
app.use(API_PATH, docsValidationRoute);
app.use(API_PATH, agreementsRoute);
app.use(API_PATH, checkoutRoute);
app.use(API_PATH, paketRoute);
app.use(API_PATH, pushRoute);


app.use('', publicAgreementRoute);
app.use('', signRoute);
app.use('', userPageRoute);


app.use('/admin', adminRoute);

app.use('/legal', legalRoute);


app.get('/', async (req, res) => {
  res.render('pages/index', { page_title: "Main" });
});
app.get('/support', async (req, res) => {
  res.render('pages/support', { page_title: "Support" });
});

app.get('/.well-known/apple-app-site-association', (req, res) => res.json(aasa));

app.listen(PORT, () => console.log(`Listening on ${ PORT } 🚀`))

app.use(notFoundRoute);

export default app;
