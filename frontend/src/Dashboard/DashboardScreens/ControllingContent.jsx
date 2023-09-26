import React, { useCallback, useEffect } from "react";
import AdminHeader from "../../pages/landingpage/AdminHeader";
import { useState } from "react";
import UserDataRows from "./UserDataRows";
import ControllingDataRows from "./ContollingDataRows";
import adminApis from "../../service/adminIndex";
import { MdKeyboardArrowDown } from "react-icons/md";
import { BiSearchAlt2 } from "react-icons/bi";
import axios from "axios";

import { BiDotsHorizontalRounded } from "react-icons/bi";
import { BsShareFill } from "react-icons/bs";
import "../DashboardComponents/DashboardCard.css";
import { Link } from "react-router-dom";
import nft from "../../../public/assets/images/nft-big.png";
import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import MARKETPLACE_CONTRACT_ADDRESS from "../../contractsData/ArtiziaMarketplace-address.json";
import MARKETPLACE_CONTRACT_ABI from "../../contractsData/ArtiziaMarketplace.json";
import NFT_CONTRACT_ADDRESS from "../../contractsData/ArtiziaNFT-address.json";
import NFT_CONTRACT_ABI from "../../contractsData/ArtiziaNFT.json";
import {
  connectWallet,
  getProviderOrSigner,
} from "../../methods/walletManager";
import ProfileDrawerAdmin from "../../components/shared/ProfileDrawerAdmin";
import DashboardCard2 from "./DashboardCard2";
import apis from "../../service";

