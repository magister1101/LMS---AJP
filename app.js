const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const { default: mongoose, mongo } = require('mongoose');
const dotenv = require('dotenv');

// Router
const userRouter = require('./api/routes/users');
const courseRouter = require('./api/routes/courses');

mongoose.connect('mongodb+srv://ajp:ajppassword@lmsajp.urmno.mongodb.net/');
mongoose.Promise = global.Promise;

app.use(cors());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

// routes
app.use('/users', userRouter);
app.use('/courses', courseRouter);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


module.exports = app;