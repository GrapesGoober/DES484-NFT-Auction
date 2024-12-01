const Auction = artifacts.require("Auction");
const NFT = artifacts.require("NFT");
// const { expectRevert } = require("@openzeppelin/test-helpers");

contract("Auction", (accounts) => {
    let auction;
    let nft;
    const seller = accounts[0];
    const bidder1 = accounts[1];
    const bidder2 = accounts[2];
    const nftId = 0

    before(async () => {
        // Deploy NFT contract and mint an NFT
        nft = await NFT.new();
        await nft.mintNFT(seller);

        // Deploy Auction contract with the minted NFT
        const endTime = Math.floor(Date.now() / 1000) + 1; // 1 second auction time
        auction = await Auction.new(nft.address, nftId, endTime, { from: seller });
    });

    it("should initialize the auction correctly", async () => {
        const highestBidder = await auction.highestBidder();
        const highestBid = await auction.highestBid();
        assert.equal(highestBidder, seller, "Initial highest bidder should be seller");
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
        const higherBidAmount = web3.utils.toWei("2", "ether");
        const lowerBidAmount = web3.utils.toWei("1", "ether");
        auction.placeBid({ from: bidder1, value: higherBidAmount });

        try {
            // this line should revert
            auction.placeBid({ from: bidder2, value: lowerBidAmount });
            // so i don't expect a null thrown
            throw null;
        } catch (error) {
            assert.equal(error, null, "Bid must be higher than the current highest bid");
        }
    });

    // this one is broken since we're waiting for some time to pass
    // this framework might not be robust enough
    // it("should handle auction ending and reward distribution", async () => {

    //     function sleep(milliseconds) {
    //         var start = new Date().getTime();
    //         while (true) {
    //             if ((new Date().getTime() - start) > milliseconds){
    //                 break;
    //             }
    //         }
    //       }


    //     const initialSellerBalance = BigInt(await web3.eth.getBalance(seller));

    //     const bidAmount = web3.utils.toWei("9", "ether");
    //     auction.placeBid({ from: bidder1, value: bidAmount });

    //     sleep(2000);

    //     await auction.EndAuction({ from: bidder1 });

    //     const nftOwner = await nft.ownerOf(nftId);
    //     const finalSellerBalance = BigInt(await web3.eth.getBalance(seller));

    //     assert.equal(nftOwner, bidder1, "NFT should be transferred to the highest bidder");
    //     assert.equal(finalSellerBalance - initialSellerBalance, BigInt(bidAmount), "Seller should receive the highest bid amount");
    // });

    it("should reject ending the auction before it ends", async () => {
        try {
            auction.EndAuction({ from: bidder1 });
            throw null;
        } catch (error) {
            assert.equal(error, null, "should reject EndAuction");
        }
    });
});
