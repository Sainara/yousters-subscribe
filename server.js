const express = require('express');
const socket = require("socket.io");

const path = require('path');
const cors = require('cors');

import moment from 'moment';
import repeat from "repeat";


import env from './env';

import authRoute from './app/routes/authRoute';
import docsValidationRoute from './app/routes/docsValidationRoute';
import agreementsRoute from './app/routes/agreementsRoute';
import dialogRoute from './app/routes/dialogRoute';
import publicAgreementRoute from './app/routes/publicAgreementRoute';
import checkoutRoute from './app/routes/checkoutRoute';
import paketRoute from './app/routes/paketRoute';
import pushRoute from './app/routes/pushRoute';
import reportRoute from './app/routes/reportRoute';

//import kassaData from './static/merchant.ru.yandex.kassa'


import adminRoute from './app/routes/adminRoute';

import aasa from './ios/apple-app-site-association';

import legalRoute from './publicApp/routes/legalRoute';
import notFoundRoute from './publicApp/routes/404Route';

import signRoute from './publicApp/routes/signRoute';
import userPageRoute from './publicApp/routes/userPageRoute';


import nonPhizValidationWatcher from './app/watchers/authWatch';




var expressWs = require('express-ws')(express());

var app = expressWs.app;

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

  repeat()
    .do(() => console.log(expressWs.getWss()))
    .every(5 * 1000);


app.use(API_PATH, authRoute);
app.use(API_PATH, dialogRoute);

app.use(API_PATH, docsValidationRoute);
app.use(API_PATH, agreementsRoute);
app.use(API_PATH, checkoutRoute);
app.use(API_PATH, paketRoute);
app.use(API_PATH, pushRoute);
app.use(API_PATH, reportRoute);


app.use('', publicAgreementRoute);
app.use('', signRoute);
app.use('', userPageRoute);


app.use('/admin', adminRoute);

app.use('/legal', legalRoute);


app.get('/', async (req, res) => {
  console.log("not ws;");
  res.render('pages/index', { page_title: "Main" });
});
app.get('/support', async (req, res) => {
  res.render('pages/support', { page_title: "Support" });
});

