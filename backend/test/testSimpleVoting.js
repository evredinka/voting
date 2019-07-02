const SimpleVoting = artifacts.require("./SimpleVoting.sol");

contract('SimpleVoting', accounts => {
    contract('SimpleVoting.admin', accounts => {
        it('must be the user (via variable) who deployed the contract', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = await instance.admin();

            let votingAdmin = web3.eth.accounts[0];

            assert.isTrue(admin == votingAdmin);
        })

        it('must be the user (via getter) who deployed the contract', async () => {
            let instance = await SimpleVoting.deployed();

            let isAdmin = await instance.isAdministrator(web3.eth.accounts[0])

            assert.isTrue(isAdmin);
        })

        it("must NOT be the user (via getter) who didn't deploy the contract", async () => {
            let instance = await SimpleVoting.deployed();

            let isAdmin = await instance.isAdministrator(web3.eth.accounts[1])

            assert.isFalse(isAdmin);
        })
    })

})
