const { newKit } = require('@celo/contractkit')
const { ethers } = require("ethers")

function getAccount(kit) {
    if (!process.env.PRIVATE_KEY) {
        throw new Error("No private key set.")
    }
    return kit.web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY)
}

async function celoSetup() {
    const kit = newKit(
        process.env.CELO_RPC || "https://alfajores-forno.celo-testnet.org"
    )
    const account = getAccount(kit)
    kit.addAccount(account.privateKey)
    kit.defaultAccount = account.address
    return kit
}

function decodeSignature(readableSelector) {
    const selectorRegex = new RegExp("([a-zA-Z0-9_]*)\\\((([a-zA-Z0-9]+(,?(?!\\\)))?)+)?\\\)$")
    const match = readableSelector.match(selectorRegex)

    if (!match) {
        throw new Error(`Readable ABI malformed: ${readableSelector} is not valid.`)
    }

    const name = match[1]
    const params = match[2]

    if (params) {
        return {
            name: name,
            type: "function",
            inputs: params.split(",")
        }
    } else {
        return {
            name,
            type: "function",
            inputs: []
        }
    }
} 

async function processTx(destination, readableSelector, data, kit) {
    const call = kit.web3.eth.abi.encodeFunctionCall(
        decodeSignature(readableSelector),
        data?[data]:[]
    )

    const tx = await kit.sendTransaction({
        data: call,
        to: destination,
        from: kit.defaultAccount.address
    })
    const rcpt = await tx.waitReceipt()

    return rcpt
}

module.exports = {
    getAccount,
    celoSetup,
    decodeSignature,
    processTx
}