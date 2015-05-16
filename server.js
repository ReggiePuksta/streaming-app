var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mean_tut');
var apiUsers = require('./server/routes/users.js');
var apiStream = require('./server/routes/stream.js');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var User = mongoose.model('User');

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
    }
}));

// Posport session setup setting
passport.serializeUser(function(user, done) {
    console.log("Serialize run");
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    console.log("Deserialise run");
    User.findById(id)
        .select('-pass')
        .exec(function(err, user) {
            done(err, user);
        });
});

// Passport configuration
passport.use(new LocalStrategy(function(email, password, done) {
    User.findOne({
        email: email
    }, function(err, user) {
        if (err) return done(err);
        if (!user) {
            return done(null, false, {
                message: 'Incorrect usernanme'
            });
        }
        // if (!user.validatePassword(password)) {
        //     return done(null, false, {
        //         message: 'Incorrect password'
        //     });
        // }

        user.pass = '';
        return done(null, user);
    });
}));

app.use(passport.initialize());
app.use(passport.session());

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
