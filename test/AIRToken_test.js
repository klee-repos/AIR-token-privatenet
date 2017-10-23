var airToken = artifacts.require("./AIRToken.sol");

contract ("AIRToken_test", function(accounts) {

	it('Get total supply and check account 0 balance', function() {
		var totalSupply = 10000000;
		var airTokenInstance;
		return airToken.deployed().then(function(instance) {
			airTokenInstance = instance;
			return airTokenInstance.totalSupply.call({from: accounts[0]});
		}).then(function(balance) {
			assert.equal(balance.toNumber(), totalSupply, "token total supply is not correct");
			return airTokenInstance.balanceOf.call(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), totalSupply, "account 0 token balance is incorrect");
		})
	})

	it('Approve account 2 to send 100 token to account 2', function() {
		var sendValue = 100;
		var airTokenInstance;
		return airToken.deployed().then(function(instance) {
			airTokenInstance = instance;
			return airTokenInstance.approve(accounts[1], sendValue, {from: accounts[0]});
		}).then(function(txResult) {
			assert.equal(txResult.logs[0].event, "Approval", "Approval event should have fired here");
			return airTokenInstance.transferFrom(accounts[0],accounts[1], sendValue + 50, {from: accounts[[1]]});
		}).then(function(txResult) {
			assert.equal(txResult.logs.length, 0, "No events should have fired here");
			return airTokenInstance.transferFrom(accounts[0], accounts[1], sendValue, {from: accounts[[1]]});
		}).then(function(txResult) {
			assert.equal(txResult.logs[0].event, "Transfer", "Transfer event should have fired here");
			return airTokenInstance.balanceOf.call(accounts[1], {from: accounts[1]});
		}).then(function(balance) {
			assert.equal(balance.toNumber(), sendValue, "Account 1 token balance is incorrect");
		})
	})

})