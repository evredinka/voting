const SimpleVoting = artifacts.require("./SimpleVoting.sol");

contract('SimpleVoting', () => {

    contract('startVotingSession normal flow', accounts => {
        it('must start voting phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.startVotingSession({from: admin, gas: 200000});

            let status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 2)
        });
    });

    contract('startVotingSession edge cases', accounts => {
        it('must throw error if NOT invoked from admin', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let fakeAdmin = accounts[1];

            await instance.startProposalRegistration({from: admin, gas: 200000});

            try {
                await instance.startVotingSession({from: fakeAdmin, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be the administrator');
            }
        });
    });

    contract('startVotingSession edge cases', accounts => {
        it('must throw error if NOT registering proposals phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];

            try {
                await instance.startVotingSession({from: admin, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only after proposals registration has ended');
            }
        });
    });

    contract('vote normal flow', accounts => {
        it('should assign one vote for proposal', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let voterAddress = accounts[1];

            await instance.registerVoter(voterAddress, {from: admin, gas: 200000});
            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.registerProposal('Bananas', {from: voterAddress, gas: 200000});
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

    contract('vote edge cases', accounts => {
        it('must throw error if vote NOT from registered voter', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let voter = accounts[1];
            let notAVoter = accounts[2];

            await instance.registerVoter(voter, {from: admin, gas: 200000});
            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.registerProposal('Bananas', {from: voter, gas: 200000});
            await instance.startVotingSession({from: admin, gas: 200000});

            try {
                await instance.vote(0, {from: notAVoter, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be a registered voter');
            }
        });
    });

    contract('vote edge cases', accounts => {
        it('must throw error if NOT voting phase', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let voter = accounts[1];

            await instance.registerVoter(voter, {from: admin, gas: 200000});
            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.registerProposal('Bananas', {from: voter, gas: 200000});

            try {
                await instance.vote(0, {from: voter, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert this function can be called only during the voting session');
            }
        });
    });

    contract('vote edge cases', accounts => {
        it('must throw error if voter has already voted', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let voter = accounts[1];

            await instance.registerVoter(voter, {from: admin, gas: 200000});
            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.registerProposal('Bananas', {from: voter, gas: 200000});
            await instance.startVotingSession({from: admin, gas: 200000});
            await instance.vote(0, {from: voter, gas: 200000});

            try {
                await instance.vote(0, {from: voter, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller has already voted');
            }
        });
    });

});
