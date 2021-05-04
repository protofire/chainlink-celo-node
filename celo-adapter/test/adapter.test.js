const Big = require("bignumber.js")
const { celoSetup, decodeSignature } = require("../src/celo")
const { bigNumberifyWithPrecision } = require("../src/flux")

describe("Readable ABI decoding", () => {
    test("Success cases", () => {
        const EXPECTED = [
            ["submit(uint256)", {name: "submit(uint256)", type: "function", inputs: [ 'uint256' ]}],
            ["submit(bytes32)", {name: "submit(bytes32)", type: "function", inputs: [ 'bytes32' ]}],
            ["something_else()", {name: "something_else()", type: "function", inputs: []}],
            ["submit(bytes32,address)", {name: "submit(bytes32,address)", type: "function", inputs: [ 'bytes32', 'address' ]}],
            ["anotherFunction(bytes32,address)", {name: "anotherFunction(bytes32,address)", type: "function", inputs: [ 'bytes32', 'address' ]}],
            ["call()", {name: "call()", type: "function", inputs: []}],
        ]

        for (let [input, result] of EXPECTED) {
            const decoded = decodeSignature(input)
            expect(decoded.name).toEqual(result.name)
            expect(decoded.type).toEqual(result.type)
            expect(decoded.inputs.length).toStrictEqual(result.inputs.length)
            for (let i = 0; i < decoded.inputs.length; i++) {
                expect(decoded.inputs[i]).toEqual(result.inputs[i])
            }
        }
    })

    test("Failure cases", () => {
        const FAILURES = [
            "submit( address )",
            "sub()mit",
            "",
            "submit(address,)",
            "()submit",
            "(*@#&$SOME RANDOM CHARACTERS",
            "NotAValidFunction["
        ]

        for (let failure of FAILURES) {
            expect(() => decodeSignature(failure)).toThrow()
        }
    })
})

describe("Getting a CeloContractKit Instance", () => {
    // before...
    process.env.PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000001"
    process.env.CELO_RPC = "https://alfajores-forno.celo-testnet.org"

    test("Should fail if no private key is set", async () => {
        process.env.PRIVATE_KEY = null
        expect(celoSetup()).rejects.toThrow()
    })
    test("Should fail if the private key is malformed", async () => {
        process.env.PRIVATE_KEY = "completely random text here, do not read"
        expect(celoSetup()).rejects.toThrow()
    })
    test("Should succeed if there is a valid private key set", async () => {
        process.env.PRIVATE_KEY = "0x0000000000000000000000000000000000000000000000000000000000000001"
        expect(celoSetup()).resolves.not.toThrow()
    })
    test("Should fail if there is no valid RPC set", async () => {
        process.env.CELO_RPC = null
        expect(celoSetup()).rejects.toThrow()
    })
    test("Should succeed if there is a valid RPC set", async () => {
        process.env.CELO_RPC = "https://alfajores-forno.celo-testnet.org"
        expect(celoSetup()).resolves.not.toThrow()
    })
})

describe("Big Number formatter", () => {
    test("Should return expected values", () => {
        EXPECTED = [
            ["1", 8], new Big("100000000"),
            ["10", 7], new Big("100000000"),
            ["2750.17", 8], new Big("275017000000")
        ]

        for (let [args, expected] of EXPECTED) {
            expect(bigNumberifyWithPrecision(...args)).toEqual(expected)
        }
    })
})