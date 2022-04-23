const express = require ('express'); 
const app = express ();
const pg = require('pg-promise')();

const bodyParser = require('body-parser')
// const moment = require('moment')
const winston = require('winston');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({  extended: true}))


//const db = pg("postgres://{userame}:{password}@{host}:{port}/{database}")
const db = pg("postgres://luna@localhost:5432/postgres")

const logger = winston.createLogger ({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: 'pokedex' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ]
})

//Middleware is the mediary that modifies information sent between the client and the server
app.all('*', (req, res, next) => {
    logger.info({
        "Action": req.method,
        "Path": req.path,
        "Status_Code": res.statusCode,
        "Content-Type": req.header('Content-Type'),
        "Body": req.body,
        "Time": moment().format('MM/DD/YYYY, h:mm:ss a'),
    })
    next()
})