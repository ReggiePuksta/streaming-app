module.exports = function(app, passport, mongoose) {
    var LocalStrategy = require('passport-local').Strategy;
    var User = mongoose.model('User');
    // Posport session setup setting
    
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
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
            if (!user.validatePassword(password)) {
                return done(null, false, {
                    message: 'Incorrect password'
                });
            }

            return done(null, user);
        });
    }));

    app.use(passport.initialize());
    app.use(passport.session());
};
