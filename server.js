var express = require('express');
var app = express();
var mongoose = require('mongoose');
var config = require('./configuration.js');
mongoose.connect(config.db);
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');

// Routes
var apiUsers = require('./server/routes/users.js');
var apiStream = require('./server/routes/stream.js');


// Middleware
app.use(express.static(__dirname + '/client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: '$7b$35$.wpd8jhriLDRXwptB8jI.usYsUELftTl/.O42DRuR8T/qtwUb7WEm',
    httpOnly: true,
    saveUninitialized: true,
    resave: true,
    cookie: {
        maxAge: 1800000
    },
    store: new MongoStore({
        url: config.db
    })
}));

// Invoke passport authentication
require('./server/services/passport-auth.js')(app, passport, mongoose);

app.use('/users', apiUsers);
app.use('/', apiStream);

app.post('/login', passport.authenticate('local'), function(req, res) {
    res.json(req.user);
});

app.post('/logout', function(req, res, next) {
    req.logout();
    res.send('200', 'Successfully Logged Out');
});

app.listen(5000, function() {
    console.log("Server running on port 5000");
});
