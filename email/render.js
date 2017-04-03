var fs = require('fs');
var swig  = require('swig');

var meta = require('./meta');

var result = swig.renderFile('email.tpl.html', meta);


fs.writeFile('email.html', result, (err) => {
  if (err) throw err;
  console.log('It\'s saved!');
})
