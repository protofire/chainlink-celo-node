const express = require('express')
const { processTx } = require("./celo.js")

async function setupExpress(contractKit) {
    const app = express()

    app.use(express.json())
    app.use(express.urlencoded())

    app.post("/", async (req, res) => {
        function fail(message) {
            res.status(400).json({
                jobRunId: id,
                data: {},
                status: 'errored',
                error: message || "No error mesage specified."
            })
        }

        const id = req.body.id
        const data = req.body.data.result
        const functionSelector = req.body.data.functionSelector
        const address = req.body.data.address


        if (!id || !address) {
            console.error("no id or data or address")
            fail("Malformed input.")
            return
        }

        try {
            const receipt = await processTx(address, functionSelector, data, contractKit)
            if (!receipt.status) {
                fail(`Transaction reverted. ${receipt.transactionHash}`)
            }
            res.json({
                jobRunId: id,
                data: {
                    result: receipt.transactionHash,
                }
            })
        } catch (e) {
            console.error(e)
            fail("Failed to post the transaction.")
        }
    })

    return app
}

module.exports = setupExpress