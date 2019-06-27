const SimpleVoting = artifacts.require("./SimpleVoting.sol");

contract('SimpleVoting', accounts => {
    contract('SimpleVoting.admin', accounts => {
        it('must be the user who deployed the contract', async function() {
            let instance = await SimpleVoting.deployed();
            let admin = await instance.admin();

            let votingAdmin = web3.eth.accounts[0];

            assert.isTrue(admin == votingAdmin);
        })
    })
})
