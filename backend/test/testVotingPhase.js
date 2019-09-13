const SimpleVoting = artifacts.require("./SimpleVoting.sol");

contract('SimpleVoting', () => {

    contract('startVotingSession', accounts => {
        it('must start voting phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.endProposalRegistration({from: admin, gas: 200000});
            await instance.startVotingSession({from: admin, gas: 200000});

            let status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 3)
        });
    });

    contract('startVotingSession must throw error', accounts => {
        it('if NOT invoked from admin', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let notAdmin = accounts[1];

            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.endProposalRegistration({from: admin, gas: 200000});

            try {
                await instance.startVotingSession({from: notAdmin, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be the administrator');
            }
        });
    });

    contract('startVotingSession must throw error', accounts => {
        it('if NOT registering proposals phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            try {
                await instance.startVotingSession({from: admin, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only after proposals registration has ended');
            }
        });
    });

    contract('vote', accounts => {
        it('should assign one vote to proposal', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let voterAddress = accounts[1];

            await instance.registerVoter(voterAddress, {from: admin, gas: 200000});
            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.registerProposal('Bananas', {from: voterAddress, gas: 200000});
            await instance.endProposalRegistration({from: admin, gas: 200000});
            await instance.startVotingSession({from: admin, gas: 200000});
            await instance.vote(0, {from: voterAddress, gas: 200000});

            let proposal = await instance.proposals(0);
            let [description, votes] = proposal;

            assert.strictEqual(description, 'Bananas');
            assert.strictEqual(votes.toNumber(), 1);
            let voter = await instance.voters(voterAddress);
            let [isRegistered, hasVoted, votedProposalId] = voter;
            assert.isTrue(isRegistered);
            assert.isTrue(hasVoted);
            assert.strictEqual(votedProposalId.toNumber(), 0);
        });
    });

    contract('vote must throw error', accounts => {
        it('if vote NOT from registered voter', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let voter = accounts[1];
            let notAVoter = accounts[2];

            await instance.registerVoter(voter, {from: admin, gas: 200000});
            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.registerProposal('Bananas', {from: voter, gas: 200000});
            await instance.endProposalRegistration({from: admin, gas: 200000});
            await instance.startVotingSession({from: admin, gas: 200000});

            try {
                await instance.vote(0, {from: notAVoter, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be a registered voter');
            }
        });
    });

    contract('vote must throw error', accounts => {
        it('if NOT voting phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let voter = accounts[1];

            await instance.registerVoter(voter, {from: admin, gas: 200000});
            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.registerProposal('Bananas', {from: voter, gas: 200000});

            try {
                await instance.vote(0, {from: voter, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only during the voting session');
            }
        });
    });

    contract('vote must throw error', accounts => {
        it('if voter has already voted', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let voter = accounts[1];

            await instance.registerVoter(voter, {from: admin, gas: 200000});
            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.registerProposal('Bananas', {from: voter, gas: 200000});
            await instance.endProposalRegistration({from: admin, gas: 200000});
            await instance.startVotingSession({from: admin, gas: 200000});
            await instance.vote(0, {from: voter, gas: 200000});

            try {
                await instance.vote(0, {from: voter, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller has already voted');
            }
        });
    });

    contract('endVotingSession', accounts => {
        it('must end voting phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.endProposalRegistration({from: admin, gas: 200000});
            await instance.startVotingSession({from: admin, gas: 200000});
            await instance.endVotingSession({from: admin, gas: 200000});

            let status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 4)
        });
    });

    contract('endVotingSession must throw error', accounts => {
        it('if NOT invoked from admin', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let notAdmin = accounts[1];

            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.endProposalRegistration({from: admin, gas: 200000});
            await instance.startVotingSession({from: admin, gas: 200000});

            try {
                await instance.endVotingSession({from: notAdmin, gas: 200000});
                assert.fail();
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be the administrator');
            }
        });
    });

});
