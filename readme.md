# Backend

Backend is implemented with Smart Contracts running on [Ganache](https://github.com/trufflesuite/ganache) blockchain.
Smart Contract is written in [Solidity](https://solidity.readthedocs.io) language.
[Truffle](https://github.com/trufflesuite/truffle) development environment is used.
```bash
npm install -g ganache-cli@6.1.8
npm install -g truffle@4.1.15
```

### Deployment
To deploy the contract on the blockchain
```bash
truffle compile
ganache-cli
truffle migrate --reset
```

### Test
To run the tests
```bash
truffle compile
ganache-cli
truffle test
```

# Frontend
Frontend is implemented as a web-server serving static content.
```bash
cp backend/build/contracts/SimpleVoting.json ./ui/contracts/SimpleVoting.json
node ui/webserver.js
Navigate to http://localhost:8080/admin.html 
```

The project requires node js:
```bash
node -v
v8.16.0
```
