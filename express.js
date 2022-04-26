const express = require ('express'); 
const app = express ();
const pg = require('pg-promise')();

const bodyParser = require('body-parser')
const moment = require('moment')
const winston = require('winston');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({  extended: true}));


//const db = pg("postgres://{userame}:{password}@{host}:{port}/{database}")
const db = pg("postgres://Onyinye34@localhost:5432/postgres")

const logger = winston.createLogger ({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: 'pokedex' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ]
});

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
});

//Select all students
app.get('/students', function (req, res) {
    db.any('SELECT * FROM students').then((students) => res.send(students));
});

//Class schedule
app.get('/schedule', function (req, res) {
    db.any('SELECT * FROM class').then((schedule) => res.send(schedule));
});

//Search by name
app.get('/searchbyname', function (req, res) {
    let name = req.query.name
    db.one('SELECT * FROM students WHERE name = $1', name).then((student) => res.send(student));
});

//Search by name
app.get('/searchbyid', function (req, res) {
    let id = req.query.name
    db.one('SELECT * FROM students WHERE name = $1', id).then((student) => res.send(student));
});


//Adding a student
app.post('/student', async (req, res) => {
    let obj = req.query;
    await db.oneOrNone('SELECT * FROM students WHERE name = $1', obj.name)
    .then((student) => {
        if (student === null) {
            db.query('INSERT INTO students(${this:name}) VALUES(${this:csv})', obj)
            res.statusCode = 200;
            db.one('SELECT * FROM students WHERE name = $1', obj.name)
            .then((addedStudent) => res.send(addedStudent));
        } else if  (student.name === obj.name){
            res.statusCode = 400;
            logger.error({
                "Error": `${obj.name} is already in the pokedex`,
                "Status_Code": res.statusCode
            })
            res.send(`${obj.name} already exists!`)
        }
    })
});

// Delete a student from the student table
app.delete('/students', async (req, res) => {
    let name = req.query.name;
    await db.oneOrNone( 'DELETE FROM students WHERE name = $1', name )
    .then((students) => res.send("deleted"));

});

app.listen(6400)