const express = require('express');
const dotenv = require('dotenv')
const db = require('./config/Database')
const router = require('./routes/index')

const port = 3000;
const app = express();
dotenv.config()

try {
    db.authenticate()
    console.log('Database Connected')
} catch (error) {
    console.error(error)
}

app.use(express.json())
app.use(router)

app.listen(port, () => {
    console.log('Server jalan di port 3000')
})