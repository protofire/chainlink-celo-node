PWD=$(pwd)
git clone https://github.com/smartcontractkit/external-adapters-js.git
cd $PWD/external-adapters-js
make docker adapter=cryptocompare
make docker apdater=metalsapi
make docker adapter=alphavantage
cd $PWD/celo-adapter
make build