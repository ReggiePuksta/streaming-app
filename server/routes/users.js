var express = require('express'),
    router = express.Router();
var User = require('../models/users.js');

// module.exports = function(mongoose) {
    // GET all users from the list
    router.get('/', function(req, res, next) {
        User.find(function(err, docs) {
            if (err) return next(err);
            var result = docs.map(function(doc) {
                return {
                    name: doc.name,
                    live: doc.stream_live
                };
            });
            console.log(result);
            res.json(result);
        });
    });

    // POST, create new user
    router.post('/', function(req, res, next) {
        console.log("We received POST request");
        // Todo implement token generator
        // var token = generateToken();
        var token = Math.floor((Math.random() * Math.pow(10, 16)));
        User.create({
            name: req.body.name,
            email: req.body.email,
            pass: req.body.pass,
            token: token
        }, function(err, doc) {
            if (err) return next(err);
            console.log("Created new doc");
            res.json(doc);
        });
    });

// app.param('user', function(req, res, next, name) {

//   // try to get the user details from the User model and attach it to the request object
//   User.findByUser(name, function(err, user) {
//     if (err) {
//       next(err);
//     } else if (user) {
//       req.user = user;
//       next();
//     } else {
//       next(new Error('failed to load user'));
//     }
//   });
// });

    // GET single user
    router.get('/:user', function(req, res, next) {
        console.log("GET request for single doc");
        User.findByUser(req.params.user, function(err, doc) {
            if (err) return next(err);
            res.json(doc);
        });
    });

    // PUT, update user
    // Has to be protected
    router.put('/:user', function(req, res, next) {
        console.log("PUT request received");
        console.log(req.body);
        User.findOne({
            _id: req.params.user
        }, function(err, doc) {
            doc.name = req.body.name;
            doc.email = req.body.email;
            doc.number = req.body.number;
            doc.save(function(err, doc) {
                if (err) return next(err);
                res.json(doc);
            });
        });
    });

    // DELETE user
    router.delete('/:user', function(req, res, next) {
        console.log("Delete request received");
        console.log(req.params.user);
        User.findById(req.params.user, function(err, doc) {
            if (err) return next(err);
            doc.remove(function(err, doc) {
                if (err) return next(err);
                res.json(doc);
            });
        });
    });

    // API error handler
    router.use('/', function(err, req, res, next) {
        res.status(err.status || 400);
        var errorMessages = [];

        // Detailed Mongoose validation response
        if (app.get('env') === "test") {
            User.keys(err.errors).forEach(function(key) {
                var message = err.errors[key].message;
                errorMessages.push('Validation error for ' + key + ': ' + message);
                console.log(errorMessages);
            });
        } else {
            errorMessages = [err.message];
        }

        // If not validation error then it's
        // internal database error
        if (err.name !== "ValidationError") {
            res.status(500);
            errorMessages = ["Database error"];
        }

        // send json error response
        res.json({
            status: "error",
            messages: errorMessages
        });
    });

    module.exports = router;
// };
