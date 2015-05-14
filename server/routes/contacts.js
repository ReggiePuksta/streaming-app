var express = require('express'),
    router = express.Router();
var Contacts = require('../models/contacts.js');
var User = require('../models/users.js');

// module.exports = function(mongoose) {

// GET all contacts from the list
router.get('/', function(req, res, next) {
    console.log("REceived Get Request");
    User.finOne({
            email: req.session.email
        })
        .populate('contacts')
        .exec(function(err, doc) {
            console.log(doc);
            res.json(doc);
        });

    Contacts.find(function(err, docs) {
        if (err) return next(err);
        console.log(docs);
        res.json(docs);
    });

});

// POST, create new contact
router.post('/', function(req, res, next) {
    console.log("We received POST request");
    Contacts.create({
        name: req.body.name,
        email: req.body.email,
        number: req.body.number
    }, function(err, doc) {
        if (err) return next(err);
        console.log("Created new doc");
        res.json(doc);
    });
});

// GET single contact
router.get('/:id', function(req, res, next) {
    console.log("GET request for single doc");
    Contacts.findById(req.params.id, function(err, doc) {
        if (err) return next(err);
        res.json(doc);
    });
});

// PUT, update contact
router.put('/:id', function(req, res, next) {
    console.log("PUT request received");
    Contacts.findOne({
        _id: req.params.id
    }, function(err, doc) {
        doc.name = req.body.name;
        doc.email = req.body.email;
        doc.number = req.body.number;
        doc.save(function(err, doc) {
            if (err) return next(err);
            console.log("Contactlist updated");
            res.json(doc);
        });
    });
    console.log(req.body);
});

// DELETE contact
router.delete('/:id', function(req, res, next) {
    console.log("Delete request received");
    console.log(req.params.id);
    Contacts.findById(req.params.id, function(err, doc) {
        if (err) return next(err);
        doc.remove(function(err, doc) {
            if (err) return next(err);
            res.json(doc);
        });
    });
});

// API error handler
router.use('/contactlist', function(err, req, res, next) {
    res.status(err.status || 400);
    var errorMessages = [];

    // Detailed Mongoose validation response
    if (app.get('env') === "test") {
        Object.keys(err.errors).forEach(function(key) {
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
