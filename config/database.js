let options = {
    user : "admin",
    pass : "admin1234",
    port : 21337,
    database : "databases"
};

module.exports = {
    url: 'mongodb://'+options.user+':'+options.pass+'@localhost:'+options.port+'/'+options.database+'?authSource=admin'
};
