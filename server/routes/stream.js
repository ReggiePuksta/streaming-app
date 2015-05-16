// get user information for each player
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var StreamData = require('../models/stream-data.js');
var request = require('../services/getXmlToJson.js');
var http = require('http');

// Make Data requests from the stream server
setInterval(function() {
    request.getXmlToJson(function(result) {
        StreamData.update({
                type: "app"
            }, {
                $set: {
                    "src": result[0],
                    "hls": result[1]
                }
            }, {
                "upsert": true,
            },
            function(err) {
                if (err) {
                    console.log(err);
                }
            });
    });
}, 5000);

// Get RTMP stream stats
router.get('/stream_data/:username', function(req, res, next) {
    var username = req.params.username;
    StreamData.findOne({
            'src.name': username
        }, {
            "src.$": 1
        },
        function(err, doc) {
            if (err) return next(err);
            if (doc && doc.src) {
                res.json(doc.src[0]);
            } else {
                res.json({
                    "error": "no available strea data"
                });
            }
        });
});

// Checks if user is live
router.get('/check_live/:user', function(req, res) {
    var username = req.params.user;
    User.findByUser(username, function(err, doc) {
        if (err) return res.status(500).json({
            err: "server error"
        });
        if (!doc) {
            return res.json({
                err: "No user"
            });
        }
        if (doc.stream_live) {
            return res.json({
                stream_live: doc.stream_live,
                playerOptions: doc.playerOptions
            });
        }
        return res.json({
            stream_live: false
        });
    });
});

// Nginx stream validation "on_publish"
router.post('/stream_start', function(req, res) {
    // get RTMP stream name from the request body
    var userStream = req.body.name;
    // streamh value is
    var token = req.body.streamh;
    // validate RTMP token
    if (!token && token.length !== 16) {
        return res.status(401).end();
    }

    // Get User document
    User.findByUser(userStream, function(err, doc) {
        if (err) return res.status(500).end();
        // If user exists
        if (doc) {
            // RTMP ingest stream token is equivalent to users token in the database
            // And user has enabled stream.
            if (doc.token === token && doc.stream_user_enabled) {
                doc.update({
                    stream_live: true
                }, function(err) {
                    if (err) return res.status(500).end();
                    return res.status(200).end();
                });
            } else {
                // Identification failed
                return res.status(401).end();
            }
        } else {
            // User was not found
            return res.status(401).end();
        }
    });

});

// Protect from other users accessing it,
// only media server is allowed to access this.
router.post('/stream_end', function(req, res) {
    var userStream = req.body.name;
    console.log("User: " + userStream + " stream ended");

    // implement findByUserTokenName search
    User.findByUser(userStream, function(err, doc) {
        console.log("We are looking for the user");
        if (err) return res.status(500).end();
        console.log("Our document is like this:");
        console.log(doc);
        if (doc) {
            doc.update({
                stream_live: false
            }, function(err) {
                if (err) return res.status(500).end();
                console.log("Successfully ended");
                return res.status(200).end();
            });
        } else {
            console.log("doc was not found");
            return res.status(401).end();
        }
    });
});

module.exports = router;
