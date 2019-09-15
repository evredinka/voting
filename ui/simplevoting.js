let SimpleVoting;
let web3;

window.onload = () => {
    $.getJSON("./contracts/SimpleVoting.json", json => {
        SimpleVoting = TruffleContract(json);

        const provider = new Web3.providers.HttpProvider("http://localhost:8545");
        web3 = new Web3(provider);
        SimpleVoting.setProvider(provider);

        SimpleVoting.deployed()
            .then(instance => instance.VoterRegisteredEvent())
            .then(subscription => {
                subscription.watch((error, result) => {
                    if (!error)
                        $("#voterRegistrationMessage").html('Voter successfully registered');
                    else
                        console.log(error);
                });
            });

        SimpleVoting.deployed()
            .then(instance => instance.ProposalsRegistrationStartedEvent())
            .then(subscription => {
                subscription.watch((error, result) => {
                    if (!error)
                        $("#proposalsRegistrationMessage").html('The proposals registration session has started');
                    else
                        console.log(error);
                });
            });

        SimpleVoting.deployed()
            .then(instance => instance.ProposalsRegistrationEndedEvent())
            .then(subscription => {
                subscription.watch((error, result) => {
                    if (!error)
                        $("#proposalsRegistrationMessage").html('The proposals registration session has ended');
                    else
                        console.log(error);
                });
            });

        SimpleVoting.deployed()
            .then(instance => instance.ProposalRegisteredEvent())
            .then(subscription => {
                subscription.watch((error, result) => {
                    if (!error) {
                        $("#proposalRegistrationMessage").html('The proposal has been registered successfully');
                        loadProposalsTable();
                    } else
                        console.log(error);
                });
            });

        SimpleVoting.deployed()
            .then(instance => instance.VotingSessionStartedEvent())
            .then(subscription => {
                subscription.watch((error, result) => {
                    if (!error)
                        $("#votingSessionMessage").html('The voting session session has started');
                    else
                        console.log(error);
                });
            });

        SimpleVoting.deployed()
            .then(instance => instance.VotingSessionEndedEvent())
            .then(subscription => {
                subscription.watch((error, result) => {
                    if (!error)
                        $("#votingSessionMessage").html('The voting session session has ended');
                    else
                        console.log(error);
                });
            });

        SimpleVoting.deployed()
            .then(instance => instance.VotedEvent())
            .then(subscription => {
                subscription.watch((error, result) => {
                    if (!error)
                        $("#voteConfirmationMessage").html('You have voted successfully');
                    else
                        console.log(error);
                });
            });

        SimpleVoting.deployed()
            .then(instance => instance.VotesTalliedEvent())
            .then(subscription => {
                subscription.watch((error, result) => {
                    if (!error) {
                        $("#votingTallyingMessage").html('Votes have been tallied');
                        console.log("Loading results table");
                        loadResultsTable();
                    } else
                        console.log(error);
                });
            });

        SimpleVoting.deployed()
            .then(instance => instance.WorkflowStatusChangeEvent())
            .then(subscription => {
                subscription.watch((error, result) => {
                    if (!error)
                        refreshWorkflowStatus();
                    else
                        console.log(error);
                });
            });

        refreshWorkflowStatus();
    });
};

function refreshWorkflowStatus() {
    SimpleVoting.deployed()
        .then(instance => instance.getWorkflowStatus())
        .then(workflowStatus => {
            let workflowStatusDescription;

            switch (workflowStatus.toString()) {
                case '0':
                    workflowStatusDescription = "Registering Voters";
                    break;
                case '1':
                    workflowStatusDescription = "Proposals registration Started";
                    break;
                case '2':
                    workflowStatusDescription = "Proposals registration Ended";
                    break;
                case '3':
                    workflowStatusDescription = "Voting session Started";
                    break;
                case '4':
                    workflowStatusDescription = "Voting session Ended";
                    break;
                case '5':
                    workflowStatusDescription = "Votes have been tallied";
                    break;
                default:
                    workflowStatusDescription = "Unknown status";
            }

            $("#currentWorkflowStatusMessage").html(workflowStatusDescription);
        });
}

