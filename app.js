var express = require('express');
var http = require('http');
var app = express();

var indexRouter = require('./routes/index');
app.use(express.static(__dirname + '/public'));

port = 3000;
http.createServer(app).listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});