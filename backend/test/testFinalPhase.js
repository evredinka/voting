const SimpleVoting = artifacts.require("./SimpleVoting.sol");

contract('SimpleVoting', () => {

    contract('tallyVotes', accounts => {
        it('must define a winner', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let voterAddress1 = accounts[1];
            let voterAddress2 = accounts[2];
            let voterAddress3 = accounts[3];

            await instance.registerVoter(voterAddress1, {from: admin, gas: 200000});
            await instance.registerVoter(voterAddress2, {from: admin, gas: 200000});
            await instance.registerVoter(voterAddress3, {from: admin, gas: 200000});

            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.registerProposal('Bananas', {from: voterAddress1, gas: 200000});
            await instance.registerProposal('Tomatoes', {from: voterAddress2, gas: 200000});
            await instance.endProposalRegistration({from: admin, gas: 200000});

            await instance.startVotingSession({from: admin, gas: 200000});
            await instance.vote(0, {from: voterAddress1, gas: 200000});
            await instance.vote(1, {from: voterAddress2, gas: 200000});
            await instance.vote(1, {from: voterAddress3, gas: 200000});
            await instance.endVotingSession({from: admin, gas: 200000});

            await instance.tallyVotes({from: admin, gas: 200000});

            let winner = await instance.getWinningProposalId();
            assert.strictEqual(winner.toNumber(), 1);

            let winnerDesc = await instance.getWinningProposalDescription();
            assert.strictEqual(winnerDesc, 'Tomatoes');

            let status = await instance.currentStatus();
            assert.strictEqual(status.toNumber(), 5)
        });
    });

    contract('tallyVotes must throw error', accounts => {
        it('if invoked NOT from admin', async () => {
            let instance = await SimpleVoting.deployed();
            let admin = accounts[0];
            let voterAddress = accounts[1];

            await instance.startProposalRegistration({from: admin, gas: 200000});
            await instance.endProposalRegistration({from: admin, gas: 200000});
            await instance.startVotingSession({from: admin, gas: 200000});

            try {
                await instance.tallyVotes({from: voterAddress, gas: 200000});
            } catch (error) {
                assert.strictEqual(error.message, 'VM Exception while processing transaction: revert the caller of this function must be the administrator');
            }
        })
    });

});
