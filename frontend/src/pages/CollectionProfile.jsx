import React, { useCallback, useEffect, useState } from "react";
import Header from "./landingpage/Header";
import { FiSearch } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import { BsTwitter, BsInstagram } from "react-icons/bs";
import { AiOutlineShareAlt, AiOutlineFlag } from "react-icons/ai";
import BuyNow from "../components/cards/BuyNow";
import NewItemCard from "../components/cards/NewItemCard";
import Footer from "./landingpage/Footer";
import ProfileDrawer from "../components/shared/ProfileDrawer";
import SocialShare from "../components/shared/SocialShare";
import Search from "../components/shared/Search";
import { useLocation, useNavigate } from "react-router-dom";
import apis from "../service";
import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import MARKETPLACE_CONTRACT_ADDRESS from "../contractsData/ArtiziaMarketplace-address.json";
import MARKETPLACE_CONTRACT_ABI from "../contractsData/ArtiziaMarketplace.json";
import NFT_CONTRACT_ADDRESS from "../contractsData/ArtiziaNFT-address.json";
import NFT_CONTRACT_ABI from "../contractsData/ArtiziaNFT.json";
import axios from "axios";
import { connectWallet, getProviderOrSigner } from "../methods/walletManager";
import SimpleCard from "../components/cards/SimpleCard";

const DateDisplay = ({ datetime }) => {
  const parsedDate = new Date(datetime);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
};

