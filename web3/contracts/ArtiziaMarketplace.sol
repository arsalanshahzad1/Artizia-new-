// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IUniswapV2Router01 {
    function factory() external pure returns (address);

    function WETH() external pure returns (address);

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    )
        external
        payable
        returns (uint amountToken, uint amountETH, uint liquidity);

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);

    function removeLiquidityETH(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountToken, uint amountETH);

    function removeLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint amountA, uint amountB);

    function removeLiquidityETHWithPermit(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint amountToken, uint amountETH);

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);

    function swapTokensForExactETH(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function swapETHForExactTokens(
        uint amountOut,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);

    function quote(
        uint amountA,
        uint reserveA,
        uint reserveB
    ) external pure returns (uint amountB);

    function getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) external pure returns (uint amountOut);

    function getAmountIn(
        uint amountOut,
        uint reserveIn,
        uint reserveOut
    ) external pure returns (uint amountIn);

    function getAmountsOut(
        uint amountIn,
        address[] calldata path
    ) external view returns (uint[] memory amounts);

    function getAmountsIn(
        uint amountOut,
        address[] calldata path
    ) external view returns (uint[] memory amounts);
}

interface IUniswapV2Router02 is IUniswapV2Router01 {
    function removeLiquidityETHSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external returns (uint amountETH);

    function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
        address token,
        uint liquidity,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline,
        bool approveMax,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint amountETH);

    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external payable;

    function swapExactTokensForETHSupportingFeeOnTransferTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external;
}

interface IERC20USDT {
    function allowance(address owner, address spender) external returns (uint);

    function transferFrom(address from, address to, uint value) external;

    function approve(address spender, uint value) external;

    function totalSupply() external returns (uint);

    function balanceOf(address who) external returns (uint);

    function transfer(address to, uint value) external;
}

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

error invalidPrice();
error invalidListingFee();
error invalidListingType();