function ControllingContent({ search, setSearch }) {
  const [toggleUserDropdown, setToggleUserDropdown] = useState(true);
  const [listCount, setListCount] = useState(0);
  const [list, setList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filter, setFilter] = useState("Yearly");
  const [showfilter, setShowFilter] = useState(false);
  const [nftList, setNftList] = useState([]);

  const viewNftList = async (count, filter, searchInput) => {
    setListCount(count * 10 - 10);
    const response = await adminApis.viewNftList(count, filter, searchInput);
    if (response?.status) {
      setList(response?.data);
      console.log(response?.data?.data, "error");
      getUsersNfts(response?.data?.data);
    } else {
      console.log("error");
    }
  };

  // useEffect(() => {
  // }, []);

  const onOpen = (action) => {
    setIsVisible(action);
  };

  const getUsersNfts = async (list) => {
    // let emptyList = [];
    // setNftList(emptyList);

    const provider = await getProviderOrSigner();

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

    let listingType;
    console.log("list", list);

    // let mintedTokens = await marketplaceContract.getMyListedNfts(userAddress);
    let mintedTokens = list;

    // let mintedTokens = [1, 4, 2];
    console.log("mintedTokens", mintedTokens);
    let myNFTs = [];

    for (let i = 0; i < mintedTokens.length; i++) {
      let id = mintedTokens[i]?.token_id;
      let is_unapproved = mintedTokens[i]?.is_unapproved;
      // id = +mintedTokens[i].tokenId.toString();

      const structData = await marketplaceContract._idToNFT(id);


      let collectionId = structData.collectionId.toString();

      // console.log("YESS", id);


      const response = await apis.getNFTCollectionImage(collectionId);
      console.log(response, "responses");
      const collectionImages = response?.data?.data?.media?.[0]?.original_url;
      // console.log(response?.data?.data?.media?.[0]?.original_url, "responsess");
      // console.log(collectionImages, "trrrr");

      const metaData = await nftContract.tokenURI(id);


      const fanNftData = await marketplaceContract._idToNFT2(id);

      // let discountOnNFT = +fanNftData.fanDiscountPercent.toString();

      // setDiscountPrice(discountOnNFT);

      let auctionData = await marketplaceContract._idToAuction(id);

      listingType = structData.listingType;

      const price = ethers.utils.formatEther(structData.price.toString());

      axios
        .get(metaData)
        .then((response) => {
          const meta = response.data;
          let data = JSON.stringify(meta);
          console.log(data, 'dasdasd');

          data = data.slice(2, -5);
          data = data.replace(/\\/g, "");

          data = JSON.parse(data);
          const crypto = data.crypto;
          const title = data.title;
          const image = data.image;
          const royalty = data.royalty;
          const description = data.description;
          const collection = data.collection;

          // if (listingType === 0) {
          const nftData = {
            id: id, //
            title: title,
            is_unapproved: is_unapproved,
            image: image,
            price: price,
            crypto: crypto,
            royalty: royalty,
            description: description,
            collection: collection,
            collectionImages: collectionImages,
          };
          // console.log(nftData);
          // myNFTs.push(nftData);
          if (!nftList.some((item) => item.id === nftData.id)) {
            setNftList((prev) => [...prev, nftData]);
            console.log(nftData, 'nftList');
          }

          // } else if (listingType === 1) {
          //   const nftData = {
          //     id: id, //
          //     title: title,
          //     image: image,
          //     price: price,
          //     basePrice: price,
          //     collectionImages: collectionImages,
          //     endTime: auctionData.endTime.toString(),
          //     highestBid: highestBid,
          //     highestBidder: auctionData.highestBidder.toString(),
          //     seller: auctionData.seller.toString(),
          //     startTime: auctionData.startTime.toString(),
          //   };
          //   myAuctions.push(nftData);
          //   setNftList(myAuctions);
          //   console.log(nftListAuction, "nftData");
          // }
        })

        .catch((error) => {
          console.error("Error fetching metadata:", error);
        });
    }
  };

  useEffect(() => {
    if (searchInput == "") {
      setNftList([]);
      viewNftList(1, "yearly", ""); // Fetch all data
    } else if (searchInput.length > 2) {
      setNftList([]);
      viewNftList(1, filter, searchInput); // Fetch search-specific data
    }
  }, [searchInput]);

  const [selectedNTFIds, setSelectedNTFIds] = useState([]);

  const getSelectedId = (id) => {
    console.log(id);
    let nftId;
    if (selectedNTFIds.includes(id)) {
      setSelectedNTFIds(
        selectedNTFIds.filter((selectedId) => selectedId !== id)
      );
      console.log(selectedNTFIds);
    } else {
      setSelectedNTFIds([...selectedNTFIds, id]);
      console.log(selectedNTFIds);
    }
  };

  console.log(selectedNTFIds);

  const [showLinks, setShowLinks] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const userData = JSON.parse(localStorage.getItem("data"));
  const userAddress = userData?.wallet_address;

  const onClose = async () => {
    console.log("called");
    setIsVisible(false);
  };
  let bulkCall = false;

  const approveNFT = async (decision, id) => {
    bulkCall = true;
    console.log("approveNFT", id);
    const signer = await getProviderOrSigner(true);
    const marketplaceContract = new Contract(
      MARKETPLACE_CONTRACT_ADDRESS.address,
      MARKETPLACE_CONTRACT_ABI.abi,
      signer
    );

    let approve = await marketplaceContract.approveNfts(id, decision, {
      gasLimit: ethers.BigNumber.from("500000"),
    });

    console.log("approve", approve);
    await approveEvent(marketplaceContract);
    await handleApprovalEvent();
    await postAPI(decision, id);
  };

  const postAPI = async (decision, id) => {
    let body = {
      token_idz: id,
    };
    console.log("postAPI", body);

    if (decision) {
      const response = await adminApis.approveNfts(body);
      // console.log("response", response);
      deleteItems(id);
      await onClose(false);
    } else {
      const response = await adminApis.rejectNfts(body);
      console.log("response", response);
      deleteItems(id);
      await onClose(false);
    }
  };

  // const deleteItems = (ids) => {
  //   console.log(ids, "ids");
  //   const updatedData = nftList.filter((item) => !ids.includes(item.id));
  //   setNftList(updatedData);
  //   setSelectedNTFIds([]);
  // };

  const deleteItems = (ids) => {
    console.log(ids, "ids");
    const updatedData = nftList.map(item => {
      if (ids.includes(item.id)) {
        return {
          ...item,
          is_unapproved: true // Assuming 'state' is the property to be updated
        };
      }
      return item;
    });
    setNftList(updatedData);
    setSelectedNTFIds([]);
  };

  const approveEvent = async (marketplaceContract) => {
    let response = await marketplaceContract.on(
      "approvalUpdate",
      bulkCall ? handleApprovalEvent : null
    );

    console.log("response", response);
  };

  const handleApprovalEvent = async (decision) => {
    if (bulkCall) {
      console.log("handleApprovalEvent");
      console.log("decision", decision);
      //   removeSelected();
    }
  };

  const [showEditSidebar, setshowEditSidebar] = useState(false);

  const openDrawer = () => {
    setIsVisible(true);
  };

  useEffect(() => { }, []);

  return (
    <div className="user-management">
      <AdminHeader search={search} setSearch={setSearch} />
      <div className="user-management-after-header">
        <div className="dashboard-front-section-2">
          <div className="dashboard-front-section-2-row-1">
            <div className="df-s2-r1-c1">
              <div className="User-management-txt">CONTROLLING THE CONTENT</div>
            </div>
            <div className="controls-for-user-management">
              <div
                className="user-sub-dd"
                onClick={() => setShowFilter(!showfilter)}
              >
                <div className="title">
                  {filter} <MdKeyboardArrowDown />
                </div>
                {showfilter && (
                  <div className="options">
                    <h2
                      onClick={() => {
                        viewNftList(
                          +list?.pagination?.page,
                          "yearly",
                          searchInput
                        );
                        setFilter("yearly");
                      }}
                    >
                      Yearly
                    </h2>
                    <h2
                      onClick={() => {
                        viewNftList(
                          +list?.pagination?.page,
                          "monthly",
                          searchInput
                        );
                        setFilter("monthly");
                      }}
                    >
                      Monthly
                    </h2>
                    <h2
                      onClick={() => {
                        viewNftList(
                          +list?.pagination?.page,
                          "weakly",
                          searchInput
                        );
                        setFilter("weekly");
                      }}
                    >
                      Weekly
                    </h2>
                  </div>
                )}
              </div>
              <div className="user-search">
                <input
                  type="search"
                  placeholder="Search"
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <BiSearchAlt2 />
              </div>
            </div>
          </div>
          {selectedNTFIds?.length > 0 && (
            <div
              className="nft-card-btn-holder"
              style={{ justifyContent: " end", gap: "10px", marginTop: "20px" }}
            >
              <button onClick={() => approveNFT(false, selectedNTFIds)}>
                Unapprove
              </button>
              {/* <button onClick={() => approveNFT(true, selectedNTFIds)}>
                Accept
              </button> */}
            </div>
          )}
        </div>
        <div
          className="table-for-user-management"
          style={{ top: selectedNTFIds.length > 0 ? "160px" : "120px" }}
        >

          {console.log(list, "list data")}
          {list?.data?.length > 0 ? (
            <>
              <div className="row">
                <div className="col-lg-11 mx-auto">
                  <div className="row">
                    {nftList.map((item, index) => (

                      <DashboardCard2
                        onOpen={onOpen}
                        index={index}
                        key={index}
                        id={item?.id}
                        is_unapproved={item?.is_unapproved}
                        title={item?.title}
                        image={item?.image}
                        price={item?.price}
                        crypto={item?.crypto}
                        royalty={item?.royalty}
                        description={item?.description}
                        getSelectedId={getSelectedId}
                        selectedNTFIds={selectedNTFIds}
                        approveNFT={approveNFT}
                        onClose={onClose}
                        isVisible={isVisible}
                        setIsVisible={setIsVisible}
                        openDrawer={openDrawer}
                        // collection={item?.collection}
                        collectionImages={item?.collectionImages}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="user-management-table-contorls"
                style={{ justifyContent: "center" }}
              >
                <button
                  className={`controling-Nft-Load-More ${list?.pagination?.remaining == 0 ? "disable" : ""
                    }`}
                  onClick={() => {
                    viewNftList(
                      +list?.pagination?.page + 1,
                      filter,
                      searchInput
                    );
                    setIsOpen(null);
                  }}
                >
                  Load More
                </button>
              </div>
            </>
          )
            : (
              <div className="empty-messahe">
                <h2>No data avaliable</h2>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default ControllingContent;
