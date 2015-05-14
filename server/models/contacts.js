var mongoose = require('mongoose');

//Todo@: Create refs
var contactsSchema = mongoose.Schema({
    name: String,
    email: String,
    number: Number,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('contact', contactsSchema);
