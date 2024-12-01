const Auction = artifacts.require("Auction");

contract("Auction", (accounts) => {
    let auction;

    before(async () => {
        // create variable names for contract instance
        // make sure vendingmamachine smartcontractis deployed to in-memory environment
        auction = await Auction.deployed()
    })


    it("should allow bidding", async () => {
        const bidAmount = web3.utils.toWei("1", "ether");
        await auction.placeBid({ from: accounts[0], value: bidAmount });

        const highestBidder = await auction.highestBidder();
        const highestBid = await auction.highestBid();

        assert.equal(highestBidder, accounts[0], 'The highest bidder should be accounts[0]')
        assert.equal(highestBid, bidAmount, 'The highest bid amount doesnt match')
    });

    it("should allow bidding again", async () => {
        const bidAmount = web3.utils.toWei("2", "ether");
        await auction.placeBid({ from: accounts[0], value: bidAmount });

        const highestBidder = await auction.highestBidder();
        const highestBid = await auction.highestBid();

        assert.equal(highestBidder, accounts[0], 'The highest bidder should be accounts[0]')
        assert.equal(highestBid, bidAmount, 'The highest bid amount doesnt match')
    });

    it("should reject lower bids", async () => {
        const insufficientAmount = web3.utils.toWei("1", "ether");
        const biddableAmount = web3.utils.toWei("3", "ether");
        await auction.placeBid({ from: accounts[0], value: biddableAmount });

        try {
            // this line should throw revert exception
            await auction.placeBid({ from: accounts[0], value: insufficientAmount });
            // otherwise, just throw nothing
            throw null;
        } catch (error) {
            // Check if the error message indicates a revert
            assert.notEqual(error, null, "Bid should have been rejected");
        }
    });
});