const Auction = artifacts.require("EnglishAuctionNFT");
const NFT = artifacts.require("NFT");

contract("EnglishAuctionNFT", (accounts) => {
    let auction;
    let nft;
    const seller = accounts[0];
    const bidder1 = accounts[1];
    const bidder2 = accounts[2];
    const nftId = 0;

    before(async () => {
        // Deploy NFT contract and mint an NFT
        nft = await NFT.new();
        await nft.mintNFT(seller);

        // Deploy Auction contract with the minted NFT
        const endTime = Math.floor(Date.now() / 1000) + 10; // 10-second auction
        auction = await Auction.new(nft.address, nftId, endTime, { from: seller });
    });

    it("should start the auction correctly", async () => {
        await nft.approve(auction.address, nftId, { from: seller });
        await auction.startAuction({ from: seller });

        const auctionStarted = await auction.auctionStarted();
        assert.equal(auctionStarted, true, "Auction should have started");
    });

    it("should initialize the auction variables correctly", async () => {
        const highestBidder = await auction.highestBidder();
        const highestBid = await auction.highestBid();
        assert.equal(highestBidder, "0x0000000000000000000000000000000000000000", "Initial highest bidder should be empty");
        assert.equal(highestBid.toString(), "0", "Initial highest bid should be 0");
    });

    it("contract should own NFT token now", async () => {
        const nftOwner = await nft.ownerOf(nftId);
        assert.equal(nftOwner, auction.address, "Auction should own NFT");
    });

    it("should allow bidding and update variables correctly", async () => {
        const bidAmount = web3.utils.toWei("1", "ether");
        const initialBalance = await web3.eth.getBalance(bidder1);
    
        await auction.placeBid({ from: bidder1, value: bidAmount });
    
        const finalBalance = await web3.eth.getBalance(bidder1);
        const balanceDifference = initialBalance - finalBalance;
        const highestBidder = await auction.highestBidder();
        const highestBid = await auction.highestBid();
        const contractBalance = await web3.eth.getBalance(auction.address);
    
        assert.equal(highestBidder, bidder1, "Highest bidder should be bidder1");
        assert.equal(highestBid.toString(), bidAmount, "Highest bid should match bid amount");
        assert.equal(contractBalance, bidAmount, "Contract balance should match highest bid");
        // this is 'more than' since bidder lose some money as gas fees
        assert(balanceDifference > bidAmount, "Bidder1's balance should decrease by the bid amount");
    });

    it("should refund previous bidder when outbid", async () => {
        const bidAmount1 = web3.utils.toWei("1", "ether");
        const bidAmount2 = web3.utils.toWei("2", "ether");

        const initialBalanceBidder1 = BigInt(await web3.eth.getBalance(bidder1));

        await auction.placeBid({ from: bidder2, value: bidAmount2 });

        const highestBidder = await auction.highestBidder();
        const highestBid = await auction.highestBid();
        const contractBalance = await web3.eth.getBalance(auction.address);
        const finalBalanceBidder1 = BigInt(await web3.eth.getBalance(bidder1));

        assert.equal(highestBidder, bidder2, "Highest bidder should be bidder2");
        assert.equal(highestBid.toString(), bidAmount2, "Highest bid should match second bid amount");
        assert.equal(contractBalance, bidAmount2, "Contract balance should match second bid amount");
        assert(finalBalanceBidder1 > initialBalanceBidder1, "Previous bidder should be refunded");
    });

    it("should reject lower or equal bids", async () => {
        const lowerBid = web3.utils.toWei("1", "ether");
        try {
            await auction.placeBid({ from: bidder1, value: lowerBid });
            throw null;
        } catch (error) {
            assert(error.message.includes("Bid must be higher than the current highest bid"), "Unexpected error message");
        }
    });

    it("should reject ending the auction before it ends", async () => {
        try {
            await auction.EndAuction({ from: seller });
            throw null;
        } catch (error) {
            const m = error.message;
            assert(m.includes("Auction has not ended yet"), `Unexpected error message:${m}`)
        }
    });

    it("should handle auction ending and reward distribution", async () => {
        const bidAmount = web3.utils.toWei("3", "ether");
        await auction.placeBid({ from: bidder1, value: bidAmount });

        // fast forward time to after the auction ends
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [11],
            id: new Date().getTime()
        }, () => {});

        // mine the current block to generate a new block.timestamp value
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime()
        }, () => {});

        const initialSellerBalance = BigInt(await web3.eth.getBalance(seller));
        await auction.EndAuction({ from: bidder1 });

        const nftOwner = await nft.ownerOf(nftId);
        const finalSellerBalance = BigInt(await web3.eth.getBalance(seller));

        assert.equal(nftOwner, bidder1, "NFT should be transferred to the highest bidder");
        assert.equal(finalSellerBalance - initialSellerBalance, BigInt(bidAmount), "Seller should receive the highest bid amount");
    });
});
