To compile the contract:
> truffle compile

To run the tests:
Tests requires ganache blockchain, to install it run:
> npm install -g ganache-cli@6.1.8

To run ganache, use:
> ganache-cli
> truffle test



To run web-app

Start ganache blockchain:
> ganache-cli > ./log/ganache.log

Redeploy the contract:
> truffle migrate --reset

Copy build/contracts/SimpleVoting.json to ui/contracts/SimpleVoting.json 

Run web server:
> node ui/webserver.js


The project requires node version 8
The project requires truffle:
> npm install -g truffle@4.1.15