function CollectionProfile({ search, setSearch }) {
  const url = "DdzFFzCqrhshMSxb99999999";
  const [tabs, setTabs] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const [collectionTabs, setCollectionTabs] = useState(0);
  const searchParams = new URLSearchParams(location.search);
  const [collectionID, setCollectionID] = useState(searchParams.get("id"));
  const [collectionData, setCollectionData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [nftListFP, setNftListFP] = useState([]);
  const [nftListAuction, setNftListAuction] = useState([]);
  const [discountPrice, setDiscountPrice] = useState(0);

  const userData = JSON.parse(localStorage.getItem("data"));
  const userAddress = userData?.wallet_address;
  const userId = userData?.id;

  const getCollectionNfts = async () => {
    let emptyList = [];
    setNftListAuction(emptyList);
    setNftListFP(emptyList);
    const provider = await getProviderOrSigner();
    console.log("Connected wallet", userAddress);
    console.log("provider", provider);
    console.log("collectionData", collectionData);
    console.log("collectionData.nfts", collectionData.nfts);
    const marketplaceContract = new Contract(
      MARKETPLACE_CONTRACT_ADDRESS.address,
      MARKETPLACE_CONTRACT_ABI.abi,
      provider
    );

    const nftContract = new Contract(
      NFT_CONTRACT_ADDRESS.address,
      NFT_CONTRACT_ABI.abi,
      provider
    );
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    console.log("MYADDRESS", address);
    console.log("collectionData", collectionData);

    let listingType;

    let mintedTokens = collectionData.nfts;

    // let collectionTokens = await marketplaceContract.collection(0, 0);

    // console.log("collectionTokens", collectionTokens);

    // let mintedTokens = [1, 4, 2];
    console.log("mintedTokens", mintedTokens);

    let myNFTs = [];
    let myAuctions = [];
    for (let i = 0; i < mintedTokens.length; i++) {
      let id;
      id = mintedTokens[i];
      // id = mintedTokens[i];
      console.log("id", id);
      console.log("YESS");
      let firstOwner = mintedTokens[i].firstOwner;
      if (firstOwner != "0x0000000000000000000000000000000000000000") {
        const metaData = await nftContract.tokenURI(id);

        const structData = await marketplaceContract._idToNFT(id);

        console.log("structData", structData);

        const fanNftData = await marketplaceContract._idToNFT2(id);

        let discountOnNFT = +fanNftData.fanDiscountPercent.toString();
        let seller = structData.seller;

        setDiscountPrice(discountOnNFT);
        let collectionId = structData.collectionId.toString();

        let auctionData = await marketplaceContract._idToAuction(id);
        const response = await apis.getNFTCollectionImage(collectionId);
        const collectionImages = response?.data?.data?.media?.[0]?.original_url;

        listingType = structData?.listingType;

        const price = ethers.utils.formatEther(structData?.price.toString());

        let highestBid = ethers.utils.formatEther(
          auctionData.highestBid.toString()
        );

        axios
          .get(metaData)
          .then((response) => {
            const meta = response.data;
            let data = JSON.stringify(meta);

            data = data.slice(2, -5);
            data = data.replace(/\\/g, "");
            console.log("Dataa", data);

            data = JSON.parse(data);
            const crypto = data.crypto;
            const title = data.title;
            const image = data.image;
            const royalty = data.royalty;
            const description = data.description;
            const collection = data.collection;

            ///////////////////////////
            ///////////////////////////
            // Collection k sath jo 0 compare ho rha h
            // wo database sey ayega
            ///////////////////////////
            ///////////////////////////
 
            if (listingType === 0) {
              const nftData = {
                id: id, //
                title: title,
                image: image,
                price: price,
                crypto: crypto,
                royalty: royalty,
                description: description,
                collection: collection,
                collectionImages: collectionImages,
                seller: seller,
              };

              console.log("nftData", nftData);

              // myNFTs.push(nftData);
              // setNftListFP(myNFTs);
              setNftListFP((prev) => [...prev, nftData]);
              // console.log("myNFTs in function", myNFTs);
            } else if (listingType === 1) {
              const nftData = {
                id: id, //
                title: title,
                image: image,
                price: price,
                paymentMethod: crypto,
                basePrice: price,
                startTime: auctionData.startTime.toString(),
                endTime: auctionData.endTime.toString(),
                highestBid: highestBid,
                highestBidder: auctionData.highestBidder.toString(),
                // isLive: auctionData.isLive.toString(),
                seller: auctionData.seller.toString(),
              };

              // myAuctions.push(nftData);
              // console.log("auction in function", myAuctions);
              // setNftListAuction(myAuctions);
              setNftListAuction((prev) => [...prev, nftData]);
            }
          })

          .catch((error) => {
            console.error("Error fetching metadata:", error);
          });
      }
    }
  };

  const viewNftCollectionProfile = async (id) => {
    const response = await apis.viewNftCollectionProfile(id);
    if (response.status) {
      console.log("viewNftCollectionProfile", response?.data?.data);
      setCollectionData(response?.nfts);
    } else {
      alert("error");
    }
  };

  useEffect(() => {
    viewNftCollectionProfile(collectionID);
  }, []);
  useEffect(() => {
    getProviderOrSigner();
    getCollectionNfts();
  }, []);


  const onClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  const onOpen = (action) => {
    setIsVisible(action);
  };
  return (
    <>
      <Header search={search} setSearch={setSearch} />
      <div className="profile" style={{ position: "relative" }}>
        <div className="profile-first-section">
          <img
            className="big-image"
            src="/assets/images/other-user-cover.png"
            alt=""
            width={"100%"}
          />
          <div className="user">
            <div className="user-wrap">
              <img
                className="user-pic"
                src={collectionData?.media?.[0]?.original_url}
                alt=""
                width={"90%"}
              />
              <img
                className="big-chack"
                src="/assets/images/big-chack.png"
                alt=""
              />
            </div>
          </div>
          <div className="detail">
            <div className="container-fluid">
              <div className="row">
                <div className="col-lg-4 col-md-4 col-12"></div>
                <div className="col-lg-4 col-md-4 col-6">
                  <h2 className="user-name">{collectionData?.name}</h2>
                </div>
                <div className="col-lg-4 col-md-4 col-6 my-auto">
                  <div className="other-user-icons">
                    <FaFacebookF />
                    <BsTwitter />
                    <BsInstagram />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="user-profile-line-one">
                  <h2>Items {collectionData?.total_items}</h2>
                  <h2>·</h2>
                  <h2>
                    Created{" "}
                    <DateDisplay datetime={collectionData?.created_at} />
                  </h2>
                </div>
              </div>

              <div className="row">
                <div className="user-profile-line-two">
                  <div>
                    <h2>{collectionData?.eth_volume} ETH</h2>
                    <p>Volume</p>
                  </div>
                  <div>
                    <h2>{collectionData?.flow_price} ETH</h2>
                    <p>Flow Price</p>
                  </div>
                  <div>
                    <h2>
                      {collectionData?.coll_status == null ? (
                        <>N/A</>
                      ) : (
                        <>
                          {collectionData?.coll_status > 0 ? (
                            <>+{collectionData?.coll_status}%</>
                          ) : (
                            <>-{collectionData?.coll_status}%</>
                          )}
                        </>
                      )}
                    </h2>
                    <p>Status</p>
                  </div>
                  <div>
                    <h2>{collectionData?.total_owner}</h2>
                    <p>Owner</p>
                  </div>
                </div>
              </div>
              <div className="user-profile-buy-card">
                {/* <div className="row">
                  <BuyNow />
                </div> */}
                <>
                  <div className="row">
                    <div className="Collection-tabs">
                      <div
                        onClick={() => setCollectionTabs(0)}
                        className={`${collectionTabs === 0 && "active-tab"}`}
                      >
                        On Sale
                      </div>
                      <div
                        onClick={() => setCollectionTabs(1)}
                        className={`${collectionTabs === 1 && "active-tab"}`}
                      >
                        Auction
                      </div>
                    </div>
                    {collectionTabs === 0 && (
                      <>
                        {nftListFP.map((item) => (
                          <BuyNow
                            onOpen={onOpen}
                            // onClose={onClose}
                            key={item.id}
                            id={item.id}
                            title={item?.title}
                            image={item?.image}
                            price={item?.price}
                            crypto={item?.crypto}
                            royalty={item?.royalty}
                            description={item?.description}
                            collection={item?.collection}
                            collectionImages={item?.collectionImages}
                            userAddress
                            size={'col-lg-3'}
                          />
                        ))}
                      </>
                    )}
                    {collectionTabs === 1 && (
                      <>
                        {nftListAuction.map((item) => (
                          <NewItemCard
                            key={item.id}
                            id={item.id}
                            title={item?.title}
                            image={item?.image}
                            price={item?.price}
                            highestBid={item?.highestBid}
                            isLive={item?.isLive}
                            endTime={item?.endTime}
                            startTime={item?.startTime}
                            description={item?.description}
                            collectionImages={item?.collectionImages}
                            userAddress={userAddress}
                            size={'col-lg-3'}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </>
              </div>
            </div>
          </div>
        </div>
        {/* <Search search={search} setSearch={setSearch} /> */}

        <Footer />
      </div>
      <ProfileDrawer isVisible={isVisible} onClose={onClose} />
    </>
  );
}

export default CollectionProfile;
