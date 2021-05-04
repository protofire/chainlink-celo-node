const express = require('express')
const { processTx, decodeSignature } = require("./celo.js")
const { bigNumberifyWithPrecision } = require("./flux")

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
        const dataPrefix = req.body.data.dataPrefix


        if (!id || !address) {
            console.error("no id or data or address")
            fail("Malformed input.")
            return
        }

        try {
            const receipt = await processTx(address, functionSelector, data, contractKit, dataPrefix)
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

    /**
     * Flux Aggregator handler
     */
    app.post("/flux", async (req, res) => {
        function fail(message) {
            res.status(400).json({
                jobRunId: id,
                data: {},
                status: 'errored',
                error: message || "No error mesage specified."
            })
        }

        const id = req.body.id
        const functionSelector = "submit(uint256,int256)"
        const precision = req.body.data.precision
        const address = req.body.data.address
        // Chainlink gives us this number already ABI encoded.
        const roundId = contractKit.web3.eth.abi.decodeParameter(
            'uint256',
            req.body.data.dataPrefix
        )
        const data = req.body.data.result


        if (!id || !address || !roundId) {
            console.error("no id, address, or round id")
            fail("Malformed input.")
            return
        }

        try {
            const receipt = await processTx(
                address,
                functionSelector,
                [
                    roundId,
                    bigNumberifyWithPrecision(data, precision)
                ],
                contractKit
            )
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