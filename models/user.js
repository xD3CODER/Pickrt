var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');

var userSchema = mongoose.Schema({
  local: {
    firstname: String,
    lastname: String,
    email: String,
    password: String
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    firstname: String,
    lastname: String,
    username: String,
    avatar: String
  },
  twitter: {
    id: String,
    token: String,
    displayName: String,
    username: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  }
});




userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(6), null);
};


userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
