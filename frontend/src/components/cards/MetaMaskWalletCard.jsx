import React from "react";
import { useState, useEffect, useRef } from "react";
import Web3Modal from "web3modal";
import { BigNumber, Contract, ethers, providers, utils } from "ethers";

const MetaMaskWalletCard = () => {
  const [walletConnected, setWalletConnected] = useState(false);

  const web3ModalRef = useRef();
  const getProviderOrSigner = async (needSigner = false) => {
    console.log("test1QWER");
    const provider = await web3ModalRef.current.connect();
    console.log("test1qq");

    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    console.log("111111");
    if (chainId !== 31337) {
      console.log("22222");
      window.alert("Change the network to Sepolia");
      throw new Error("Change network to Sepolia");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      // console.log("getSigner");

      return signer;
    }
    // console.log("getProvider");
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "hardhat",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
      // numberOFICOTokens();
    }
  }, [walletConnected]);

  return (
    <div onClick={connectWallet} className="col-lg-3 col-md-6">
      <div className="metamask-waller-card">
        <img src="/assets/images/metamask-wallet.png" alt="" />
        <h2>Metamask</h2>
        <p>
          Start exploring blockchain applications in seconds. Trusted by over 1
          million users worldwide.
        </p>
        <span>Most Popular</span>
      </div>
    </div>
  );
};

export default MetaMaskWalletCard;
