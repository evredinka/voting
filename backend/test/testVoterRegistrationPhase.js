const SimpleVoting = artifacts.require("./SimpleVoting.sol");

contract('SimpleVoting', () => {

    contract('SimpleVoting.admin', accounts => {
        it('must be the user who deployed the contract', async () => {
            let instance = await SimpleVoting.deployed();
            let actualAdmin = await instance.admin();

            let expectedAdmin = accounts[0];

            assert.strictEqual(actualAdmin, expectedAdmin);
        })
    });

    contract('SimpleVoting.isAdministrator', accounts => {
        it('must be the user who deployed the contract', async () => {
            let instance = await SimpleVoting.deployed();
            let expectedAdmin = accounts[0];

            let isAdmin = await instance.isAdministrator(expectedAdmin);

            assert.isTrue(isAdmin);
        });

        it("must NOT be the user who didn't deploy the contract", async () => {
            let instance = await SimpleVoting.deployed();
            let notAdmin = accounts[1];

            let isAdmin = await instance.isAdministrator(notAdmin);

            assert.isFalse(isAdmin);
        })
    });

    contract('SimpleVoting.registerVoter', accounts => {
        it('must register voter from admin account', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let accountToRegister = accounts[1];

            await instance.registerVoter(accountToRegister, {from: admin, gas: 200000});

            let voter = await instance.voters(accountToRegister);
            let [isRegistered, hasVoted, votedProposalId] = voter;
            assert.isTrue(isRegistered);
            assert.isFalse(hasVoted);
            assert.strictEqual(votedProposalId.toNumber(), 0);
        });

        it('must throw exception if register voter NOT from admin account', async () => {
            let instance = await SimpleVoting.deployed();
            let notAdmin = accounts[1];
            let accountToRegister = accounts[2];

            try {
                await instance.registerVoter(accountToRegister, {from: notAdmin, gas: 200000})
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be the administrator');
            }
        });

        it('must throw error if voter is already registered', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let accountToRegister = accounts[4];

            await instance.registerVoter(accountToRegister, {from: admin, gas: 200000});

            try {
                await instance.registerVoter(accountToRegister, {from: admin, gas: 200000})
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the voter is already registered');
            }
        });

        it('must throw if NOT voter registration phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let accountToRegister = accounts[1];

            let status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 0);

            await instance.startProposalRegistration({from: admin, gas: 200000});
            status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 1);

            try {
                await instance.registerVoter(accountToRegister, {from: admin, gas: 200000})
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only during voters registration');
            }
        })
    });

});
