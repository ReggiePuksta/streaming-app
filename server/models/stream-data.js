var mongoose = require('mongoose');

//Todo@: Create refs
var streamData = mongoose.Schema({
    src: mongoose.Schema.Types.Mixed,
    hls: mongoose.Schema.Types.Mixed,
    date: {
        type: Date,
        default: Date.now
    },
    type: String
});

module.exports = mongoose.model('StreamData', streamData);
