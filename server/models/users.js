var mongoose = require('mongoose');

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};


var validateLength = function(len) {
    return function(str) {
        if (str && str.length >= len) {
            return true;
        }
        return false;
    };
};


var userSchema = mongoose.Schema({
    name: {
        type: String,
    },
    pass: {
        type: String,
        required: true,
        validate: [{
            validator: validateLength(5),
            msg: 'Your password is too short, it has to be at least 5 characters'
        }]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [{
            validator: validateEmail,
            msg: 'Please use a valid email address'
        }]
    },
    token: {
        type: String
    },
    stream_live: {
        type: Boolean,
        default: false
    },
    stream_user_enabled: {
        type: Boolean,
        default: true
    },
    playerOptions: {
        rtmpHls: {
            type: Boolean,
            default: true
        }
    }
});

userSchema.statics.findByUser = function(name, cb) {
    this.findOne({
        name: name
    }, cb);
};

module.exports = mongoose.model('User', userSchema);
