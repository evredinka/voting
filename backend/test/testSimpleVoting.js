const SimpleVoting = artifacts.require("./SimpleVoting.sol");

contract('SimpleVoting', accounts => {

    contract('SimpleVoting.admin', () => {
        it('must be the user who deployed the contract', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = await instance.admin();

            let votingAdmin = web3.eth.accounts[0];

            assert.strictEqual(admin, votingAdmin);
        })
    });

    contract('SimpleVoting.isAdministrator', () => {
        it('must be the user who deployed the contract', async () => {
            let instance = await SimpleVoting.deployed();

            let isAdmin = await instance.isAdministrator(web3.eth.accounts[0]);

            assert.isTrue(isAdmin);
        });

        it("must NOT be the user who didn't deploy the contract", async () => {
            let instance = await SimpleVoting.deployed();

            let isAdmin = await instance.isAdministrator(web3.eth.accounts[1]);

            assert.isFalse(isAdmin);
        })
    });

    contract('SimpleVoting.registerVoter', accounts => {
        it('must register voter from admin account', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = web3.eth.accounts[0];
            let accountToRegister = web3.eth.accounts[1];

            await instance.registerVoter(accountToRegister, {from: admin, gas: 200000});

            let voter = await instance.voters(accountToRegister);
            let [isRegistered, hasVoted, votedProposalId] = voter;
            assert.isTrue(isRegistered);
            assert.isFalse(hasVoted);
            assert.strictEqual(votedProposalId.toNumber(), 0);
        });

        it('must throw exception if register voter NOT from admin account', async () => {
            let instance = await SimpleVoting.deployed();
            let fakeAdmin = web3.eth.accounts[1];
            let accountToRegister = web3.eth.accounts[2];

            try {
                await instance.registerVoter(accountToRegister, {from: fakeAdmin, gas: 200000})
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be the administrator');
            }
        });

        it('must throw error if voter is already registered', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = web3.eth.accounts[0];
            let accountToRegister = web3.eth.accounts[4];

            await instance.registerVoter(accountToRegister, {from: admin, gas: 200000});

            try {
                await instance.registerVoter(accountToRegister, {from: admin, gas: 200000})
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the voter is already registered');
            }
        });

        it('must throw if NOT voter registration phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = web3.eth.accounts[0];
            let accountToRegister = web3.eth.accounts[1];

            let status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 0);

            await instance.startProposalRegistration({from: admin, gas: 200000});
            status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 1);

            try {
                await instance.registerVoter(accountToRegister, {from: admin, gas: 200000})
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only before proposals registration has started');
            }
        })
    });

    contract('SimpleVoting.startProposalRegistration', accounts => {
        it('must start proposal registration', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = web3.eth.accounts[0];

            await instance.startProposalRegistration({from: admin, gas: 200000});

            let status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 1);
        })
    })

});
