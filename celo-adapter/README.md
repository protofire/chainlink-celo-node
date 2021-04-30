# Chainlink <===> Celo External Adapter
This adapter allows Celo transactions to be triggered from a Chainlink Node.

## Setup
- `yarn`
- Either specify a `PORT` and `PRIVATE_KEY` through environment variables or place these values in a .env file in this directory.

## Running
`yarn start`

## Testing (with Jest)
`yarn test`

## Considerations and possible improvements
- This adapter uses Celo's native token Celo to pay for transactions, instead of opting to pay gas with ERC20 tokens.
- The adapter can't make sense of POSTs to execute a transaction with a method that has more than one parameter. It will do its best to parse the data into a sensible call.
- We're currently using a regular expression to parse the Readable ABI that comes from the Chainlink Node, with [this](https://www.debuggex.com/r/U_ykGE_Y2vzIxN0z) behaviour. It parses all expected cases which comply with the syntax for the `functionSelector` argument of the Chainlink `EthTx` core adapter.
