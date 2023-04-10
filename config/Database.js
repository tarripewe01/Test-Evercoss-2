const Sequelize = require('sequelize');

const db = new Sequelize('test_evercoss', 'root', '990099', {
    host: "localhost",
    dialect: "mysql"
})

module.exports = db;

