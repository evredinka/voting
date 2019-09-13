const SimpleVoting = artifacts.require("./SimpleVoting.sol");

contract('SimpleVoting', () => {

    contract('startProposalRegistration', accounts => {
        it('must start proposal registration phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 0);

            await instance.startProposalRegistration({from: admin, gas: 200000});

            status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 1)
        });
    });

    contract('startProposalRegistration must throw error', accounts => {
        it('if NOT invoked from admin', async () => {
            let instance = await SimpleVoting.deployed();
            let notAdmin = accounts[1];

            try {
                await instance.startProposalRegistration({from: notAdmin, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be the administrator');
            }
        });

        it('if NOT voters registration phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            await instance.startProposalRegistration({from: admin, gas: 200000});

            try {
                await instance.startProposalRegistration({from: admin, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only during voters registration');
            }
        })
    });

    contract('registerProposal', accounts => {
        it('must register proposal', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let accountToRegister = accounts[1];

            await instance.registerVoter(accountToRegister, {from: admin, gas: 200000});
            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.registerProposal('Bananas', {from: accountToRegister, gas: 200000});

            let description = await instance.getProposalDescription(0);

            assert.strictEqual(description, 'Bananas');
        });
    });

    contract('registerProposal must throw error', accounts => {
        it('if NOT proposal registration phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let accountToRegister = accounts[1];

            await instance.registerVoter(accountToRegister, {from: admin, gas: 200000});

            try {
                await instance.registerProposal('Bananas', {from: accountToRegister, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only during proposals registration');
            }
        })
    });

    contract('registerProposal must throw error', accounts => {
        it('if NOT proposal from registered voter', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            await instance.startProposalRegistration({from: admin, gas: 200000});

            try {
                await instance.registerProposal('Bananas', {from: admin, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be a registered voter');
            }
        });
    });

    contract('endProposalRegistration', accounts => {
        it('must end proposal registration phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.endProposalRegistration({from: admin, gas: 200000});

            let status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 2);
        });
    });

    contract('endProposalRegistration must throw error', accounts => {
        it('if NOT invoked from admin', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let notAdmin = accounts[1];

            await instance.startProposalRegistration({from: admin, gas: 200000});

            try {
                await instance.endProposalRegistration({from: notAdmin, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be the administrator');
            }
        });
    });

    contract('endProposalRegistration must throw error', accounts => {
        it('if NOT proposal registration phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            try {
                await instance.endProposalRegistration({from: admin, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only during proposals registration');
            }
        });
    });

});
