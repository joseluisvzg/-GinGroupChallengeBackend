const eventsRouter = require('express').Router();
const app_config = require('./config');
const database = require('./database.js');
const jwt = require('jsonwebtoken');

eventsRouter.post('/auth', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const data = req.body;
    database.auth(data.email, data.password).then(
        (person) => {
            const token = jwt.sign({}, app_config.jwt_token, {
                expiresIn: 1440
            });
            res.status(200).json({status: "ok", token: token});
        },
        () => {
            res.status(401).json({status: "error", token: "No authorized."});
        }
    );
})

eventsRouter.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    const token = req.headers['token'];
    if (token) {
      jwt.verify(token, app_config.jwt_token, (err, decoded) => {      
        if (err) {
          return res.status(401).json({ data: 'Invalid token.' });    
        } else {
          req.decoded = decoded;    
          next();
        }
      });
    } else {
      res.send({ 
          mensaje: 'Token not provided.' 
      });
    }
 });

// Todo: Validate data from post body
// Todo: Hide password field returned by response (using schema)
eventsRouter.post('/persons', function(req, res) {
    const val = req.body;
    database.save_person(val).then(
        (result) => {
            res.status(201).send(JSON.stringify({status: "ok", data: result}));
        },
        () => {
            res.status(500).send(JSON.stringify({status: "error", data: "Error, database error."}));
        }
    );
});

eventsRouter.get('/persons', function (req, res) {
    let filters = {};
    let valid_filters = new Set();
    valid_filters.add('name');
    valid_filters.add('hobby');
    for(filter in req.query){
        if(valid_filters.has(filter)){
            filters[filter] = req.query[filter];
        }
    }

    database.get_persons(res, filters).then(
        (data) => {
            res.status(200).send(JSON.stringify({status: "ok", data: data}));
        },
        () => {
            res.status(500).send(JSON.stringify({status: "error", data: "Error, database error."}));
        }
    );
});

eventsRouter.get('/persons/filter', function (req, res) {
    database.persons_filter().then(
        (data) => {
            res.status(200).send(JSON.stringify({status: "ok", data: data}));
        },
        () => {
            res.status(500).send(JSON.stringify({status: "error", data: "Error, database error."}));
        }
    );
});

eventsRouter.delete('/persons/:id', function (req, res) {
    let id = req.params.id;
    database.delete_person(id).then(
        () => {
            res.status(200).send(JSON.stringify({status: "ok"}));
        },
        () => {
            res.status(500).send(JSON.stringify({status: "error", data: "Error, database error."}));
        }
    );
});

module.exports = eventsRouter;