function unlockAdmin() {
    $("#adminMessage").html('');

    const adminAddress = $("#adminAddress").val();
    const adminPassword = $("#adminPassword").val();

    const result = web3.personal.unlockAccount(adminAddress, adminPassword, 180); //unlock for 3 minutes
    if (result)
        $("#adminMessage").html('The account has been unlocked');
    else
        $("#adminMessage").html('The account has NOT been unlocked');
}

function unlockVoter() {
    $("#voterMessage").html('');

    const voterAddress = $("#voterAddress").val();
    const voterPassword = $("#voterPassword").val();

    const result = web3.personal.unlockAccount(voterAddress, voterPassword, 180); //unlock for 3 minutes
    if (result)
        $("#voterMessage").html('The account has been unlocked');
    else
        $("#voterMessage").html('The account has NOT been unlocked');
}

function registerVoter() {

    $("#voterRegistrationMessage").html('');

    const adminAddress = $("#adminAddress").val();
    const voterToRegister = $("#registerVoterAddress").val();

    SimpleVoting.deployed()
        .then(instance => instance.isAdministrator(adminAddress))
        .then(isAdministrator => {
            if (isAdministrator) {
                return SimpleVoting.deployed()
                    .then(instance => instance.isRegisteredVoter(voterToRegister))
                    .then(isRegisteredVoter => {
                        if (isRegisteredVoter)
                            $("#voterRegistrationMessage").html('The voter is already registered');
                        else {
                            return SimpleVoting.deployed()
                                .then(instance => instance.getWorkflowStatus())
                                .then(workflowStatus => {
                                    if (workflowStatus > 0)
                                        $("#voterRegistrationMessage").html('Voters registration has already ended');
                                    else {
                                        SimpleVoting.deployed()
                                            .then(instance => instance.registerVoter(voterToRegister, {
                                                from: adminAddress,
                                                gas: 200000
                                            }))
                                            .catch(e => $("#voterRegistrationMessage").html(e));
                                    }
                                });
                        }
                    });
            } else {
                $("#voterRegistrationMessage").html('The given address does not correspond to the administrator');
            }
        });
}

function checkVoterRegistration() {

    $("#registrationVerificationMessage").html('');

    const address = $("#address").val();

    SimpleVoting.deployed()
        .then(instance => instance.isRegisteredVoter(address))
        .then(isRegisteredVoter => {
            if (isRegisteredVoter)
                $("#registrationVerificationMessage").html('This is a registered voter');
            else
                $("#registrationVerificationMessage").html('This is NOT a registered voter');
        });
}

function startProposalsRegistration() {

    $("#proposalsRegistrationMessage").html('');

    const adminAddress = $("#adminAddress").val();

    SimpleVoting.deployed()
        .then(instance => instance.isAdministrator(adminAddress))
        .then(isAdministrator => {
            if (isAdministrator) {
                return SimpleVoting.deployed()
                    .then(instance => instance.getWorkflowStatus())
                    .then(workflowStatus => {
                        if (workflowStatus > 0)
                            $("#proposalsRegistrationMessage").html('The proposals registration session has already been started');
                        else {
                            SimpleVoting.deployed()
                                .then(instance => instance.startProposalRegistration({from: adminAddress, gas: 200000}))
                                .catch(e => $("#proposalsRegistrationMessage").html(e));
                        }
                    });
            } else {
                $("#proposalsRegistrationMessage").html('The given address does not correspond to the administrator');
            }
        });
}

function endProposalsRegistration() {

    $("#proposalsRegistrationMessage").html('');

    const adminAddress = $("#adminAddress").val();

    SimpleVoting.deployed()
        .then(instance => instance.isAdministrator(adminAddress))
        .then(isAdministrator => {
            if (isAdministrator) {
                return SimpleVoting.deployed()
                    .then(instance => instance.getWorkflowStatus())
                    .then(workflowStatus => {
                        if (workflowStatus < 1)
                            $("#proposalsRegistrationMessage").html('The proposals registration session has not started yet');
                        else if (workflowStatus > 1)
                            $("#proposalsRegistrationMessage").html('The proposals registration session has already been ended');
                        else {
                            SimpleVoting.deployed()
                                .then(instance => instance.endProposalRegistration({from: adminAddress, gas: 200000}))
                                .catch(e => $("#proposalsRegistrationMessage").html(e));
                        }
                    });
            } else {
                $("#proposalsRegistrationMessage").html('The given address does not correspond to the administrator');
            }
        });
}

