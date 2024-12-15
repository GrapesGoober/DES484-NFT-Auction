const Auction = artifacts.require("AuctionSPSB");
const NFT = artifacts.require("NFT");

contract("AuctionSPSB", (accounts) => {
    let auction;
    let nft;
    const seller = accounts[0];
    const bidder1 = accounts[1];
    const bidder2 = accounts[2];
    const nftId = 0;
    const minPrice = web3.utils.toWei("1", "ether");
    const secondPriceAmount = web3.utils.toWei("3", "ether");

    
    before(async () => {
        // Deploy NFT contract and mint an NFT
        nft = await NFT.new();
        await nft.mintNFT(seller);

        // Deploy Auction contract with the minted NFT
        const endTime = Math.floor(Date.now() / 1000) + 10; // 10-second auction
        
        auction = await Auction.new(nft.address, nftId, endTime, minPrice, { from: seller });
    });

    it("should start the auction correctly", async () => {
        await nft.approve(auction.address, nftId, { from: seller });
        await auction.startAuction({ from: seller });

        const auctionStarted = await auction.auctionStarted();
        assert.equal(auctionStarted, true, "Auction should have started");
    });

    it("should initialize the auction variables correctly", async () => {
        const highestBidder = await auction.highestBidder();
        assert.equal(highestBidder, "0x0000000000000000000000000000000000000000", "Initial highest bidder should be empty");
    });

    it("contract should own NFT token now", async () => {
        const nftOwner = await nft.ownerOf(nftId);
        assert.equal(nftOwner, auction.address, "Auction should own NFT");
    });

    it("should allow bidding and update variables correctly", async () => {

        // first, bidder1 makes a 2 ether bid
        // bidder1 becomes highest bidder, but still only pays second price

        const bidAmount = web3.utils.toWei("2", "ether");
        const initialBalance = await web3.eth.getBalance(bidder1);
    
        await auction.placeBid({ from: bidder1, value: bidAmount });
    
        const finalBalance = await web3.eth.getBalance(bidder1);
        const balanceDifference = initialBalance - finalBalance;
        const highestBidder = await auction.highestBidder();
        const contractBalance = await web3.eth.getBalance(auction.address);
    
        assert.equal(highestBidder, bidder1, "Highest bidder should be bidder1");
        assert.equal(contractBalance, bidAmount, "Contract balance should match highest bid");
        // this is 'more than' since bidder lose some money as gas fees
        assert(balanceDifference > bidAmount, "Bidder1's balance should decrease by the bid amount");
    });

    it("should refund previous bidder when outbid", async () => {
        // bidder2 makes a bid that outbids highest bid


        const initialBalanceBidder1 = BigInt(await web3.eth.getBalance(bidder1));
        await auction.placeBid({ from: bidder2, value: secondPriceAmount });

        const highestBidder = await auction.highestBidder();
        const contractBalance = await web3.eth.getBalance(auction.address);
        const finalBalanceBidder1 = BigInt(await web3.eth.getBalance(bidder1));

        assert.equal(highestBidder, bidder2, "Highest bidder should be bidder2");
        assert.equal(contractBalance, secondPriceAmount, "Contract balance should match second bid amount");
        assert(finalBalanceBidder1 > initialBalanceBidder1, "Previous bidder should be refunded");
    });

    it("should reject lower or equal bids", async () => {
        const lowerBid = web3.utils.toWei("1", "ether");
        const initialContractBalance = await web3.eth.getBalance(auction.address);
        await auction.placeBid({ from: bidder1, value: lowerBid });

        const highestBidder = await auction.highestBidder();
        const finalContractBalance = await web3.eth.getBalance(auction.address);

        assert.equal(highestBidder, bidder2, "Highest bidder should still be bidder2");
        assert.notEqual(initialContractBalance, finalContractBalance, 
            "Contract balance should not change");
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
        const bidAmount = web3.utils.toWei("4", "ether");
        
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

        // check that the second price mechanism works
        assert.equal(nftOwner, bidder1, "NFT should be transferred to the highest bidder");
        assert.equal(finalSellerBalance - initialSellerBalance, BigInt(secondPriceAmount), 
            "Seller should receive the second bid amount");
    });
});