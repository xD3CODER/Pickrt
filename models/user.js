const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
        firstname: String,
        lastname: String,
        email: String,
        avatar :{
            url: String,
            status: String
        },
        local: {
            password: String
        },
        facebook: {
        id: String,
        token: String,
        username: String
    }
});


userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(6), null);
};


userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
