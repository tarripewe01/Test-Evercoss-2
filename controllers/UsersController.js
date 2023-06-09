const UsersModel = require('../models/UserModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Register = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body
    if (password != confirmPassword) return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok " })

    const salt = await bcrypt.genSalt()
    const hashPassword = await bcrypt.hash(password, salt)

    try {
        await UsersModel.create({
            name: name,
            email: email,
            password: hashPassword
        })
        res.json({ msg: "Register Berhasil" })
    } catch (error) {
        console.log(error)
    }
}

const Login = async (req, res) => {
    try {
        const user = await UsersModel.findAll({
            where: {
                email: req.body.email
            }
        })

        // Jika akun pengguna terkunci, maka kirimkan pesan error
        if (user[0].lockedUntil && user[0].lockedUntil > Date.now()) {
            const remainingTime = Math.ceil((user.lockedUntil - Date.now()) / 1000);
            return res.status(401).json({ msg: `Account is locked. Please try again in 5 minutes.`})
        }

        // Periksa password
        const match = await bcrypt.compare(req.body.password, user[0].password)
        if (!match) {
            // Jika password salah, maka increment counter loginAttempts
            await user[0].increment('loginAttempts');
            const loginAttempts = user[0].getDataValue('loginAttempts');
            if (loginAttempts >= 2) {
                // Jika pengguna salah memasukkan password sebanyak tiga kali, maka kunci akun selama lima menit
                await user[0].update({ loginAttempts: 0, lockedUntil: Date.now() + 300000 });
                return res.status(401).json({ msg: 'Too many failed login attempts. Account is locked for 5 minutes.'})
            }
            return res.status(401).json({ msg: 'Invalid email or password.' });
        }

        // Jika kata sandi benar, maka reset counter loginAttempts
        await user[0].update({ loginAttempts: 0 });

        const userId = user[0].id
        const name = user[0].name
        const email = user[0].email

        const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_SECRET_TOKEN, {
            expiresIn: '3600s'
        })
        const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_SECRET_TOKEN, {
            expiresIn: '1d'
        })

        // Simpan kedalam database
        await UsersModel.update({ refresh_token: refreshToken }, {
            where: {
                id: userId
            }
        })

        // Http cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            // secure: true => gunakan saat berada di https
        })

        // kirimkan access token kepada client
        res.json({ accessToken })
    } catch (error) {
        res.status(404).json({ msg: "Email tidak ditemukan" })
    }
}

const Logout = async (req, res) => {

    const refreshToken = req.cookies.refresh_token
    if (!refreshToken) return res.sendStatus(204)

    const user = await UsersModel.findAll({
        where: {
            refresh_token: refreshToken
        }
    })

    if (!user[0]) return res.sendStatus(204)

    const userId = user[0].id
    await UsersModel.update({ refresh_token: null }, {
        where: {
            id: userId
        }
    })
    res.clearCookie('refresh_token')
    return res.sendStatus(200)
}

const getUsers = async (req, res) => {
    try {
        const users = await UsersModel.findAll({
            attributes: ['id', 'name', 'email', 'loginAttempts', 'lockedUntil']
        })
        res.json(users)
    } catch (error) {
        console.log(error)
    }
}

const DeleteById = async (req, res) => {
    const userId = req.params.id; // gunakan parameter `id` dari URL untuk mendapatkan ID pengguna
    try {
        const numDeleted = await UsersModel.destroy({
            where: {
                id: userId
            }
        });
        if (numDeleted === 0) {
            // penghapusan gagal, karena tidak ada baris yang dihapus
            res.status(404).json({ message: `User with ID ${userId} not found` });
        } else {
            // penghapusan berhasil, mengembalikan jumlah baris yang dihapus
            res.json({ message: `user dengan id ${userId} berhasil` });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { getUsers, Register, Login, Logout , DeleteById};