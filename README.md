# Chainlink Celo Development Node	

<p align="center"><a href="https://protofire.io">By Protofire</a></p>

This folder contains all files required to run a Chainlink Node for the Celo Alfajores Testnet. You will need `docker` and `docker-compose` 

## Contract Deployment

All Chainlink v6 contracts required (including LinkToken, Oracle, AccessControlledAggregator and EACAggregatorProxy) have been tested, verified and working on Celo. For the test we did an ETH/USD price aggregator with only one Oracle node.

Deploying these contracts required no code modifications, and can be deployed using Remix, follwing standard procedure while making use of the [Celo Remix Plugin](https://github.com/dexfair/celo-remix-plugin), which is included in the Plugins tab of the Remix interface and is completely usable with Metamask or other web3 providers.

> Developing on Celo is not as straightforward as one would imagine coming from Ethereum or other strictly EVM compatible chains.
> To get some CELO, please use the provided [faucet](https://celo.org/developers/faucet)

## Configure

There are four files to configure in this folder, `.env.chainlink`, `.env.postgres`, `data/password` and `data/api`. All files should already be present in this folder, just configure them to your liking. 

* `.env.chainlink` - All environment variables for the Chainlink Node. The ones present are the ones used for internal testing and validated as working on Dusty.
* `.env.postgres` - All environment variables for the Postgres Database server. 
* `data` - This folder is mapped via docker to `/chainlink` in the Chainlink Node container
* `data/password` - The password used by the Chainlink Node to lock the wallet
* `data/api` - The password used by the Chainlink Node used for login and API calls

For the postgres database password, please make sure they match in both `.env.chainlink` and `.env.postgres`. 

> **IMPORTANT** Make sure that `ETH_URL` value in `.env.chainlink` and the `CELO_RPC` configured for the adapter are *the same*, since any difference between these two might lead to a situation where the Chainlink Node is listening on one chain and the Celo Adapter is posting transactions to a different one.

## Celo External Adapter
For Celo compatibility, we have produced a Celo-compatible External Adapter that will sign transactions in lieu of the Chainlink node doing so. For this purpose, it has to be configured with a private key, which *can be different* from the one that the node uses. See [the external adapter's README](celo-adapter/README.md) for more information on it.

In this case, at least the `celo-adapter` *bridge* should be configured, since it is essential for the node's ability to post transactions. Any job spec should make use of the following task specification instead of using the `EthTx` task.
```json
{
  "type": "celo-adapter",
  "params": {
    "address": <ADDRESS_TO_CALL>,
    "functionSelector": <FUNCTION_SELECTOR>
  }
}
```

Our testing setup for this bridge on the node interface was
```
name: celo-adapter
url: http://celo-adapter:8080
kept the default for other config parameters
```

## Data-Source External Adapters

For price aggregation, a script is included to automatically clone the [External Adapters JS Repo](https://github.com/smartcontractkit/external-adapters-js.git) and build the following external adapters

* Cryptocompare
* metalsapi
* alphavantage

You may use the script `build_adapters.sh` inside this folder to clone and build these, or you may choose to build external adapters yourself. Be sure to include the External Adapter container inside the `docker-compose.yml` file. It should look something like this

This script will also build the `celo-adapter` docker image to be used in the docker-compose setup.

### Adding External Adapters

To add an external adapter to the `docker-compose.yml` file, add a section for your external adapter at the bottom, like so

```
  chainlink-external-cryptocompare:
    image: cryptocompare-adapter:latest
    ports:
      - "8080:8080"
    environment:
      API_KEY: <API_KEY_HERE>
```

then, add the container as a requirement to the `chainlink` container, like so

```
services:
  chainlink:
    image: smartcontract/chainlink:latest
    depends_on:
      - chainlink-db
      - chainlink-external-cryptocompare
      - celo-adapter
      ...more external adapters containers here...
```

### Configuring External Adapters in the Node

To configure any external adapter in the chainlink node, simply point to the name of the container and the port it's exposing, like so
![example bridge](https://i.ibb.co/0Mj82pZ/msedge-LHpxwubo72.png) 

## Configuring the Celo Adapter

The `celo-adapter` section of the included docker-compose file should be changed to give the Celo Adapter a PRIVATE_KEY to use. Change the provided dummy value with the private key for an address you control, and can be set up as the responder for a particular oracle contract, or a FluxAggregator.

```
- celo-adapter
  ...
  environment:
    - PORT: 8080
    - PRIVATE_KEY: <PRIVATE_KEY_HERE>
```

## Running

Before moving forward, run the included `build-adapters.sh` script. This will ensure that all required Docker images are built and ready to be used.

To run, simply run `docker-compose up` inside this folder after configuring. This will launch all required containers

To stop, simply run `docker-compose down` or use `CTRL + C` 