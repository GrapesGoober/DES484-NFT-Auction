const Auction = artifacts.require("Auction");
const NFT = artifacts.require("NFT");
const { expectRevert } = require("@openzeppelin/test-helpers");

contract("Auction", (accounts) => {
    let auction;
    let nft;
    const seller = accounts[0];
    const bidder1 = accounts[1];
    const bidder2 = accounts[2];
    const nftURI = "testURI";

    before(async () => {
        // Deploy NFT contract and mint an NFT
        nft = await NFT.new();
        await nft.mintNFT(seller, nftURI);
        const nftId = 0;

        // Deploy Auction contract with the minted NFT
        const endTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
        auction = await Auction.new(nft.address, nftId, endTime, { from: seller });

        // Approve and transfer the NFT to the Auction contract
        await nft.approve(auction.address, nftId, { from: seller });
    });

    it("should initialize the auction correctly", async () => {
        const highestBidder = await auction.highestBidder();
        const highestBid = await auction.highestBid();
        assert.equal(highestBidder, "0x0000000000000000000000000000000000000000", "Initial highest bidder should be null");
        assert.equal(highestBid.toString(), "0", "Initial highest bid should be 0");
    });

    it("should allow bidding and lock funds", async () => {
        const bidAmount = web3.utils.toWei("1", "ether");
        await auction.placeBid({ from: bidder1, value: bidAmount });

        const highestBidder = await auction.highestBidder();
        const highestBid = await auction.highestBid();
        const contractBalance = await web3.eth.getBalance(auction.address);

        assert.equal(highestBidder, bidder1, "Highest bidder should be bidder1");
        assert.equal(highestBid.toString(), bidAmount, "Highest bid should be 1 ether");
        assert.equal(contractBalance, bidAmount, "Contract balance should match highest bid");
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
        assert.equal(highestBid.toString(), bidAmount2, "Highest bid should be 2 ether");
        assert.equal(contractBalance, bidAmount2, "Contract balance should match highest bid");
        assert(finalBalanceBidder1 > initialBalanceBidder1, "Bidder1 should be refunded");
    });

    it("should reject lower or equal bids", async () => {
        const bidAmount = web3.utils.toWei("2", "ether");

        await expectRevert(
            auction.placeBid({ from: bidder1, value: bidAmount }),
            "Bid must be higher than the current highest bid"
        );
    });

    it("should handle auction ending and reward distribution", async () => {
        // Fast forward time to end the auction
        await time.increase(3601); // Increase time by 1 hour + 1 second

        const initialSellerBalance = BigInt(await web3.eth.getBalance(seller));
        const highestBid = await auction.highestBid();

        await auction.EndAuction({ from: bidder2 });

        const nftOwner = await nft.ownerOf(0);
        const finalSellerBalance = BigInt(await web3.eth.getBalance(seller));

        assert.equal(nftOwner, bidder2, "NFT should be transferred to the highest bidder");
        assert.equal(finalSellerBalance - initialSellerBalance, BigInt(highestBid), "Seller should receive the highest bid amount");
    });

    it("should reject ending the auction before it ends", async () => {
        const endTime = Math.floor(Date.now() / 1000) + 3600; // Reset for a new auction
        auction = await Auction.new(nft.address, 0, endTime, { from: seller });

        await expectRevert(
            auction.EndAuction({ from: bidder1 }),
            "Auction has not ended yet"
        );
    });
});
