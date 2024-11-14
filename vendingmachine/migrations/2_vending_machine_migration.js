const VendingMachine = artifacts.require('VendingMachine');

// Migration = Deployment
// Whenever we run the migration, we include vendingmachine smartconstract in this migration
module.exports = function (deployer){
    deployer.deploy(VendingMachine);
};


