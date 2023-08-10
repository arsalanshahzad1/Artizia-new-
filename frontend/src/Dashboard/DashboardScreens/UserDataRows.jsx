import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApis from "../../service/adminIndex";
import apis from "../../service/adminIndex";
import { getProviderOrSigner } from "../../methods/walletManager";
import MARKETPLACE_CONTRACT_ADDRESS from "../../contractsData/ArtiziaMarketplace-address.json";
import MARKETPLACE_CONTRACT_ABI from "../../contractsData/ArtiziaMarketplace.json";
import { BigNumber, Contract, ethers, providers, utils } from "ethers";
import { ToastContainer, toast } from "react-toastify";

function UserDataRows({
  data,
  index,
  listCount,
  handleToggleOpen,
  isOpen,
  setIsOpen,
  viewUserList,
}) {
  console.log(listCount, "reciving data");

  const navigate = useNavigate();
  const NavigateToUser = (id) => {
    navigate(`/dashboard/user-management/${id}`);
  };

  const unbanUser = async (id, wallet_address) => {
    console.log("unbanUser");
    console.log(" wallet_address", wallet_address);
    console.log("id", id);

    await unbanUserFromSC(wallet_address);

    const response = await apis.updateUserStatus(id);
    if (response.status) {
      viewUserList(data?.pagination?.page);
      console.log(response);
    }

    toast.success("Succesfully unblocked!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const unbanUserFromSC = async (user_address) => {
    const signer = await getProviderOrSigner(true);
    console.log("QQ Three");

    const marketplaceContract = new Contract(
      MARKETPLACE_CONTRACT_ADDRESS.address,
      MARKETPLACE_CONTRACT_ABI.abi,
      signer
    );

    let unbanUser = await (
      await marketplaceContract.unbanUser(user_address)
    ).wait();
    console.log("QQ Four");

    console.log("unbanUser", unbanUser);

    // setTimeout(() => {
    //   window.location.reload();
    // }, 1500);
  };

  const banUser = async (id, wallet_address) => {
    console.log("banUser");
    console.log(" wallet_address", wallet_address);
    console.log("id", id);

    await banUserFromSC(wallet_address);

    const response = await apis.updateUserStatus(id);
    if (response.status) {
      viewUserList(data?.pagination?.page);
      console.log(response);
    }

    toast.success("Succesfully blocked!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const banUserFromSC = async (user_address) => {
    const signer = await getProviderOrSigner(true);
    console.log("QQ Three");

    const marketplaceContract = new Contract(
      MARKETPLACE_CONTRACT_ADDRESS.address,
      MARKETPLACE_CONTRACT_ABI.abi,
      signer
    );

    let banUser = await (
      await marketplaceContract.banUser(user_address)
    ).wait();
    console.log("QQ Four");

    console.log("banUser", banUser);

    // setTimeout(() => {
    //   window.location.reload();
    // }, 1500);
  };

  useEffect(() => {}, [isOpen]);

  // <tr onClick={NavigateToUser}>
  return (
    <>
      {data?.data?.map((data, index) => {
        return (
          <>
            <tr>
              <td>{index + listCount + 1}</td>
              <td>
                <p>{data?.wallet_address}</p>{" "}
              </td>
              <td>
                <p>{data?.username == null ? "Null" : data?.username}</p>
              </td>
              <td>{data?.total_nfts}</td>
              <td>
                <p>{data?.email == null ? "Null" : data?.email}</p>
              </td>
              <td>
                <p>{data?.phone_no == null ? "Null" : data?.phone_no}</p>
              </td>
              <td>
                <div onClick={() => handleToggleOpen(data)}>
                  <svg
                    width="25"
                    height="6"
                    viewBox="0 0 25 6"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="3" cy="3" r="3" fill="#B600D1" />
                    <circle cx="13" cy="3" r="3" fill="#B600D1" />
                    <circle cx="22" cy="3" r="3" fill="#B600D1" />
                  </svg>
                </div>
                <div className={`pos-rel`}>
                  {data?.id === isOpen ? (
                    <div className={`user-login-dropdown action-drop-down`}>
                      <ul>
                        <li onClick={() => NavigateToUser(data?.id)}>
                          View Profile
                        </li>
                        {data?.status == 1 ? (
                          <li
                            onClick={() =>
                              banUser(data?.id, data?.wallet_address)
                            }
                          >
                            Block
                          </li>
                        ) : (
                          <li
                            onClick={() =>
                              unbanUser(data?.id, data?.wallet_address)
                            }
                          >
                            Unblock
                          </li>
                        )}
                        {/* <li>Delete</li> */}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </td>
            </tr>
            <hr className="space-between-rows"></hr>
          </>
        );
      })}
    </>
  );
}

export default UserDataRows;
