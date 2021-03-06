const express = require ('express'); 
const app = express ();
const pg = require('pg-promise')();

const bodyParser = require('body-parser')
const moment = require('moment')
const winston = require('winston');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({  extended: true}));


//const db = pg("postgres://{userame}:{password}@{host}:{port}/{database}")
const db = pg("postgres://victorbrew@localhost:5432/postgres")

const logger = winston.createLogger ({
    level: "info",
    format: winston.format.json(),
    defaultMeta: { service: 'students' },
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

//Class schedule
app.get('/schedule', function (req, res) {
    db.any('SELECT * FROM class').then((schedule) => res.send(schedule));
});

//Topic by week
app.get('/subject', function (req, res) {
    let week = req.query.week;
    if(week % 2 == 0) {
        db.one('SELECT * FROM class WHERE finish = $1', week).then((subject) => res.send(subject));
    } else{
        db.one('SELECT * FROM class WHERE start = $1', week).then((subject) => res.send(subject));
    }
});


//Search by name
app.get('/searchbyname', function (req, res) {
    let name = req.query.name
    db.one('SELECT * FROM students WHERE name = $1', name).then((student) => res.send(student));
});

//Select all students
app.get('/students', function (req, res) {
    db.any('SELECT * FROM students').then((students) => res.send(students));
});

//Search by id
app.get('/searchbyid', function (req, res) {
    let id = req.query.name
    db.one('SELECT * FROM students WHERE name = $1', id).then((student) => res.send(student));
});


//Get all the grades
app.get('/grades', async function (req, res) {
    await db.query('SELECT ${columns:name} FROM ${table:name}', {
        columns: ['id', 'name', 'front_end', 'back_end'],
        table: 'students',
    })
    .then((allGrades) => res.send(allGrades))
});

//Get grade by name
app.get('/gradesbyname', async (req, res) => {
    let obj = req.query;
    await db.query('SELECT id, name, front_end, back_end FROM students WHERE name = $1', obj.name)
    .then((grade) => res.send(grade))
});

//Get grade by project (front end)
app.get('/gradesbyname/front_end', async (req, res) => {
    let obj = req.query;
    await db.query('SELECT id, name, front_end, back_end FROM students WHERE name = $1', obj.name)
    .then((grade) => res.send(grade))
});

//Get grade by project (back end)
app.get('/gradesbyname/front_end', async (req, res) => {
    let obj = req.query;
    await db.query('SELECT id, name, front_end, back_end FROM students WHERE name = $1', obj.name)
    .then((grade) => res.send(grade))
});

//Get grade by id
app.get('/gradesbyid', async function (req, res) {
    let obj = req.query;
    await db.query('SELECT id, name, front_end, back_end FROM students WHERE id = $1', obj.id)
    .then((grade) => res.send(grade))
});

//Adding a student
app.post('/student', async (req, res) => {
    let obj = req.query;
    await db.oneOrNone('SELECT * FROM students WHERE name = $1', obj.name).then((student) => {
        if (student === null) {
            db.query('INSERT INTO students(${this:name}) VALUES(${this:csv})', obj)
            res.statusCode = 200;
            db.one('SELECT * FROM students WHERE name = $1', obj.name).then((addedStudent) => res.send(addedStudent));
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
//input student grades
app.put('/studentgrades', async (req, res) => {
    console.log("studentgrades");
    let id = req.query.id
    console.log(typeof(id));
    //let newName = req.body.name
    let newFrontend = req.body.front_end 
    let newBackend = req.body.back_end
    console.log(newFrontend, newBackend);
    
    await db.one('SELECT * FROM students WHERE id = $1', id).then((student) => {
        console.log(student);
      if(student === null) {
          res.send(`id: ${id} was not found`)
          res.statusCode = 400;
      } else if (student.id == id){
        db.none('UPDATE students SET front_end = $1, back_end = $2 WHERE id = $3', [newFrontend, newBackend, id])
        res.send(req.body)
        res.statusCode = 200;
      } else {
          console.log("else")
      }
    })
    
    })

app.listen(6400)