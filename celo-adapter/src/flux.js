const Big = require("bignumber.js")

function bigNumberifyWithPrecision(number, precision) {
    const num = new Big(number)
    return new Big(10).pow(precision).times(num).integerValue()
}

module.exports = {
    bigNumberifyWithPrecision
}