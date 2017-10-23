// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import jquery and bootstrap
import 'jquery';
import 'bootstrap-loader';

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import airtoken_artifact from '../../build/contracts/AIRToken.json'

var AirTokenContract = contract(airtoken_artifact);

var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    AirTokenContract.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  setApprovalStatus: function(message) {
    var status = document.getElementById("approvalStatus");
    status.innerHTML = message;
  },

  setReviewStatus: function(message) {
    var status = document.getElementById("reviewStatus");
    status.innerHTML = message;
  },

  setTransferStatus: function(message) {
    var status = document.getElementById("transferStatus");
    status.innerHTML = message;
  },

  setTransferFromStatus: function(message) {
    var status = document.getElementById("transferFromStatus");
    status.innerHTML = message;
  },

  initIndex: function() {
    App.getGeneralInformation();
    App.getAccountInformation();
    App.watchApprovalEvents();
  },

  initTransfer: function() {
    App.getGeneralInformation();
    App.getAccountInformation();
    App.watchTransferEvents();
  },

  getGeneralInformation: function() {
    var airTokenInstance;
    return AirTokenContract.deployed().then(function(instance) {
      airTokenInstance = instance;
      document.getElementById("tokeAddress").innerHTML = airTokenInstance.address;
      return airTokenInstance.totalSupply.call({from: account});
    }).then(function(totalSupply) {
      document.getElementById("totalTokenSupply").innerHTML = totalSupply.toNumber();
    })
  },

  getAccountInformation: function() {
    var airTokenInstance;
    web3.eth.getAccounts(function(errAcc, accs) {
      web3.eth.getBalance(accs[0], function(errBal, balance) {
        document.getElementById("accountEtherAmount").innerHTML = web3.fromWei(balance.toNumber(), "ether");
      })
      document.getElementById("accountAddress").innerHTML = accs[0];
    })
    return AirTokenContract.deployed().then(function(instance) {
      airTokenInstance = instance;
      return airTokenInstance.balanceOf(account, {from: account});
    }).then(function(balance) {
      document.getElementById("accountTokenAmount").innerHTML = balance.toNumber();
    })
  },

  watchApprovalEvents: function() {
    var self = this;
    var airTokenInstance;
    AirTokenContract.deployed().then(function(instance) {
      airTokenInstance = instance;

      airTokenInstance.Approval({}, {fromBlock: 0, toBlock: 'latest'}).watch(function(err, result) {
        if (err != null) {
          alert("There was an error obtaining events");
          return;
        }
        var alertbox = document.createElement("div");
        alertbox.setAttribute("class", "alert alert-info alert-dismissible");
        var closeBtn = document.createElement("button");
        closeBtn.setAttribute("type", "button");
        closeBtn.setAttribute("class", "close");
        closeBtn.setAttribute("data-dismiss", "alert");
        closeBtn.innerHTML = "<span>&times;</span>";
        alertbox.appendChild(closeBtn);

        var eventTitle = document.createElement("div");
        eventTitle.innerHTML = '<h8>Event: ' + result.event + '</h8>';
        alertbox.appendChild(eventTitle);

        var argsBox = document.createElement('textarea');
        argsBox.setAttribute("class", "form-control");
        argsBox.innerText = JSON.stringify(result.args);
        alertbox.appendChild(argsBox);
        document.getElementById("approvalEvents").appendChild(alertbox);
      })

    }).catch(function(e) {
      console.log(e);
      self.setApprovalStatus("Error getting token events");
    })
  },

  watchTransferEvents: function() {
    var self = this;
    var airTokenInstance;
    AirTokenContract.deployed().then(function(instance) {
      airTokenInstance = instance;

      airTokenInstance.Transfer({}, {fromBlock: 0, toBlock: 'latest'}).watch(function(err, result) {
        if (err != null) {
          alert("There was an error obtaining events");
          return;
        }
        var alertbox = document.createElement("div");
        alertbox.setAttribute("class", "alert alert-info alert-dismissible");
        var closeBtn = document.createElement("button");
        closeBtn.setAttribute("type", "button");
        closeBtn.setAttribute("class", "close");
        closeBtn.setAttribute("data-dismiss", "alert");
        closeBtn.innerHTML = "<span>&times;</span>";
        alertbox.appendChild(closeBtn);

        var eventTitle = document.createElement("div");
        eventTitle.innerHTML = '<h8>Event: ' + result.event + '</h8>';
        alertbox.appendChild(eventTitle);

        var argsBox = document.createElement('textarea');
        argsBox.setAttribute("class", "form-control");
        argsBox.innerText = JSON.stringify(result.args);
        alertbox.appendChild(argsBox);
        document.getElementById("transferEvents").appendChild(alertbox);
      })

    }).catch(function(e) {
      console.log(e);
      self.setApprovalStatus("Error getting token events");
    })
  },

  approve: function() {
    var self = this;
    var airTokenInstance;
    var spender = document.getElementById("inputSpenderAddress").value;
    var amount = parseInt(document.getElementById("inputSpenderAmount").value);

    self.setApprovalStatus("Approval in progress...Please wait");

    return AirTokenContract.deployed().then(function(instance) {
      airTokenInstance = instance;
      return airTokenInstance.approve(spender, amount, {from: account});
    }).then(function(txResult) {
      console.log(txResult);
      if (txResult.logs[0].event == "Approval") {
        self.setApprovalStatus("Approved!");
      } else {
        self.setApprovalStatus("Unable to approve request");
      }
      App.initIndex();
    }).catch(function(e) {
      console.log(e);
      self.setApprovalStatus("There was an error approving request");
    })
  },

  allowance: function() {
    var self = this;
    var airTokenInstance;
    var owner = document.getElementById("inputOwnerReviewApproval").value;
    var spender = document.getElementById("inputSpenderReviewApproval").value;

    self.setReviewStatus("Review in progress...please wait");

    return AirTokenContract.deployed().then(function(instance) {
      airTokenInstance = instance;
      return airTokenInstance.allowance(owner, spender, {from: account});
    }).then(function(remaining) {
      self.setReviewStatus("Remaining token transfer allowance: ");
      document.getElementById("reviewRemaing").innerHTML = remaining.toNumber();
    }).catch(function(e) {
      console.log(e);
      self.setReviewStatus("There was an error trying to review allowance");
    })
  }, 

  transfer: function() {
    var self = this;
    var airTokenInstance;
    var recipient = document.getElementById("inputRecipientSendToken").value;
    var amount = parseInt(document.getElementById("inputAmountSendToken").value);

    self.setTransferStatus("Transfer in progress....Please wait");

    return AirTokenContract.deployed().then(function(instance) {
      airTokenInstance = instance;
      return airTokenInstance.transfer(recipient, amount, {from: account});
    }).then(function(txResult) {
      console.log(txResult);
      if (txResult.logs.length > 0) {
        self.setTransferStatus("Transfer Complete!");
      } else {
        self.setTransferStatus("Transfer could not be completed");
      }
    }).catch(function(e) {
      console.log(e);
      self.setTransferStatus("There was an error completing transfer");
    })
    App.initTransfer();
  },

  transferFrom: function() {
    var self = this;
    var airTokenInstance;
    var from = document.getElementById("inputFromTransferToken").value;
    var to = document.getElementById("inputToTransferToken").value;
    var amount = parseInt(document.getElementById("inputAmountTransferToken").value);

    self.setTransferFromStatus("Transfer in progress...Please wait");

    return AirTokenContract.deployed().then(function(instance) {
      airTokenInstance = instance;
      return airTokenInstance.transferFrom(from, to, amount, {from: account});
    }).then(function(txResult) {
      console.log(txResult);
      if (txResult.logs) {
        self.setTransferFromStatus("Transfer Complete!");
      } else {
        self.setTransferFromStatus("Transfer could not be completed");
      }
    }).catch(function(e) {
      console.log(e);
      self.setTransferFromStatus("There was an error completing transfer");
    })
    App.initTransfer();
  }

};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
