const mongoose = require('mongoose');
const express = require('express');
const app = express();
require('dotenv').config();
const compression = require('compression');
const helmet = require('helmet');

const path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const indexRouter = require('./routes/index.js');
const usersRouter = require('./routes/users.js');
const catalogRouter = require('./routes/catalog.js');

//Setup views and view library
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Database Setup
const url = process.env.MONGODB_URI;
//Setting the default connection
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

//Getting the default connection
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error: '));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(helmet());
//Route Handling
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter); //Adding catalog to the middleware chain

module.exports = app;
