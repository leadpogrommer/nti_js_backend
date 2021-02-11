var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
// var LocalStrategy = require('passport-local').Strategy
// var passport = require('passport')
// var session = require("express-session")

const Users = require("./routes/users")

// passport.use('local', new LocalStrategy((username, password, done) => {
//     let user = Users.getUser(username);
//     if(!user){
//         return done(null, false, {message: "Incorrect username"});
//     }
//     if(!Users.validatePassword(user, password)){
//         return done(null, false, {message: "Incorrect password"});
//     }
//     return done(null, user)
//
// }));
//
// passport.serializeUser((user, done) => {
//     done(null, user.username)
// });
//
// passport.deserializeUser(async (name, done) => {
//     let user = await Users.getUser(name);
//     done(null, user)
// });


// var indexRouter = require('./routes/index');


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
