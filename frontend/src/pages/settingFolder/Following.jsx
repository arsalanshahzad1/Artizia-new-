import React from 'react'
import { useState, useEffect } from "react";
import apis from "../../service";
import { Link, useNavigate } from "react-router-dom";


const Following = ({ data, id }) => {
  const [showOptions, setshowOptions] = useState(false);
  const [following, setFollwing] = useState([]);
  const localStoragedata = JSON.parse(localStorage.getItem("data"));
  const RealUserId = localStoragedata?.id;

  // get user wallet address
  const [userWalletAddress, SetUserWalletAddress] = useState("");
  const navigate = useNavigate();

  const handleUserVisit = async (id)=> {
    const response = await apis.getUserData(id);
    SetUserWalletAddress( response?.data?.data?.id);
  }

  useEffect(()=>{
    if(userWalletAddress !== ""){
        navigate(`/other-profile?add=${userWalletAddress}`)
    }
  },[userWalletAddress])


  const followOther = async (id) => {
    const response = await apis.postFollowAndUnfollow({
      follow_by: RealUserId,
      follow_to: id,
    });
    getFollowingList(id)
    setFollwing([])
  };

  const getFollowingList = async () => {
    const response = await apis.getFollowingList(id);
    if (response.status) {
      console.log(response?.data?.data, " ");
      setFollwing(response?.data?.data);
    }
    else {
      setFollwing([]);
    }
    setLoader(false)
  };


  useEffect(() => {
    getFollowingList(id);
  }, [])

  const [loader, setLoader] = useState(true)

  if(loader){
    return(
      <>
        <section className="sec-loading">
          <div className="one"></div>
        </section>
      </>
    )
  }
  
  return (
    <>
      {following != "" ? (
        <>
          {following?.map((data, i) => {
            return (
              <div className="Follow-row" key={i}>
                <Link to={`/other-profile?add=${data?.user_id}`}>
                <div className="left">
                  <div className="img-holder" onClick={()=> handleUserVisit(data.user_id)}>
                    {data?.profile_image == null ?
                      <img src='/assets/images/user-none.png' alt="" srcset="" />
                      :
                      <img src={data?.profile_image} alt="" />
                    }
                  </div>
                  <div className="txt">
                    <p>{data?.username}</p>
                    <p>{data?.count_follower} Followers</p>
                  </div>
                </div>
                </Link>
                <div className="right">
                  <button
                    className="unfollow"
                    onClick={() => followOther(data?.user_id)}
                  >
                    Unfollow
                  </button>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <>
          <div className="data-not-avaliable">
            <h2>No data avaliable</h2>
          </div>
        </>
      )}
    </>
  );
};

export default Following;
