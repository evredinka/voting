pragma solidity >=0.4.21 <0.6.0;

contract SimpleVoting {

    address public admin;
    mapping(address => Voter) public voters;
    WorkflowStatus public currentStatus;
    Proposal[] public proposals;
    uint private winningProposalId;

    event VoterRegisteredEvent (address voterAddress);
    event ProposalsRegistrationStartedEvent ();
    event ProposalsRegistrationEndedEvent ();
    event ProposalRegisteredEvent(uint proposalId);
    event VotingSessionStartedEvent ();
    event VotingSessionEndedEvent ();
    event VotedEvent (address voter, uint proposalId);
    event VotesTalliedEvent ();

    event WorkflowStatusChangeEvent (
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );

    constructor() public {
        admin = msg.sender;
        currentStatus = WorkflowStatus.RegisteringVoters;
    }

    function registerVoter(address _voter) onlyAdmin onlyDuringVotersRegistration public {
        require(!voters[_voter].isRegistered, "the voter is already registered");
        voters[_voter].isRegistered = true;
        voters[_voter].hasVoted = false;
        voters[_voter].votedProposalId = 0;

        emit VoterRegisteredEvent(_voter);
    }

    //--- Proposals phase ---//
    function startProposalRegistration() onlyAdmin onlyDuringVotersRegistration public {
        currentStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit ProposalsRegistrationStartedEvent();
        emit WorkflowStatusChangeEvent(WorkflowStatus.RegisteringVoters, currentStatus);
    }

    function registerProposal(string proposal) onlyRegisteredVoter onlyDuringProposalsRegistration public {
        proposals.push(Proposal({description : proposal, voteCount : 0}));
        emit ProposalRegisteredEvent(proposals.length - 1);
    }

    function endProposalRegistration() onlyAdmin onlyDuringProposalsRegistration public {
        currentStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit ProposalsRegistrationEndedEvent();
        emit WorkflowStatusChangeEvent(WorkflowStatus.ProposalsRegistrationStarted, currentStatus);
    }

    //--- Voting phase ---//
    function startVotingSession() onlyAdmin onlyAfterProposalsRegistration public {
        currentStatus = WorkflowStatus.VotingSessionStarted;
        emit VotingSessionStartedEvent();
        emit WorkflowStatusChangeEvent(WorkflowStatus.ProposalsRegistrationEnded, currentStatus);
    }

    function vote(uint proposalId) onlyRegisteredVoter onlyDuringVotingSession public {
        require(!voters[msg.sender].hasVoted, "the caller has already voted");
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = proposalId;
        proposals[proposalId].voteCount += 1;

        emit VotedEvent(msg.sender, proposalId);
    }

    function endVotingSession() onlyAdmin onlyDuringVotingSession public {
        currentStatus = WorkflowStatus.VotingSessionEnded;
        emit VotingSessionEndedEvent();
        emit WorkflowStatusChangeEvent(WorkflowStatus.VotingSessionStarted, currentStatus);
    }

    //--- Final phase ---//
    function tallyVotes()
    onlyAdministrator
    onlyAfterVotingSession
    onlyBeforeVotesTallied public {
        uint winningVoteCount = 0;
        uint winningProposalIndex = 0;

        for (uint i = 0; i < proposals.length; i++) {
            if (proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = proposals[i].voteCount;
                winningProposalIndex = i;
            }
        }

        winningProposalId = winningProposalIndex;
        workflowStatus = WorkflowStatus.VotesTallied;

        emit VotesTalliedEvent();
        emit WorkflowStatusChangeEvent(
            WorkflowStatus.VotingSessionEnded, workflowStatus);
    }

    //--- Utility functions ---//
    function getProposalsNumber() public view returns (uint) {
        return proposals.length;
    }

    function getProposalDescription(uint index) public view returns (string) {
        return proposals[index].description;
    }

    function getWinningProposalId() onlyAfterVotesTallied public view returns (uint) {
        return winningProposalId;
    }

    function getWinningProposalDescription() onlyAfterVotesTallied public view returns (string) {
        return proposals[winningProposalId].description;
    }

    function getWinningProposalVoteCounts() onlyAfterVotesTallied public view returns (uint) {
        return proposals[winningProposalId].voteCount;
    }

    function isRegisteredVoter(address _voterAddress) public view returns (bool) {
        return voters[_voterAddress].isRegistered;
    }

    function isAdministrator(address _address) public view returns (bool) {
        return _address == administrator;
    }

    function getWorkflowStatus() public view returns (WorkflowStatus) {
        return workflowStatus;
    }

    //--- Modifiers ---//
    modifier onlyAdmin() {
        require(msg.sender = admin,
            "the caller of this function must be the administrator");
        _;
    }

    modifier onlyRegisteredVoter() {
        require(voters[msg.sender].isRegistered,
            "the caller of this function must be a registered voter");
        _;
    }

    modifier onlyDuringVotersRegistration() {
        require(workflowStatus == WorkflowStatus.RegisteringVoters,
            "this function can be called only before proposals registration has started");
        _;
    }

    modifier onlyDuringProposalsRegistration() {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted,
            "this function can be called only during proposals registration");
        _;
    }

    modifier onlyAfterProposalsRegistration() {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded,
            "this function can be called only after proposals registration has ended");
        _;
    }

    modifier onlyDuringVotingSession() {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted,
            "this function can be called only during the voting session");
        _;
    }

    modifier onlyAfterVotingSession() {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded,
            "this function can be called only after the voting session has ended");
        _;
    }

    modifier onlyAfterVotesTallied() {
        require(workflowStatus == WorkflowStatus.VotesTallied,
            "this function can be called only after votes have been tallied");
        _;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,

        VotingSessionEnded,
        VotesTallied
    }

}