function startVotingSession() {

    $("#votingSessionMessage").html('');

    const adminAddress = $("#adminAddress").val();

    SimpleVoting.deployed()
        .then(instance => instance.isAdministrator(adminAddress))
        .then(isAdministrator => {
            if (isAdministrator) {
                return SimpleVoting.deployed()
                    .then(instance => instance.getWorkflowStatus())
                    .then(workflowStatus => {
                        if (workflowStatus < 2)
                            $("#votingSessionMessage").html('The proposals registration session has not ended yet');
                        else if (workflowStatus > 2)
                            $("#votingSessionMessage").html('The voting session has already been started');
                        else {
                            SimpleVoting.deployed()
                                .then(instance => instance.startVotingSession({from: adminAddress, gas: 200000}))
                                .catch(e => $("#votingSessionMessage").html(e));
                        }
                    });
            } else {
                $("#votingSessionMessage").html('The given address does not correspond to the administrator');
            }
        });
}

function endVotingSession() {

    $("#votingSessionMessage").html('');

    const adminAddress = $("#adminAddress").val();

    SimpleVoting.deployed()
        .then(instance => instance.isAdministrator(adminAddress))
        .then(isAdministrator => {
            if (isAdministrator) {
                return SimpleVoting.deployed()
                    .then(instance => instance.getWorkflowStatus())
                    .then(workflowStatus => {
                        if (workflowStatus < 3)
                            $("#votingSessionMessage").html('The voting session has not started yet');
                        else if (workflowStatus > 3)
                            $("#votingSessionMessage").html('The voting session has already ended');
                        else {
                            SimpleVoting.deployed()
                                .then(instance => instance.endVotingSession({from: adminAddress, gas: 200000}))
                                .catch(e => $("#votingSessionMessage").html(e));
                        }
                    });
            } else {
                $("#votingSessionMessage").html('The given address does not correspond to the administrator');
            }
        });
}

function tallyVotes() {

    $("#votingTallyingMessage").html('');

    const adminAddress = $("#adminAddress").val();

    SimpleVoting.deployed()
        .then(instance => instance.isAdministrator(adminAddress))
        .then(isAdministrator => {
            if (isAdministrator) {
                return SimpleVoting.deployed()
                    .then(instance => instance.getWorkflowStatus())
                    .then(workflowStatus => {
                        if (workflowStatus < 4)
                            $("#votingTallyingMessage").html('The voting session has not ended yet');
                        else if (workflowStatus > 4)
                            $("#votingTallyingMessage").html('Votes have already been tallied');
                        else {
                            SimpleVoting.deployed()
                                .then(instance => instance.tallyVotes({from: adminAddress, gas: 200000}))
                                .catch(e => $("#votingTallyingMessage").html(e));
                        }
                    });
            } else {
                $("#votingTallyingMessage").html('The given address does not correspond to the administrator');
            }
        });
}

function registerProposal() {

    $("#proposalRegistrationMessage").html('');

    const voterAddress = $("#proposalVoterAddress").val();
    const proposalDescription = $("#proposalDescription").val();

    SimpleVoting.deployed()
        .then(instance => instance.isRegisteredVoter(voterAddress))
        .then(isRegisteredVoter => {
            if (isRegisteredVoter) {
                return SimpleVoting.deployed()
                    .then(instance => instance.getWorkflowStatus())
                    .then(workflowStatus => {
                        if (workflowStatus < 1)
                            $("#proposalRegistrationMessage").html('The proposal registration session has not started yet');
                        else if (workflowStatus > 1)
                            $("#proposalRegistrationMessage").html('The proposal registration session has already ended');
                        else {
                            SimpleVoting.deployed()
                                .then(instance => instance.registerProposal(proposalDescription, {
                                    from: voterAddress,
                                    gas: 200000
                                }))
                                .catch(e => $("#proposalRegistrationMessage").html(e));
                        }
                    });
            } else {
                $("#proposalRegistrationMessage").html('You are not a registered voter. You cannot register a proposal.');
            }
        });
}


