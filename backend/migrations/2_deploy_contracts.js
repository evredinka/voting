const SimpleVoting = artifacts.require("SimpleVoting");

module.exports = deployer => {
    deployer.deploy(SimpleVoting);
};
