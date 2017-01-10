const mongoose = require('mongoose');

const spamSchema = mongoose.Schema({
    browser: String,
    ip_adress: String,
    attempts: Array
});

module.exports = mongoose.model('Spam', spamSchema);
