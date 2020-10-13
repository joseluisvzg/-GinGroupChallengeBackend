const express = require('express');
const bodyParser = require('body-parser');
const eventsRouter = require('./routes');
const database = require('./database');
var cors = require('cors');

var app = express();
var port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/api', eventsRouter);

database.connect_db();

app.listen(port);
console.log("App running. Visit: http://localhost:" + port + "/");

