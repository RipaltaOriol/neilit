var i18n = require('i18n');

i18n.configure({
  locales:['en', 'es'],
  directory:__dirname + '/locales',
  default: 'en',
  cookie: 'lang'
});

module.exports = function(req, res, next) {

  i18n.init(req, res);
  return next();

};