contract ArtiziaMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public _nftsSold;
    Counters.Counter public _nftCount;
    // uint256 public LISTING_FEE = 0.0001 ether;
    address payable private _marketOwner;


    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    ///////////////    MAPPINGS    ////////////////
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////

    mapping(uint256 => NFT) public _idToNFT;

    mapping(uint256 => Auction) public _idToAuction;

    mapping(address => mapping(address => bool)) public isFan;

    mapping(address => address[]) public fanLists;

    mapping(address => bool) public bannedUsers;

    mapping(address => bool) public deletedUsers;

    enum ListingType {
        FixedPrice,
        Auction
    }

    enum PaymentMethod {
        ETHER,
        USDT,
        FIAT
    }
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    ///////////////    STRUCTS    /////////////////
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////

    struct Auction {
        uint256 tokenId;
        address payable seller;
        uint256 basePrice;
        uint256 startTime;
        uint256 endTime;
        uint256 highestBid;
        address payable highestBidder;
        PaymentMethod highestBidCurrency;
        // bool isLive;
    }

    struct NFT {
        address nftContract;
        uint256 tokenId;
        address payable firstOwner;
        address payable seller;
        address payable owner;
        uint256 price;
        bool listed;
        uint256 royaltyPrice;
        ListingType listingType;
        PaymentMethod paymentMethod;
        bool approve;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 tokenId;
    }

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    ///////////////    ENUMS    ///////////////////
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////

    event auctionEndTimeIncreased(uint256 newTime);

    event receivedABid(
        uint256 tokenId,
        address seller,
        address highestBidder,
        uint256 highestBid
    );

    event getsOutbid(
        uint256 tokenId,
        address seller,
        address highestBidder,
        uint256 highestBid
    );

    event NFTListed(
        address nftContract,
        uint256 tokenId,
        address seller,
        address owner,
        uint256 price
    );

    event NFTSold(
        address nftContract,
        uint256 tokenId,
        address seller,
        address owner,
        uint256 price
    );

    address public UNISWAP_ROUTER_ADDRESS =
        0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address public USDT_ADDRESS = 0xdAC17F958D2ee523a2206206994597C13D831ec7;

    IUniswapV2Router02 uniswapRouter;
    IERC20USDT USDTtoken;

    constructor(address _token) {
        _marketOwner = payable(msg.sender);
        uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
        USDTtoken = IERC20USDT(_token);
    }

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    ///////////////    MODIFIERS    ///////////////
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////

    // Function to swap USDT for ETH
    function swapUSDTForETH(uint256 usdtAmountIn) public returns (uint256) {
        console.log("test=1", usdtAmountIn);
        address[] memory path = new address[](2);
        path[0] = USDT_ADDRESS;
        path[1] = uniswapRouter.WETH();

        USDTtoken.transferFrom(msg.sender, address(this), usdtAmountIn);

        // Approve the Uniswap Router to spend the USDT
        USDTtoken.approve(UNISWAP_ROUTER_ADDRESS, usdtAmountIn);

        console.log("test3");
        // Define the variable to store the return array
        uint256[] memory amountsOut = new uint256[](2);

        // Call the getAmountsOut function and assign the return value
        amountsOut = uniswapRouter.getAmountsOut(usdtAmountIn, path);

        console.log("amount", amountsOut[1]);

        // Perform the swap transaction
        uniswapRouter.swapTokensForExactETH(
            amountsOut[1],
            usdtAmountIn,
            path,
            address(this),
            block.timestamp
        );

        // Transfer the received ETH to the desired recipient (User A)
        console.log("test4");
        // payable(msg.sender).transfer(amountsOut[1]);

        return amountsOut[1];
    }
 
    // Function to swap ETH for USDT
    function swapETHForUSDT(uint256 usdtAmountOut) public payable {
        // Specify the desired USDT output amount
        // uint256 usdtAmountOut = 1000; // Example: Swap 1 ETH for 1000 USDT

        // Prepare the swap path (ETH to USDT)
        address[] memory path = new address[](2);
        path[0] = uniswapRouter.WETH();
        path[1] = USDT_ADDRESS;

        uint256[] memory amountsOut = new uint256[](2);
        // Call the getAmountsOut function and assign the return value
        amountsOut = uniswapRouter.getAmountsOut(usdtAmountOut, path);

        // Perform the swap transaction
        uniswapRouter.swapExactETHForTokens{value: msg.value}(
            amountsOut[1],
            path,
            address(this),
            block.timestamp
        );

        // USDTtoken.transfer(msg.sender, amountsOut[1]);
    }

    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    modifier auctionIsLive(uint256 _tokenId) {
        require(
            block.timestamp > _idToAuction[_tokenId].startTime &&
                block.timestamp < _idToAuction[_tokenId].endTime,
            "This NFT is not on auction at the moment."
        );
        _;
    }

    modifier isApproved(uint256 _tokenId) {
        // Put this modifier in the following functions:
        // BuyWithETH
        // BuyWithUSDT
        // BidInUSDT
        // BidInETH
        require(
            _idToNFT[_tokenId].approve == true,
            "This NFT is not approved yet from the admin for purchase"
        );
        _;
    }

    modifier isUserBanned() {
        require(!bannedUsers[msg.sender], "You are banned on this platform.");
        _;
    }

    modifier isUserDeleted() {
        require(
            !deletedUsers[msg.sender],
            "You are permenantly deleted from this platform for violating the policies."
        );
        _;
    }

    // List the NFT on the marketplace
    function listNft(
        address _nftContract,
        uint256[] memory _tokenId,
        uint256 _price,
        uint256 _royaltyPrice,
        uint256 _listingType,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _paymentMethod
    ) public payable nonReentrant isUserBanned isUserDeleted {
        // require(_price > 0, "Price must be at least 1 wei");
        // require(msg.value == LISTING_FEE, "Not enough ether for listing fee");

        for (uint256 i = 0; i < _tokenId.length; i++) {
            console.log("this is 1", _tokenId[i]);
            console.log("_listingType", _listingType);
            console.log(
                "uint256(ListingType.Auction)",
                uint256(ListingType.Auction)
            );

            if (_price < 0) {
                revert invalidPrice();
            } else if (_listingType > uint256(ListingType.Auction)) {
                revert invalidListingType();
            } else {
                console.log("_tokenId[i]", _tokenId[i]);

                IERC721(_nftContract).transferFrom(
                    msg.sender,
                    address(this),
                    _tokenId[i]
                );
                console.log("this is 2");

                // _marketOwner.transfer(LISTING_FEE);
                // console.log("this is 3");

                _nftCount.increment();
                console.log("this is 4");

                _idToNFT[_tokenId[i]] = NFT(
                    _nftContract,
                    _tokenId[i],
                    payable(msg.sender),
                    payable(msg.sender),
                    payable(address(this)),
                    _price,
                    true,
                    _royaltyPrice,
                    ListingType(_listingType),
                    PaymentMethod(_paymentMethod),
                    false
                );
                console.log("this is 5");

                if (_listingType == uint256(ListingType.Auction)) {
                    console.log("this is 6");

                    _idToAuction[_tokenId[i]] = Auction(
                        _tokenId[i], //tokenId
                        payable(msg.sender), // seller
                        _price, // basePrice
                        _startTime, // startTime
                        _endTime, // endTime
                        0, // highestBid
                        payable(address(0)), // highestBidder
                        PaymentMethod(_paymentMethod)
                        // false // isLive
                    );
                }
                console.log("this is 7");

                emit NFTListed(
                    _nftContract,
                    _tokenId[i],
                    msg.sender,
                    address(this),
                    _price
                );
            }
        }
    }

    function getLatestUSDTPrice() public view returns (uint256) {
        // Commenting for testing

        // 0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46 USDt/ETH Ethereum mainnet
        AggregatorV3Interface USDTPriceFeed = AggregatorV3Interface(
            0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46
        ); // Mainnet contract address for USDT price feed
        (, int256 price, , , ) = USDTPriceFeed.latestRoundData(); // Get the latest USDT price data from Chainlink
        require(price > 0, "Invalid USDT price"); // Ensure that the price is valid
        return uint256(price);

        // return 531391650000000;
    }

    function buyWithUSDT(
        address _nftContract,
        uint256 _paymentMethod,
        uint256 _tokenId,
        uint256 _amount
    ) public payable isUserBanned isUserDeleted nonReentrant {
         
        NFT storage nft = _idToNFT[_tokenId];

        uint256 _amountInETHInWei = _amount * getLatestUSDTPrice();

        require(
            !bannedUsers[nft.owner],
            "The owner of this nft is blacklisted on this platform."
        );
        require(
            !deletedUsers[nft.owner],
            "The owner of this nft is permanantly banned on this platform."
        );
        require(_amountInETHInWei >= nft.price, "Send more!");

        require(
            nft.listingType == ListingType.FixedPrice,
            "This NFT is not at auction"
        );

        require(nft.listed == true, "Nft is not listed to purchase");

        bool check = false;

        address payable buyer = payable(msg.sender);
        console.log("Check1");

        uint256 _amountAfterRoyalty;
        uint256 _amountToBePaid;

        // require(nft.seller == nft.firstOwner, "Seller and first owner");
        // console.log("Check2");

        USDTtoken.transferFrom(msg.sender, address(this), _amount);

        if (nft.seller == nft.firstOwner) {
            console.log("Check3");
            // approve from frontend
            _amountToBePaid = _amount - platformFeeCalculate(_amount);
            if (_paymentMethod == 1) {
                console.log("Check4");

                uint256 _amountToBePaidInUSDTInDecimals = _amountToBePaid * 1*10**6;
                
                USDTtoken.transfer(nft.seller, _amountToBePaid);
                check = true;
            } else {
                console.log("Check5");
                // _amountToBePaid swap in ETH
                swapUSDTForETH(_amountToBePaid);
                // get eth price of
                uint256 _amountToBePaidInETHInWei = _amountToBePaid *
                    getLatestUSDTPrice();
                // pay the seller
                payable(nft.seller).transfer(_amountToBePaidInETHInWei);
                check = true;
            }
        } else {
            console.log("Check6");
            uint256 _royaltyFee = royaltyCalculate(_amount, nft.royaltyPrice);

            _amountAfterRoyalty = _amount - _royaltyFee;
            _amountToBePaid =
                _amount -
                platformFeeCalculate(_amountAfterRoyalty);

            uint256 _royaltyInUSDTInDecimals = _royaltyFee * 1*10**6;


            USDTtoken.transfer(nft.firstOwner, _royaltyFee);
            console.log("Check7");
            if (_paymentMethod == 1) {
                console.log("Check8");

            uint256 _amountInUSDTInDecimals = _amountToBePaid * 1*10**6;


                
                USDTtoken.transfer(nft.seller, _amountToBePaid);
                check = true;
                console.log("Check9");
            } else {
                // _amountToBePaid swap in ETH
                swapUSDTForETH(_amountToBePaid);
                // get eth price of
                uint256 _amountToBePaidInETHInWei = _amountToBePaid *
                    getLatestUSDTPrice();
                console.log("Check11");
                // pay the seller
                payable(nft.seller).transfer(_amountToBePaidInETHInWei);
                console.log("Check12");
                check = true;
            }
            // payable(nft.seller).transfer(_amountAfterRoyalty);
            // payable(nft.firstOwner).transfer(_royaltyFee);
        }

        if (check) {
            console.log("Check13");
            IERC721(_nftContract).transferFrom(
                address(this),
                buyer,
                nft.tokenId
            );
            console.log("Check14");
            nft.owner = buyer;
            nft.seller = payable(address(0));
            nft.listed = false;
            _nftsSold.increment();
            emit NFTSold(
                _nftContract,
                nft.tokenId,
                nft.seller,
                buyer,
                _amountAfterRoyalty
            );
            console.log("Check15");
        }
    }

    // Buy an NFT with ETH
    function buyWithETH(
        address _nftContract,
        uint256 _paymentMethod,
        uint256 _tokenId
    ) public payable isUserBanned isUserDeleted nonReentrant {
        NFT storage nft = _idToNFT[_tokenId];
        require(
            !bannedUsers[nft.owner],
            "The owner of this nft is blacklisted on this platform."
        );
        require(
            !deletedUsers[nft.owner],
            "The owner of this nft is permanantly banned on this platform."
        );
        require(
            msg.value >= nft.price,
            "Not enough ether to cover asking price"
        );
        require(
            nft.listingType == ListingType.FixedPrice,
            "This NFT is not at auction"
        );

        require(nft.listed == true, "Nft is not listed to purchase");

        bool check = false;
        address payable buyer = payable(msg.sender);

        uint256 _amountAfterRoyalty;
        uint256 _amountToBePaid;

        if (nft.seller == nft.firstOwner) {
            _amountToBePaid = msg.value - platformFeeCalculate(msg.value);
            if (_paymentMethod == 0) {
                payable(nft.seller).transfer(_amountToBePaid);
                check = true;
            } else {
                //swap _amountToBePaid here to USDT and transfer
                swapETHForUSDT(_amountToBePaid);
                // get the equivalent of _amountToBePaid from getUSDTPrice
                uint256 _amountToBePaidInUSDT = _amountToBePaid *
                    getLatestUSDTPrice();
                // send USDT to nft.seller


                uint256 _amountToBePaidInUSDTInDecimals = _amountToBePaidInUSDT * 1*10**6;


                USDTtoken.transfer(nft.seller, _amountToBePaidInUSDT);
                check = true;
            }
            } else {
            uint256 _amount = msg.value;
            uint256 _royaltyFee = royaltyCalculate(_amount, nft.royaltyPrice);
            // _amountAfterRoyalty = _amount - _royaltyFee;
            _amountToBePaid =
                _amount -
                _royaltyFee -
                platformFeeCalculate(_amount);
            payable(nft.firstOwner).transfer(_royaltyFee);
            if (_paymentMethod == 0) {
                payable(nft.seller).transfer(_amountToBePaid);
                check = true;
            } else {
                //swap _amountToBePaid here to USDT and transfer
                swapETHForUSDT(_amountToBePaid);
                // get the equivalent of _amountToBePaid from getUSDTPrice
                uint256 _amountToBePaidInUSDT = _amountToBePaid /
                    getLatestUSDTPrice();
                // send USDT to nft.seller

                uint256 _amountToBePaidInUSDTInDecimals = _amountToBePaidInUSDT * 1*10**6;


                USDTtoken.transfer(nft.seller, _amountToBePaidInUSDT);
                check = true;

            }
        }

        if (check) {
            IERC721(_nftContract).transferFrom(
                address(this),
                buyer,
                nft.tokenId
            );
            nft.owner = buyer;
            nft.seller = payable(address(0));
            nft.listed = false;
            _nftsSold.increment();
            emit NFTSold(
                _nftContract,
                nft.tokenId,
                nft.seller,
                buyer,
                _amountAfterRoyalty
            );
        }
    }

    // Resell an NFT purchased from the marketplace
    function resellNft(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price,
        uint256 _listingType,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _paymentMethod
    ) public isUserBanned isUserDeleted nonReentrant {
        NFT storage nft = _idToNFT[_tokenId];

        require(_price > 0, "Price must be at least 1 wei");
        require(
            nft.owner == msg.sender,
            "Only the owner of an nft can list the nft."
        );

        IERC721(_nftContract).transferFrom(msg.sender, address(this), _tokenId);

        nft.seller = payable(msg.sender);
        nft.owner = payable(address(this));
        nft.price = _price;
        nft.listed = true;
        nft.listingType = ListingType(_listingType);
        nft.paymentMethod = PaymentMethod(_paymentMethod);

        if (_listingType == uint256(ListingType.Auction)) {
            _idToAuction[_tokenId] = Auction(
                _tokenId, // tokenId
                payable(msg.sender), // seller
                _price, // basePrice
                _startTime, // startTime
                _endTime, // endTime
                0, // highestBid
                payable(address(0)), // highestBidder
                PaymentMethod(_paymentMethod)
                // false // isLive
            );
        }

        _nftsSold.decrement();
        emit NFTListed(
            _nftContract,
            _tokenId,
            msg.sender,
            address(this),
            _price
        );
    }

    function getHighestBid(uint256 _tokenId) public view returns (uint256) {
        return _idToAuction[_tokenId].highestBid;
    }

    function bidInETH(
        uint256 _tokenId,
        uint256 _bidCurrency
    ) public payable auctionIsLive(_tokenId) isUserDeleted isUserBanned {
        if (_idToAuction[_tokenId].highestBidder == address(0)) {
            require(
                msg.value >= _idToAuction[_tokenId].basePrice,
                "Minimum bid has to be higher"
            );
        }
        require(
            msg.value > _idToAuction[_tokenId].highestBid,
            "You have to bid higher than the highest bid to make an offer"
        );
        require(
            _idToNFT[_tokenId].listingType == ListingType.Auction,
            "This NFT is at at auction"
        );
        require(
            _idToNFT[_tokenId].listed == true,
            "Nft is not listed to purchase"
        );

        Auction storage auction = _idToAuction[_tokenId];

        address payable prevBidder = auction.highestBidder;
        uint256 prevBid = auction.highestBid;

        // handle previous highest bidder
         if (auction.highestBidder != address(0)) {

            if( auction.highestBidCurrency == PaymentMethod.USDT){

                // converting eth into usdt .... this will discard the decimal though
                uint256 usdtToReturn = prevBid / (getLatestUSDTPrice() * 10**12);
                
                USDTtoken.transfer(prevBidder, usdtToReturn);
            }
            else if (auction.highestBidCurrency == PaymentMethod.ETHER){
                payable(prevBidder).transfer(prevBid);
        }
         }
        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);
        auction.highestBidCurrency = PaymentMethod(_bidCurrency);

        if (auction.endTime < block.timestamp + 10 minutes) {
            auction.endTime += 5 minutes;
            emit auctionEndTimeIncreased(auction.endTime);
        }

        emit receivedABid(_tokenId, auction.seller , auction.highestBidder, auction.highestBid);

    }

    function bidInUSDT(
        uint256 _tokenId,
        uint256 _amount,
        uint256 _bidCurrency
    ) public payable auctionIsLive(_tokenId) isUserDeleted isUserBanned {
        uint256 ethPriceInUsdt = getLatestUSDTPrice();

        uint256 _amountInETHInWei = _amount * ethPriceInUsdt;

        // uint256 _amountInETH = _amountInETHInWei / 10 ** 18;
        console.log("Check1");
        if (_idToAuction[_tokenId].highestBidder == address(0)) {
            require(
                _amountInETHInWei >= _idToAuction[_tokenId].basePrice,
                "Minimum bid has to be higher"
            );
        }
        console.log("Check2");

        require(
            _amountInETHInWei >= _idToAuction[_tokenId].highestBid,
            "You have to bid higher than the highest bid to make an offer"
        );
        console.log("Check3");

        require(
            _idToNFT[_tokenId].listingType == ListingType.Auction,
            "This NFT is at at auction"
        );

        require(
            _idToNFT[_tokenId].listed == true,
            "Nft is not listed to purchase"
        );

        console.log("Check4");

        Auction storage auction = _idToAuction[_tokenId];

        address payable prevBidder = auction.highestBidder;
        uint256 prevBid = auction.highestBid;
        console.log("Check5");

        // handle previous highest bidder
     
         if (auction.highestBidder != address(0)) {

            if( auction.highestBidCurrency == PaymentMethod.USDT){
                USDTtoken.transfer(prevBidder, prevBid);
            }
            else if (auction.highestBidCurrency == PaymentMethod.ETHER){
                payable(prevBidder).transfer(prevBid);
        }
         }



        auction.highestBid = _amountInETHInWei;
        auction.highestBidder = payable(msg.sender);
        auction.highestBidCurrency = PaymentMethod(_bidCurrency);
        console.log("Check7");

        if (auction.endTime < block.timestamp + 10 minutes) {
            console.log("Check8");
            auction.endTime += 5 minutes;
            emit auctionEndTimeIncreased(auction.endTime);
            console.log("Check9");
        }

        emit receivedABid(_tokenId, auction.seller , auction.highestBidder, auction.highestBid);

    }

    function closeAuction(
        address _nftContract,
        uint256 _tokenId
    ) public payable {
        require(
            block.timestamp > _idToAuction[_tokenId].endTime,
            "Auction has not ended yet"
        );
        require(
            _idToAuction[_tokenId].highestBidder != address(0),
            "Auction has not ended yet"
        );

        NFT storage nft = _idToNFT[_tokenId];
        Auction storage auction = _idToAuction[_tokenId];

        // if there are no bids on an auction end the function there
        if (_idToAuction[_tokenId].highestBidder == address(0)) {
            IERC721(_nftContract).transferFrom(
                address(this),
                auction.seller,
                nft.tokenId
            );

            nft.owner = nft.seller;
            // auction.isLive = false;
            nft.listed = false;
            require(
                _idToAuction[_tokenId].highestBidder != address(0),
                "Nothing to claim. You have got 0 bids on your auction. Returning your NFT."
            );
        }

        // auction.isLive = false;
        nft.listed = false;
        uint256 _royaltyFee;
        uint256 _amountAfterRoyalty;
        uint256 _amountToBePaid;
        uint256 _amount = auction.highestBid; // alreay saving all bids in ether 
        nft.owner = auction.highestBidder;

        // if the seller wants to be paid in ether
        if (nft.paymentMethod == PaymentMethod.ETHER) {
            // if last bid is in USDT swap and update amount
            if (auction.highestBidCurrency == PaymentMethod.USDT) {
                // swap USDT to ETH and update _amount
                // _amount =

                // usdt ki 6 decimal me price chahye yha
                uint256 _amountOfUSDT = _amount * getLatestUSDTPrice();
                swapUSDTForETH(_amountOfUSDT);
                _amount = _amount;
            }

            if (nft.owner == nft.firstOwner) {
                _amountToBePaid = _amount - platformFeeCalculate(_amount);
                payable(nft.seller).transfer(_amountToBePaid);
            } else {
                _royaltyFee = royaltyCalculate(
                    auction.highestBid,
                    nft.royaltyPrice
                );
                _amountToBePaid =
                    _amount -
                    _royaltyFee -
                    platformFeeCalculate(_amount);
                payable(nft.firstOwner).transfer(_royaltyFee);
                payable(nft.seller).transfer(_amountToBePaid);
            }

            // if the seller wants to be paid in USDT
        } else if (nft.paymentMethod == PaymentMethod.USDT) {

            if (auction.highestBidCurrency == PaymentMethod.ETHER) {
                uint256 _amountOfUSDT = _amount / getLatestUSDTPrice();
                swapETHForUSDT(_amount);
                _amount = _amountOfUSDT;
            }
            if (nft.owner == nft.firstOwner) {
                // USDTtoken.transferFrom(msg.sender, address(this), _amount);
                _amountToBePaid = _amount - platformFeeCalculate(_amount);
                USDTtoken.transfer(nft.seller, _amountToBePaid);
                // payable(nft.seller).transfer(_amountToBePaid);
            } else {
                _royaltyFee = royaltyCalculate(
                    auction.highestBid,
                    nft.royaltyPrice
                );
                _amountToBePaid =
                    _amount -
                    _royaltyFee -
                    platformFeeCalculate(_amount);

                // USDTtoken.transferFrom(msg.sender,address(this),_amount);
                USDTtoken.transfer(nft.seller, _amountToBePaid);
                USDTtoken.transfer(nft.firstOwner, _royaltyFee);

                // payable(nft.firstOwner).transfer(_royaltyFee);
                // payable(nft.seller).transfer(_amountToBePaid);
            }
        }
        IERC721(_nftContract).transferFrom(
            address(this),
            auction.highestBidder,
            nft.tokenId
        );

        _nftsSold.increment();
        emit NFTSold(
            _nftContract,
            nft.tokenId,
            nft.seller,
            auction.highestBidder,
            _amountAfterRoyalty
        );
    }

    function royaltyCalculate(
        uint256 _amount,
        uint256 _royaltyPercent
    ) internal pure returns (uint256) {
        return (_amount * _royaltyPercent) / 100;
    }

    function platformFeeCalculate(
        uint256 _amount
    ) internal pure returns (uint256) {
        return (_amount * 6) / 100;
    }

    // function cancelAuction(){

    // }

    function addFans(address[] memory fans) public isUserDeleted {
        for (uint256 i = 0; i < fans.length; i++) {
            address fan = fans[i];
            require(fan != address(0), "Invalid fan address");
            require(!isFan[msg.sender][fan], "Address is already a fan");

            fanLists[msg.sender].push(fan);
            isFan[msg.sender][fan] = true;
        }
    }

    function removeFan(address fan) public {
        require(fan != address(0), "Invalid fan address");
        require(isFan[msg.sender][fan], "Address is not a fan");

        address[] storage fans = fanLists[msg.sender];
        for (uint256 i = 0; i < fans.length; i++) {
            if (fans[i] == fan) {
                fans[i] = fans[fans.length - 1];
                fans.pop();
                break;
            }
        }

        isFan[msg.sender][fan] = false;
    }

    function removeAllFans() public {
        address[] storage fans = fanLists[msg.sender];
        for (uint256 i = 0; i < fans.length; i++) {
            isFan[msg.sender][fans[i]] = false;
        }
        delete fanLists[msg.sender];
    }

    function banUser(address _user) public onlyOwner {
        bannedUsers[_user] = true;
    }

    function approveNfts(
        uint256[] memory _tokenId,
        bool _decision
    ) public onlyOwner returns (bool) {
        uint256 id;
        for (uint256 i = 0; i < _tokenId.length; i++) {
            id = _tokenId[i];
            _idToNFT[id].approve = _decision;
        }
        return true;
    }

    function getNftApprovalStatus(uint256 _tokenId) public view returns (bool) {
        return _idToNFT[_tokenId].approve;
    }

    function unbanUser(address _user) public onlyOwner {
        bannedUsers[_user] = false;
    }

    function deleteUser(address _user) public onlyOwner {
        deletedUsers[_user] = true;
    }

    function checkBannedOrDeletedUser() public view returns (bool) {
        if (bannedUsers[msg.sender] || deletedUsers[msg.sender]) {
            return true;
        } else {
            return false;
        }
    }

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    ////////////    GETTER FUNCTIONS    ///////////
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////

    function getFans() public view isUserDeleted returns (address[] memory) {
        return fanLists[msg.sender];
    }

    function getListedNfts() public view isUserDeleted returns (NFT[] memory) {
        uint256 nftCount = _nftCount.current();
        uint256 unsoldNftsCount = nftCount - _nftsSold.current();

        console.log("nftCount", nftCount);
        console.log("unsoldNftsCount", unsoldNftsCount);

        NFT[] memory nfts = new NFT[](unsoldNftsCount);
        uint nftsIndex = 0;

        console.log("_idToNFT[i]");

        for (uint i = 0; i < nftCount; i++) {
            if (
                _idToNFT[i].listed
                // && _idToAuction[id].approve
            ) {
                nfts[nftsIndex] = _idToNFT[i];
                nftsIndex++;
            }
        }
        return nfts;
    }

    function getMyNfts(
        address _user
    ) public view isUserDeleted returns (NFT[] memory) {
        uint nftCount = _nftCount.current();
        uint myNftCount = 0;
        for (uint i = 0; i < nftCount; i++) {
            if (_idToNFT[i].owner == _user) {
                myNftCount++;
            }
        }

        NFT[] memory nfts = new NFT[](myNftCount);
        uint nftsIndex = 0;
        for (uint i = 0; i < nftCount; i++) {
            if (_idToNFT[i].owner == _user) {
                nfts[nftsIndex] = _idToNFT[i];
                nftsIndex++;
            }
        }
        return nfts;
    }

    function getMyListedNfts(
        address _user
    ) public view isUserDeleted isUserBanned returns (NFT[] memory) {
        uint nftCount = _nftCount.current();
        uint myListedNftCount = 0;
        for (uint i = 0; i < nftCount; i++) {
            if (
                _idToNFT[i].seller == _user && _idToNFT[i].listed
                //  && _idToAuction[id].approve
            ) {
                myListedNftCount++;
            }
        }

        NFT[] memory nfts = new NFT[](myListedNftCount);
        uint nftsIndex = 0;
        for (uint i = 0; i < nftCount; i++) {
            if (
                _idToNFT[i].seller == _user && _idToNFT[i].listed
                //   && _idToAuction[id].approve
            ) {
                nfts[nftsIndex] = _idToNFT[i];
                nftsIndex++;
            }
        }
        return nfts;
    }

    function getStatusOfAuction(uint256 _tokenId) public view returns (bool) {
        if (
            block.timestamp > _idToAuction[_tokenId].startTime &&
            block.timestamp < _idToAuction[_tokenId].endTime
        ) {
            return true;
        } else {
            return false;
        }
    }

    receive() external payable {}

    fallback() external payable {}
}
