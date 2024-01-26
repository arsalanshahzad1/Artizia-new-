import React, { useRef, useCallback, useState, useEffect, useContext } from "react";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { BsShareFill } from "react-icons/bs";
import "./Cards.css";
import { Link } from "react-router-dom";
import {
  FacebookShareButton,
  InstapaperShareButton,
  TwitterShareButton,
  LinkedinShareButton,
} from "react-share";
import ProfileDrawer from "../shared/ProfileDrawer";
import FiatStripeContainer from "../../stripePayment/FiatStripeContainer";
import { AiOutlineClose } from "react-icons/ai";
import Modal from "react-bootstrap/Modal";
import MARKETPLACE_CONTRACT_ADDRESS from "../../contractsData/ArtiziaMarketplace-address.json";
import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import apis from "../../service";
import { Store } from "../../Context/Store";
import HeaderConnectPopup from "../../pages/Headers/HeaderConnectPopup";
import { toast } from "react-toastify";

const BuyNow = ({
  setLoader,
  path,
  nftId,
  title,
  image,
  price,
  description,
  collection,
  collectionImages,
  seller,
  owner,
  firstOwner,
  user_id,
  size
}) => {
  const [showLinks, setShowLinks] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [connectPopup, setConnectPopup] = useState(false);
  const [showFiatPaymentForm, setShowFiatPaymentForm] = useState(false);
  const [platformFeeETH, setPlatformFeeETH] = useState(0);
  const [sucess, setSucess] = useState(false);
  const [platformFeeUSDT, setPlatformFeeUSDT] = useState(0);
  const [priceInUSDT, setPriceIntoUSD] = useState("");
  const [sellerPlan, setSellerPlan] = useState(0);
  const [buyerPlan, setBuyerPlan] = useState(0);
  const [nftDetails, setNftDetails] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");
  const [ethForFiat, setEthForFiat] = useState("");

  const userData = JSON.parse(localStorage.getItem("data"));
  const userAddress = userData?.wallet_address;
  const getBuyerPlan = userData?.subscription_plan;


  const { account, checkIsWalletConnected, getProviderMarketContrat, getProviderNFTContrat, getSignerMarketContrat, getSignerNFTContrat, getSignerUSDTContrat,buyWithFiatPayment} = useContext(Store);

  const userWalletAddress = localStorage.getItem("userAddress")

  useEffect(() => {
    checkIsWalletConnected()
  }, [account])


  const buyerFeeCalculate = (_amount, _buyerPercent) => {
    return (_amount * _buyerPercent) / 10000;
  };


  const getPriceInUSDAndDetials = async () => {

    let _buyerPercent;

    if (getBuyerPlan == 3) {
      _buyerPercent = 0;
    } else if (getBuyerPlan == 2) {
      _buyerPercent = 100;
    } else {
      _buyerPercent = 150;
    }
    setBuyerPlan(getBuyerPlan);
    let feeETH = buyerFeeCalculate(price?.toString(), _buyerPercent);

    setPlatformFeeETH(feeETH);

    let EthIntoUSDT = (+feeETH + +price?.toString())
    
    console.log("intoUSDT2")
    let intoUSDT = await getProviderMarketContrat()?.getETHOutUSDTInOutPut(EthIntoUSDT?.toString());
    console.log(intoUSDT,"intoUSDT")
    setEthForFiat(EthIntoUSDT);
    setPriceIntoUSD(intoUSDT?.toString());
    setFiatAmount(intoUSDT?.toString() / 10**6);

  };

  const getNFTDetailByNFTTokenId = async () => {
    try {
      const response = await apis.getNFTByTokenId(nftId);
      setNftDetails(response?.data?.data);
      setSellerPlan(response?.data?.data?.subscription_plan);
    } catch (e) {
      console.error("Error: ", e);
    }
  };


  const onClose = () => {
    setIsVisible(false);
  };

  const openDrawer = () => {
    if (showLinks === true) {
      setShowLinks(false);
    } else {
      setIsVisible(true);
    }
  };

  const [nftImg, setNftImg] = useState("");


  useEffect(() => {
    if (
      typeof image === "string" &&
      image.startsWith("https://ipfs.io/ipfs/")
    ) {
      // Fetch the blob URL and convert it to a File object
      fetch(image)
        .then((response) => response.blob())
        .then((blob) => {
          const convertedFile = new File([blob], "convertedImage.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          setNftImg(URL.createObjectURL(convertedFile));
        })
        .catch((error) => {
          console.error("Error fetching or converting the blob:", error);
          setNftImg(null);
        });
    } else {
      setNftImg(image);
    }
  }, [image]);

  const showResponseMessage = (message) => {
    setShowFiatPaymentForm(false);
    toast.success(message, {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  /////////////////////////////////////////////
  /////////////////////////////////////////////
  ////////////// Buy With ETH /////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////


  let ethPurchase = false;
  const buyWithETH = async () => {
    setLoader(true);
    try {
      ethPurchase = true;
      let totalPrice = +price?.toString() + +platformFeeETH;

      await (
        await getSignerMarketContrat()?.buyWithETH(
          getSignerNFTContrat()?.address,
          nftId,
          sellerPlan, // must be multiple of 10 of the users percent //TODO: change here
          buyerPlan, // must be multiple of 10 of the users percent //TODO: change here
          nftDetails?.user_id, //selllerId
          userData?.id, //buyerId
          {
            value: totalPrice?.toString()
          }
        )
      ).wait();
      let response = await getSignerMarketContrat().on("NFTSold",
      ethPurchase ? handleNFTSoldEvent : null
      );
      setTimeout(()=>{
        setLoader(false);
      },[10000])
      onClose(false);
      window.location.reload()
    } catch (error) {
      setLoader(false);
      toast.error(error?.data?.message)
    }

  };

  //BUYWITHUSDT
  let usdtPurchase = false;
  const buyWithUSDT = async () => {
    setLoader(true);
    try {
      usdtPurchase = true;
      let accBalance = await getSignerUSDTContrat().balanceOf(userAddress)
      if (+priceInUSDT > +accBalance?.toString()) {
        return toast.error("You dont have balance"),setLoader(false);
      }

      let usdtToEth = await getSignerMarketContrat().getUSDTIntoETH(priceInUSDT);

      const appprove = await getSignerUSDTContrat().approve(
        MARKETPLACE_CONTRACT_ADDRESS.address,
        priceInUSDT?.toString()
      );
  
      appprove.wait();
     
      await (
        await getSignerMarketContrat()?.buyWithUSDT(
          getSignerNFTContrat()?.address,
          nftId,
          priceInUSDT?.toString(),
          sellerPlan, 
          buyerPlan,
          nftDetails?.id,
          userData?.id?.id, 
          { gasLimit: ethers.BigNumber.from("5000000") }
          )).wait();
  
      let response = getSignerMarketContrat().on(
        "NFTSold",
        usdtPurchase ? handleNFTSoldEvent : null
      );
      setTimeout(()=>{
        setLoader(false);
      },[10000])
      onClose(false);
      window.location.reload()
      setLoader(false);
    } catch (error) {
      setLoader(false);
      toast.error(error?.data?.message)
    }
  };

  const handleNFTSoldEvent = async (
    nftContract,
    tokenId,
    price,
    seller,
    buyer,
  ) => {

    let soldData = {
      nftContract: +nftContract?.toString(),
      token_id: +tokenId?.toString(),
      price: price?.toString(),
      seller: seller?.toString(),
      buyer: buyer?.toString(),
    };

    if (ethPurchase || usdtPurchase) {
      nftSoldPost(soldData);
      ethPurchase = false;
      usdtPurchase = false;
    }
  };

  const nftSoldPost = async (value) => {
    try {
      const response= await apis.postNftSold(value);
      setLoader(false);
      setSucess(false);
      window.location.reload();
      onClose(false);
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      setLoader(false);
      setSucess(false);
      window.location.reload();
      onClose(false);
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
      
    }

  };

  const buyWithFiat = async ( )=>{
    toast.error("someThingWrong");
  }
  
  const cancelList = async ()=> {
    setLoader(true);
    try {
      let cancel = await getSignerMarketContrat()?.cancelListing(getSignerNFTContrat()?.address,nftId,nftDetails?.user_id);
      cancel.wait();
      setTimeout(()=>{
        setLoader(false);
      },[10000])
    window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getPriceInUSDAndDetials();
    getNFTDetailByNFTTokenId();
  }, [account, price,fiatAmount])



  console.log(owner?.toUpperCase() , MARKETPLACE_CONTRACT_ADDRESS?.address?.toUpperCase(),"checking")

  return (
    <>

      <div className={`${size} col-md-4`}>
        <Link to={path}>
          <div className="css-vurnku" style={{ position: "relative" }}>
            <a className="css-118gt74" >
              <div className="css-15eyh94">
                <div className="css-2r2ti0" onClick={() => openDrawer()}>
                  <div className="css-15xcape">
                    <span
                      className="lazy-load-image-custom-wrapper lazy-load-image-background  lazy-load-image-loaded"
                      style={{
                        display: "flex",
                        width: "100% ",
                        height: "100%",
                        borderRadius: "8px 8px 0px 0px",
                      }}
                    >
                      <img src={nftImg} className="J-image" />
                      {showLinks && (
                        <div className="social-links">
                          <ul>
                            <li>
                              <a>
                                <LinkedinShareButton
                                  url={`https://${window.location.host}/other-profile?add=${user_id}`}
                                  title="Artizia"
                                >
                                  <p>Linkedin</p>
                                </LinkedinShareButton>
                              </a>
                            </li>
                            <li>
                              <a>
                                <TwitterShareButton
                                  url={`https://${window.location.host}/other-profile?add=${user_id}`}
                                  title="Artizia"
                                >
                                  <p>Twitter</p>
                                </TwitterShareButton>
                              </a>
                            </li>
                            <li>
                              <a>
                                <FacebookShareButton
                                  url={`https://${window.location.host}/other-profile?add=${user_id}`}
                                  title="Artizia"
                                >
                                  <p>Facebook</p>
                                </FacebookShareButton>
                              </a>
                            </li>
                          </ul>
                        </div>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div
                className="J-bottom css-1xg74gr"
                style={{ position: "relative" }}
              >
           
                <div className="css-fwx73e">
                  <div className="css-10nf7hq detail-wrap" onClick={() => openDrawer()}>
                    <div className="center-icon">
                      <div className="icon">
                    
                        {collectionImages == null ?
                          <img src='/assets/images/user-none.png' alt="" />
                          :
                          <img src={collectionImages} alt="" />
                        }
                        <img src="/assets/images/chack.png" alt="" />
                      </div>
                    </div>
                    <div className="top">
                      <div className="left">{title}</div>
                      <div className="right">{nftId}</div>
                    </div>
                    <div className="bottom">
                      <div className="left">Price</div>
                      <div className="right">
                        <img src="/assets/images/bitCoin.png" alt="" />
                        {Number(ethers.utils.formatEther(price?.toString()))?.toFixed(5)}
                      </div>
                    </div>
                    <div className="css-x2gp5l"></div>
                  </div>
                </div>
                <div className="J-buynow css-1elubna">
                  {owner?.toUpperCase() === MARKETPLACE_CONTRACT_ADDRESS?.address?.toUpperCase() &&(
                    account?.toUpperCase() !== seller?.toUpperCase() ? (
                    <div className="button css-pxd23z" onClick={() => {
                      if (userWalletAddress === "false") {
                        setConnectPopup(true)
                      }
                      else {
                        setSucess(true);
                      }
                    }} >
                      <p>Buy Now</p>
                      <span>
                        <img src="/assets/icons/shop.png" alt="" />
                      </span>
                    </div>
                  )
                    : (
                      <div className="button css-pxd23z" onClick={()=>cancelList()}>
                        <p>Cancel Listing</p>
                      </div>
                    )
                  )
                  }
                </div>
              </div>
            </a>
            <span
              className="btc-gray-logo"
              onClick={() => {
                setShowLinks(!showLinks);
              }}
            >
              <span>
                <BsShareFill />
              </span>
            </span>
          </div>
        </Link>
      </div>

      <ProfileDrawer
        setLoader={setLoader}
        isVisible={isVisible}
        onClose={onClose}
        nftId={nftId}
        title={title}
        image={image}
        price={price}
        description={description}
        collection={collection}
        collectionImages={collectionImages}
        setIsVisible={setIsVisible}
        seller={seller}
        owner={owner}
        firstOwner={firstOwner}
        user_id={user_id}
      /> 

      <Modal
        show={sucess}
        onHide={() => setSucess(false)}
        centered
        size="lg"
        className="succes-modal-wrap"
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-body" style={{ position: "relative" }}>
          <span onClick={() => setSucess(false)}>
            <AiOutlineClose />
          </span>
          <div className="mobal-button-1">
            <button onClick={()=>buyWithETH()}>Buy with ETH</button>
            <button onClick={()=>buyWithUSDT()}>Buy with USDT</button>
          </div>
        </div>
      </Modal>

       <Modal
        show={showFiatPaymentForm}
        onHide={() => setShowFiatPaymentForm(false)}
        centered
        size="lg"
        className="payment-modal-wrap"
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-body">
          <div className="payment-close">
            <AiOutlineClose onClick={() => setShowFiatPaymentForm(false)} />
          </div>
          <div className="sucess-data">
            <p className="card-title">PAY WITH STRIPE</p>
            <div>
              <p>Nft Title: {title}</p>
            </div>
            <div>
              <p>Nft Price: ${fiatAmount}</p>
            </div>
            <FiatStripeContainer
            setLoader={setLoader}
            nftId={nftId}
              amount={fiatAmount}
              setShowPaymentForm={setShowFiatPaymentForm}
              showResponseMessage={showResponseMessage}
              setSucess={setSucess}
              setIsVisible={setIsVisible}
              _nftContract={getProviderNFTContrat().address}
              _tokenId={nftId}
              _sellerPlan={sellerPlan}
              _buyerAddress={account}
              _buyerPlan={buyerPlan}
              sellerId={nftDetails?.user_id}
              buyerId={userData?.id} 
              ethAmount={ethForFiat}
            />
          </div>
        </div>
      </Modal>

      {/* <HeaderConnectPopup connectPopup={connectPopup} setConnectPopup={setConnectPopup} /> */}
    </>
  );
};

export default BuyNow;