app.get('/.well-known/apple-app-site-association', (req, res) => res.json(aasa));
app.get('/.well-known/apple-developer-merchantid-domain-association', (req, res) => res.send('7B227073704964223A2236354545363242363931303142343742414637434132324336344232453843314531353341373238363339453042333731454543434341324237463345354535222C2276657273696F6E223A312C22637265617465644F6E223A313536353731323134383430382C227369676E6174757265223A223330383030363039326138363438383666373064303130373032613038303330383030323031303133313066333030643036303936303836343830313635303330343032303130353030333038303036303932613836343838366637306430313037303130303030613038303330383230336536333038323033386261303033303230313032303230383638363066363939643963636137306633303061303630383261383634386365336430343033303233303761333132653330326330363033353530343033306332353431373037303663363532303431373037303663363936333631373436393666366532303439366537343635363737323631373436393666366532303433343132303264323034373333333132363330323430363033353530343062306331643431373037303663363532303433363537323734363936363639363336313734363936663665323034313735373436383666373236393734373933313133333031313036303335353034306130633061343137303730366336353230343936653633326533313062333030393036303335353034303631333032353535333330316531373064333133363330333633303333333133383331333633343330356131373064333233313330333633303332333133383331333633343330356133303632333132383330323630363033353530343033306331663635363336333264373336643730326436323732366636623635373232643733363936373665356635353433333432643533343134653434343234663538333131343330313230363033353530343062306330623639346635333230353337393733373436353664373333313133333031313036303335353034306130633061343137303730366336353230343936653633326533313062333030393036303335353034303631333032353535333330353933303133303630373261383634386365336430323031303630383261383634386365336430333031303730333432303030343832333066646162633339636637356532303263353064393962343531326536333765326139303164643663623365306231636434623532363739386638636634656264653831613235613863323165346333336464636538653261393663326636616661313933303334356334653837613434323663653935316231323935613338323032313133303832303230643330343530363038326230363031303530353037303130313034333933303337333033353036303832623036303130353035303733303031383632393638373437343730336132663266366636333733373032653631373037303663363532653633366636643266366636333733373033303334326436313730373036633635363136393633363133333330333233303164303630333535316430653034313630343134303232343330306239616565656434363331393761346136356132393965343237313832316334353330306330363033353531643133303130316666303430323330303033303166303630333535316432333034313833303136383031343233663234396334346639336534656632376536633466363238366333666132626266643265346233303832303131643036303335353164323030343832303131343330383230313130333038323031306330363039326138363438383666373633363430353031333038316665333038316333303630383262303630313035303530373032303233303831623630633831623335323635366336393631366536333635323036663665323037343638363937333230363336353732373436393636363936333631373436353230363237393230363136653739323037303631373237343739323036313733373337353664363537333230363136333633363537303734363136653633363532303666363632303734363836353230373436383635366532303631373037303663363936333631363236633635323037333734363136653634363137323634323037343635373236643733323036313665363432303633366636653634363937343639366636653733323036663636323037353733363532633230363336353732373436393636363936333631373436353230373036663663363936333739323036313665363432303633363537323734363936363639363336313734363936663665323037303732363136333734363936333635323037333734363137343635366436353665373437333265333033363036303832623036303130353035303730323031313632613638373437343730336132663266373737373737326536313730373036633635326536333666366432663633363537323734363936363639363336313734363536313735373436383666373236393734373932663330333430363033353531643166303432643330326233303239613032376130323538363233363837343734373033613266326636333732366332653631373037303663363532653633366636643266363137303730366336353631363936333631333332653633373236633330306530363033353531643066303130316666303430343033303230373830333030663036303932613836343838366637363336343036316430343032303530303330306130363038326138363438636533643034303330323033343930303330343630323231303064613163363361653862653566363466386531316538363536393337623962363963343732626539336561633332333361313637393336653461386435653833303232313030626435616662663836396633633063613237346232666464653466373137313539636233626437313939623263613066663430396465363539613832623234643330383230326565333038323032373561303033303230313032303230383439366432666266336139386461393733303061303630383261383634386365336430343033303233303637333131623330313930363033353530343033306331323431373037303663363532303532366636663734323034333431323032643230343733333331323633303234303630333535303430623063316434313730373036633635323034333635373237343639363636393633363137343639366636653230343137353734363836663732363937343739333131333330313130363033353530343061306330613431373037303663363532303439366536333265333130623330303930363033353530343036313330323535353333303165313730643331333433303335333033363332333333343336333333303561313730643332333933303335333033363332333333343336333333303561333037613331326533303263303630333535303430333063323534313730373036633635323034313730373036633639363336313734363936663665323034393665373436353637373236313734363936663665323034333431323032643230343733333331323633303234303630333535303430623063316434313730373036633635323034333635373237343639363636393633363137343639366636653230343137353734363836663732363937343739333131333330313130363033353530343061306330613431373037303663363532303439366536333265333130623330303930363033353530343036313330323535353333303539333031333036303732613836343863653364303230313036303832613836343863653364303330313037303334323030303466303137313138343139643736343835643531613565323538313037373665383830613265666465376261653464653038646663346239336531333335366435363635623335616532326430393737363064323234653762626130386664373631376365383863623736626236363730626563386538323938346666353434356133383166373330383166343330343630363038326230363031303530353037303130313034336133303338333033363036303832623036303130353035303733303031383632613638373437343730336132663266366636333733373032653631373037303663363532653633366636643266366636333733373033303334326436313730373036633635373236663666373436333631363733333330316430363033353531643065303431363034313432336632343963343466393365346566323765366334663632383663336661326262666432653462333030663036303335353164313330313031666630343035333030333031303166663330316630363033353531643233303431383330313638303134626262306465613135383333383839616134386139396465626562646562616664616362323461623330333730363033353531643166303433303330326533303263613032616130323838363236363837343734373033613266326636333732366332653631373037303663363532653633366636643266363137303730366336353732366636663734363336313637333332653633373236633330306530363033353531643066303130316666303430343033303230313036333031303036306132613836343838366637363336343036303230653034303230353030333030613036303832613836343863653364303430333032303336373030333036343032333033616366373238333531313639396231383666623335633335366361363262666634313765646439306637353464613238656265663139633831356534326237383966383938663739623539396639386435343130643866396465396332666530323330333232646435343432316230613330353737366335646633333833623930363766643137376332633231366439363466633637323639383231323666353466383761376431623939636239623039383932313631303639393066303939323164303030303331383230313863333038323031383830323031303133303831383633303761333132653330326330363033353530343033306332353431373037303663363532303431373037303663363936333631373436393666366532303439366537343635363737323631373436393666366532303433343132303264323034373333333132363330323430363033353530343062306331643431373037303663363532303433363537323734363936363639363336313734363936663665323034313735373436383666373236393734373933313133333031313036303335353034306130633061343137303730366336353230343936653633326533313062333030393036303335353034303631333032353535333032303836383630663639396439636361373066333030643036303936303836343830313635303330343032303130353030613038313935333031383036303932613836343838366637306430313039303333313062303630393261383634383836663730643031303730313330316330363039326138363438383666373064303130393035333130663137306433313339333033383331333333313336333033323332333835613330326130363039326138363438383666373064303130393334333131643330316233303064303630393630383634383031363530333034303230313035303061313061303630383261383634386365336430343033303233303266303630393261383634383836663730643031303930343331323230343230306463316331626362653237356662363066663361663437363239636464353866396263323138333034653866323738613463313830316237353466653839363330306130363038326138363438636533643034303330323034343733303435303232313030396563323139666431396663326661326536373232393730393538333831343338366265343264353864323634303262643665383265633833323636336539333032323033363863323238616362313731393261653434626538366535386235313461636235386337396438663839373936323735653837363730373435363735333432303030303030303030303030227D'));

const server = app.listen(PORT, () => console.log(`Listening on ${ PORT } 🚀`))

app.use(notFoundRoute);



// const io = socket(server);
//
// io.on("connection", function (socket) {
//   console.log("Made socket connection");
// });
//
// io.on("token", function (data) {
//   console.log("Made token");
//   console.log(data);
// });

export default app;
