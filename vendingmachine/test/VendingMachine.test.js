const VendingMachine = artifacts.require("VendingMachine");

// take param account (abstraction giving access to all accounts in the current network)
contract("VendingMachine", (accounts) => {
    before(async () => {
        // create variable names for contract instance
        // make sure vendingmamachine smartcontractis deployed to in-memory environment
        instance = await VendingMachine.deployed()
    })

    // check the initial balance
    it('ensures that the starting balance of the vending machine is 100', async () => {
        let balance = await instance.getVendingMachineBalance()
        assert.equal(balance, 100, 'The initial balance should be 100 donuts.')
    })

    // check whether restart function is working
    it('ensures the balance of the vending machine can be updated', async () =>{
        await instance.restock(100)
        let balance = await instance.getVendingMachineBalance()
        assert.equal(balance, 200, 'The initial balance should be 200 donuts after restocking.')
    })

    it('allows donut to be purchased', async () =>{
        await instance.purchase(1, {from: accounts[0], value: web3.utils.toWei('3', 'ether')});

        let balance = await instance.getVendingMachineBalance()
        assert.equal(balance, 199, 'The balance should be 199 donuts after sells.')
    })
})