var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const cladman = new (require('./cladman'))();

const Users = require("./routes/users")


var app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
// app.use(session({secret: "TASK IS (NOT) BAD"}))
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(passport.initialize())
// app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
app.use('/api/', Users.router);

module.exports = app;
