
const notFoundRoute = function(req, res, next){
  //res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.render('pages/static/404');
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
}

export default notFoundRoute;
