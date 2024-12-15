const Auction = artifacts.require("AuctionDutch");
const NFT = artifacts.require("NFT"); // Assuming you have an NFT contract

contract("AuctionDutch", (accounts) => {
    let auction;
    let nft;
    const seller = accounts[0];
    const buyer = accounts[1]; // Assuming only one buyer is needed
    const nftId = 0;

    const startingPrice = web3.utils.toWei("10", "ether"); // 10 ETH
    const decrementPerSec = web3.utils.toWei("0.1", "ether"); // 0.1 ETH per second
    const duration = 30; // Auction duration in seconds

    before(async () => {
        // Deploy NFT contract and mint an NFT (similar to English Auction example)
        nft = await NFT.new();
        await nft.mintNFT(seller);

        // Mine the current block to generate a new block.timestamp value
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime(),
        }, () => {});

        // Deploy Auction contract with the minted NFT
        const endTime = Math.floor(Date.now() / 1000) + duration;
        auction = await Auction.new(
            nft.address,
            nftId,
            Math.floor(Date.now() / 1000), // Start time now
            endTime,
            startingPrice,
            decrementPerSec,
            { from: seller }
        );
    });

    it("should reject buying NFT before auction starts", async () => {
        try {
            await auction.buyNFT({ from: buyer, value: startingPrice });
            throw null;
        } catch (error) {
            assert(
                error.message.includes("Auction is not active"),
                "Unexpected error message"
            );
        }
    });

    it("should start the auction correctly", async () => {
        await nft.approve(auction.address, nftId, { from: seller });
        await auction.startAuction({ from: seller });

        const isActive = await auction.isActive();
        assert.equal(isActive, true, "Auction should have started");
    });

    it("should reject too low bid", async () => {
        const price = web3.utils.toWei("1", "ether"); // 10 ETH
        try {
            await auction.buyNFT({ from: buyer, value: price });
            throw null;
        } catch (error) {
            assert(
                error.message.includes("Insufficient funds"),
                "Unexpected error message"
            );
        }
    });

    it("should allow buying NFT at current price during auction", async () => {
        const initialSellerBalance = BigInt(await web3.eth.getBalance(seller));
        const initialBuyerBalance = BigInt(await web3.eth.getBalance(buyer));

        const timeElapsed = "10"; // Adjust time to simulate price decrease
        const currentPrice = startingPrice - (decrementPerSec * timeElapsed);

        // fast forward time to simulate price
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [parseInt(timeElapsed)],
            id: new Date().getTime()
        }, () => {});

        // mine the current block to generate a new block.timestamp value
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime()
        }, () => {});

        await auction.buyNFT({ from: buyer, value: currentPrice });

        const nftOwner = await nft.ownerOf(nftId);
        const finalSellerBalance = BigInt(await web3.eth.getBalance(seller));
        const finalBuyerBalance = BigInt(await web3.eth.getBalance(buyer));

        assert.equal(nftOwner, buyer, "NFT should be transferred to the buyer");
        assert.equal(
            finalSellerBalance - initialSellerBalance,
            currentPrice,
            "Seller should receive the current price"
        );
        assert(
            finalBuyerBalance - initialBuyerBalance,
            "Buyer's balance should decrease"
        );
        assert(
            (finalBuyerBalance + BigInt(currentPrice)) < initialBuyerBalance,
            "Buyer's balance decrease should be less than the paid price (gas fees)"
        );
    });

    it("should reject buying NFT after someone already bought", async () => {
        // Fast forward time to after the auction ends
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [duration + 1], // Auction duration + 1 second
            id: new Date().getTime(),
        }, () => {});

        // Mine the current block to generate a new block.timestamp value
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime(),
        }, () => {});

        try {
            await auction.buyNFT({ from: buyer, value: startingPrice });
            throw null;
            } catch (error) {
            assert(
                error.message.includes("Auction is not active"),
                "Unexpected error message"
            );
        }
    });
});