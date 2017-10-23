var airToken = artifacts.require("./AIRToken.sol");

module.exports = function(deployer) {
  deployer.deploy(airToken);
};
