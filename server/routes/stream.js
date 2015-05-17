// get user information for each player
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var StreamData = require('../models/stream-data.js');
var request = require('../services/getXmlToJson.js');
var http = require('http');

// Make Data requests every 10 seconds from the stream server
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
}, 10000);

router.put('/token', function(req, res, next) {
    User.findByUser(req.user.name, function(err, doc) {
        if (err) return res.status(500).json({
            err: "server error"
        });
        if (!doc) {
            return res.json({
                err: "No user"
            });
        }
        doc.token = Math.floor((Math.random() * Math.pow(10, 16)));
        doc.save(function(err, doc2) {
            if (err) {
                return res.json({
                    error: "ERROR while saving user"
                });
            }
            res.json({
                token: doc2.token
            });

        });
    });
});

// Publisher option to dissable live-streaming
router.put('/enable_live', function(req, res, next) {
    User.findByUser(req.user.name, function(err, doc) {
        if (err) return res.status(500).json({
            err: "Server error"
        });
        if (!doc) {
            return res.json({
                err: "No user"
            });
        }
        // Set new values

        doc.stream_user_enabled = !doc.stream_user_enabled;
        doc.save(function(err, doc2) {
            if (err) {
                return res.json({
                    error: "Failed to save user data"
                });
            }
            res.json({
                streamLive: doc2.stream_user_enabled
            });
        });
    });
});

// Publisher option to enable/dissable rtmpHls delivery
router.put('/rtmp_hls', function(req, res, next) {
    console.log("RTMP HLS request");
    User.findByUser(req.user.name, function(err, doc) {
        if (err) return res.status(500).json({
            err: "Server error"
        });
        if (!doc) {
            return res.json({
                err: "No user"
            });
        }
        // Set new values
        doc.playerOptions.rtmpHls = !doc.playerOptions.rtmpHls;
        doc.save(function(err, doc2) {
            if (err) {
                return res.json({
                    error: "Failed to save user data"
                });
            }
            res.json({
                rtmpHls: doc2.playerOptions.rtmpHls
            });
        });
    });
});

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

// Nginx ingest stream validation "on_publish"
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

// Needs to be protected from other users accessing it,
// only media server is allowed to access this.
router.post('/stream_end', function(req, res) {
    var userStream = req.body.name;
    console.log("User: " + userStream + " stream ended");

    // implement findByUserTokenName search
    User.findByUser(userStream, function(err, doc) {
        if (err) return res.status(500).end();
        if (doc) {
            doc.update({
                stream_live: false
            }, function(err) {
                if (err) return res.status(500).end();
                return res.status(200).end();
            });
        } else {
            return res.status(401).end();
        }
    });
});

module.exports = router;
