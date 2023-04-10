const Sequelize = require('sequelize');
const db = require('../config/Database')

const { DataTypes } = Sequelize

const Users = db.define('users', {
    name: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    },
    refresh_token: {
        type: DataTypes.TEXT
    },
    loginAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    lockedUntil: {
        type: Sequelize.DATE,
        defaultValue: null
    }
}, {
    freezeTableName: true
})

module.exports = Users;