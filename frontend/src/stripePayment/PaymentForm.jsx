import React, { useContext, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import axios from "axios";
import { MdKeyboardArrowDown } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apis from "../service";
// import { getProviderOrSigner } from "../methods/walletManager";
import MARKETPLACE_CONTRACT_ADDRESS from "../contractsData/ArtiziaMarketplace-address.json";
import MARKETPLACE_CONTRACT_ABI from "../contractsData/ArtiziaMarketplace.json";
import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import Loader from "../components/shared/Loader";
import { Store } from "../Context/Store";
import { useEffect } from "react";

const CARD_OPTIONS = {
  iconStyle: "solid",
  style: {
    base: {
      iconColor: "#929292",
      color: "#929292",
      fontWeight: 500,
      fontFamily: "poppins",
      fontSize: "16px",
      fontSmoothing: "antialiased",
      ":-wevkit-autofill": { color: "fce883" },
      "::placeholder": { color: "#B7bbfd" },
    },
    invalid: {
      iconColor: "red",
      color: "red",
    },
  },
};

const PaymentForm = ({
  planName,
  setShowPaymentForm,
  showResponseMessage,
  index,
  viewSubscriptions
}) => {
  console.log(index, "index");
  const [success, setSuccess] = useState(false);
  const [planeType, setPlaneType] = useState("monthly");
  const [showPlaneType, setShowPlaneType] = useState(false);
  const [paymentMode, setPaymentMode] = useState("recurring");
  const [ShowPaymentMode, setShowPaymentMode] = useState(false);
  const id = JSON.parse(localStorage.getItem("data"));
  const user_id = id?.id;
  const stripe = useStripe();
  const elements = useElements();

  const {account,checkIsWalletConnected}=useContext(Store);

  useEffect(()=>{
    checkIsWalletConnected()
  },[account])

  const handleSubmit = async (e) => {
    setIspayment(true)
    e.preventDefault();

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (!error) {
      try {
        console.log("payment_method_id: " + paymentMethod.id);
        const { id } = paymentMethod.id;
        const response = await apis.userSubscribe({
          user_id: user_id,
          payment_method: paymentMethod.id,
          plan_name: planName,
          plan_type: planeType,
          payment_mode: paymentMode,
        });
       
        if (response.status) {

          toast.success("Plan purchased!", {
            position: toast.POSITION.TOP_RIGHT,
          });
          setIspayment(false)
          setShowPaymentForm(false)
          viewSubscriptions(user_id)

          const response = await apis.postWalletAddress({
            wallet_address: JSON.parse(localStorage.getItem('data')).wallet_address,
            user_id:user_id
          });
          localStorage.removeItem("data");
          localStorage.setItem("data", JSON.stringify(response?.data?.data));
          console.log(JSON.parse(localStorage.getItem('data')), "me here")
          // localStorage.setItem('data', {...data, plan_name, plan_type});
        }
        // {
        //     amout : 1000,
        //     id
        // })
        // if (response.status) {
        //   console.log("Success", response);
        //   console.log("zzzzz ", index);
        //   // toast.success(response?.data?.message, {
        //   //     position: toast.POSITION.TOP_RIGHT,
        //   // });
        //   console.log("QQ One");
        //   await updateUserPlanInSC(index);
        //   console.log("QQ Two");

        //   toast.success("Plan purchased!", {
        //     position: toast.POSITION.TOP_RIGHT,
        //   });

        //   //   setTimeout(() => {
        //   //     window.location.reload();
        //   //   }, 1500);

        //   //   showResponseMessage(response?.data?.message);
        //   setShowPaymentForm(false);
        // } else {
        //   toast.error(response?.data?.message, {
        //     position: toast.POSITION.TOP_RIGHT,
        //   });
        // }
      } catch (error) {
        console.log("Error", error.message);
        setIspayment(false)
        toast.error(error.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } else {
      console.log("Error", error);
      setIspayment(false)
      toast.error(error?.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  };

  const updateUserPlanInSC = async (planId) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()

    const marketplaceContract = new Contract(
      MARKETPLACE_CONTRACT_ADDRESS.address,
      MARKETPLACE_CONTRACT_ABI.abi,
      signer
    );

    let buySubscription = await (
      await marketplaceContract.setUserSubscription(planId)
    ).wait();
    console.log("QQ Four");

    console.log("buySubscription", buySubscription);

    // toast.success("Plan purchased!", {
    //   position: toast.POSITION.TOP_RIGHT,
    // });

    // setTimeout(() => {
    //   window.location.reload();
    // }, 1500);
  };

  const [ispayment, setIspayment] = useState(false)

  return (
    <>
    {ispayment && <Loader />}
      {!success ? (
        <form onSubmit={handleSubmit} className="stripe-payment-form">
          <div className="payment-dd-wrap">
            <div
              className="user-sub-payment"
              onClick={() => setShowPlaneType(!showPlaneType)}
            >
              <p>Plan type</p>
              <div className="title">
                {planeType} <MdKeyboardArrowDown />
              </div>
              {showPlaneType && (
                <div className="options">
                  <h2
                    onClick={() => {
                      setPlaneType("monthly");
                    }}
                  >
                    Monthly
                  </h2>
                  <h2
                    onClick={() => {
                      setPlaneType("annual");
                    }}
                  >
                    Annual
                  </h2>
                </div>
              )}
            </div>
            <div
              className="user-sub-payment"
              onClick={() => setShowPaymentMode(!ShowPaymentMode)}
            >
              <p>Payment Method</p>
              <div className="title">
                {paymentMode}
              </div>
              {/* {ShowPaymentMode && (
                <div className="options">
                  <h2
                    onClick={() => {
                      setPaymentMode("recurring");
                    }}
                  >
                    Recurring
                  </h2>
                  <h2
                    onClick={() => {
                      setPaymentMode("one time");
                    }}
                  >
                    One time
                  </h2>
                </div>
              )} */}
            </div>
          </div>
          <fieldset className="FormGroup">
            <div className="FormRow">
              <CardElement options={CARD_OPTIONS} />
            </div>
          </fieldset>
          <div style={{ textAlign: "center" }}>{
            !ispayment ?
            <button>Pay now</button> : 
            <button disabled>Pay now</button>

          }
          </div>
        </form>
      ) : (
        <div>
          <h2>You just buy an NFT</h2>
        </div>
      )}
      {/* <ToastContainer /> */}
    </>
  );
};

export default PaymentForm;
