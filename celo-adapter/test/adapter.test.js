const { celoSetup, decodeSignature } = require("../src/celo")

describe("Readable ABI decoding", () => {
    test("Success cases", () => {
        const EXPECTED = [
            ["submit(uint256)", {name: "submit", type: "function", inputs: [ 'uint256' ]}],
            ["submit(bytes32)", {name: "submit", type: "function", inputs: [ 'bytes32' ]}],
            ["something_else()", {name: "something_else", type: "function", inputs: []}],
            ["submit(bytes32,address)", {name: "submit", type: "function", inputs: [ 'bytes32', 'address' ]}],
            ["anotherFunction(bytes32,address)", {name: "anotherFunction", type: "function", inputs: [ 'bytes32', 'address' ]}],
            ["call()", {name: "call", type: "function", inputs: []}],
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
})