import express from 'express';


const renderSignPage = async (req, res) => {
  res.render('pages/web_app/sign');
};


export {
  renderSignPage
};
