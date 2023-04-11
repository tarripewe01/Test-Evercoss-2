const jwt = require("jsonwebtoken");
const UsersModel = require("../models/UserModel");

const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token
        if (!refreshToken) return res.sendStatus(401)

        const user = await UsersModel.findAll({
            where: {
                refresh_token: refreshToken
            }
        })

        if (!user[0]) return res.sendStatus(403)
        jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN, (err, decode) => {
            if (err) return res.sendStatus(403)

            const userId = user[0].id
            const name = user[0].name
            const email = user[0].email

            const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_SECRET_TOKEN, {
                expiresIn: '3600s'
            })

            res.json({ accessToken })

        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = refreshToken