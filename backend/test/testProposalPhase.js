const SimpleVoting = artifacts.require("./SimpleVoting.sol");

contract('SimpleVoting', () => {

    contract('SimpleVoting.startProposalRegistration normal flow', accounts => {
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

    contract('SimpleVoting.startProposalRegistration edge cases', accounts => {
        it('must throw error if NOT invoked from admin', async () => {
            let instance = await SimpleVoting.deployed();
            let fakeAdmin = accounts[1];

            try {
                await instance.startProposalRegistration({from: fakeAdmin, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be the administrator');
            }
        });

        it('must throw error if NOT voters registration phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            await instance.startProposalRegistration({from: admin, gas: 200000});

            try {
                await instance.startProposalRegistration({from: admin, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only before proposals registration has started');
            }
        })
    });

    contract('SimpleVoting.registerProposal normal flow', accounts => {
        it('must register proposal', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let accountToRegister = accounts[1];

            await instance.registerVoter(accountToRegister, {from: admin, gas: 200000});
            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.registerProposal('Bananas', {from: accountToRegister, gas: 200000});

            let description = await instance.getProposalDescription(0, {from: admin, gas: 200000});

            assert.strictEqual(description, 'Bananas');
        });
    });

    contract('SimpleVoting.registerProposal edge cases', accounts => {
        it('must throw error if NOT proposal registration phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let accountToRegister = accounts[1];

            await instance.registerVoter(accountToRegister, {from: admin, gas: 200000});

            try {
                await instance.registerProposal('Bananas', {from: accountToRegister, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only during proposals registration');
            }
        })
    });

    contract('SimpleVoting.registerProposal edge cases', accounts => {
        it('must throw error if NOT proposal from registered voter', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            await instance.startProposalRegistration({from: admin, gas: 200000});

            try {
                await instance.registerProposal('Bananas', {from: admin, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be a registered voter');
            }
        });
    });

    contract('SimpleVoting.endProposalRegistration normal flow', accounts => {
        it('must end proposal registration', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.endProposalRegistration({from: admin, gas: 200000});

            let status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 2);
        });
    });

    contract('SimpleVoting.endProposalRegistration edge cases', accounts => {
        it('must throw error if NOT invoked from admin', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let fakeAdmin = accounts[1];

            await instance.startProposalRegistration({from: admin, gas: 200000});

            try {
                await instance.endProposalRegistration({from: fakeAdmin, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be the administrator');
            }
        });
    });

    contract('SimpleVoting.endProposalRegistration edge cases', accounts => {
        it('must throw error if NOT proposal registration started phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            try {
                await instance.endProposalRegistration({from: admin, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only during proposals registration');
            }
        });
    });

});
