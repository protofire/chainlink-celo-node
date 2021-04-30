require('dotenv').config()

const PORT = process.env.PORT || 8080

const setupExpress = require("./app")
const { celoSetup } = require("./celo")

celoSetup()
    .then(
        kit => setupExpress(kit)
    )
    .then(
        app => app.listen(PORT)
    )
    .then(
        () => console.log(`Listening on port ${PORT}`)
    )