function loadProposalsTable() {

    SimpleVoting.deployed()
        .then(instance => instance.getProposalsNumber())
        .then(proposalsNumber => {

            let innerHtml = "<tr><td><b>Proposal Id</b></td><td><b>Description</b></td>";

            j = 0;
            for (let i = 0; i < proposalsNumber; i++) {
                getProposalDescription(i)
                    .then(description => {
                        innerHtml = innerHtml + "<tr><td>" + (j++) + "</td><td>" + description + "</td></tr>";
                        $("#proposalsTable").html(innerHtml);
                    });
            }
        });
}

function getProposalDescription(proposalId) {
    return SimpleVoting.deployed()
        .then(instance => instance.getProposalDescription(proposalId));
}

function vote() {
    $("#voteConfirmationMessage").html('');

    const voterAddress = $("#voterAddress").val();
    const proposalId = $("#proposalId").val();

    SimpleVoting.deployed()
        .then(instance => instance.isRegisteredVoter(voterAddress))
        .then(isRegisteredVoter => {
            if (isRegisteredVoter) {
                return SimpleVoting.deployed()
                    .then(instance => instance.getWorkflowStatus())
                    .then(workflowStatus => {
                        if (workflowStatus < 3)
                            $("#voteConfirmationMessage").html('The voting session has not started yet');
                        else if (workflowStatus > 3)
                            $("#voteConfirmationMessage").html('The voting session has already ended');
                        else {
                            SimpleVoting.deployed()
                                .then(instance => instance.getProposalsNumber())
                                .then(proposalsNumber => {
                                    if (proposalsNumber == 0) {
                                        $("#voteConfirmationMessage").html('The are no registered proposals. You cannot vote.');
                                    } else if (parseInt(proposalId) >= proposalsNumber) {
                                        $("#voteConfirmationMessage").html('The specified proposalId does not exist.');
                                    } else {
                                        SimpleVoting.deployed()
                                            .then(instance => instance.vote(proposalId, {
                                                from: voterAddress,
                                                gas: 200000
                                            }))
                                            .catch(e => $("#voteConfirmationMessage").html(e));
                                    }
                                });
                        }
                    });
            } else {
                $("#proposalRegistrationMessage").html('You are not a registered voter. You cannot register a proposal.');
            }
        });
}

function loadResultsTable() {

    SimpleVoting.deployed()
        .then(instance => instance.getWorkflowStatus())
        .then(workflowStatus => {
            console.log(`workflowStatus is ${workflowStatus}`);
            if (workflowStatus == 5) {
                let innerHtml = "<tr><td><b>Winning Proposal</b></td><td></td></tr>";

                SimpleVoting.deployed()
                    .then(instance => instance.getWinningProposalId())
                    .then(winningProposalId => {
                        innerHtml = innerHtml + "<tr><td><b>Id:</b></td><td>" + winningProposalId + "</td></tr>";

                        SimpleVoting.deployed()
                            .then(instance => instance.getWinningProposalDescription())
                            .then(winningProposalDescription => {
                                innerHtml = innerHtml + "<tr><td><b>Description:</b></td><td>" + winningProposalDescription + "</td></tr>";

                                SimpleVoting.deployed()
                                    .then(instance => instance.getWinningProposalVoteCounts())
                                    .then(winningProposalVoteCounts => {
                                        innerHtml = innerHtml + "<tr><td><b>Votes count:</b></td><td>" + winningProposalVoteCounts + "</td></tr>";

                                        $("#resultsTable").html(innerHtml);
                                    });
                            });
                    });
            }
        });
}
