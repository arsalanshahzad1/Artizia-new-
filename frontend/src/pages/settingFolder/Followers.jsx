import { useEffect, useState } from "react";
import apis from "../../service";
const Followers = ({ data }) => {
  const [showOptions, setshowOptions] = useState(false);
  const [followers, setFollwers] = useState([]);
  const localStoragedata = JSON.parse(localStorage.getItem("data"));
  const RealUserId = localStoragedata?.id;

  const getFollowersList = async () => {
    const response = await apis.getFollowersList();
    if(response.status){
    setFollwers(response?.data?.data);
    }else{
      setFollwers('');
    }
  };

  const followOther = async (id) => {
    const response = await apis.postFollowAndUnfollow({
      follow_by: RealUserId,
      follow_to: id,
    });
  };

  useEffect(() => {
    getFollowersList()
}, [])
  return (
    <>
      {followers != ''
        ?
        <>
          {followers?.map((data, i) => {
            return (
              <div className="Follow-row" key={i}>
                <div className="left">
                  <div className="img-holder">
                    {data?.profile_image == null ?
                      <img src='/assets/images/user-none.png' alt=""/>
                      :
                      <img src={data?.profile_image} alt="" />
                    }
                  </div>
                  <div className="txt">
                    <p>{data?.username}</p>
                    <p>{data?.count_follower} Followers</p>
                  </div>
                </div>
                <div className="right">
                  <button onClick={() => followOther(data?.user_id)}>Follow</button>

                  <span
                    onClick={() => {
                      setshowOptions(!showOptions);
                    }}
                  >
                    <svg width="10" height="38" viewBox="0 0 10 38" fill="none" xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="5" cy="5" r="5" fill="#B5B5B5" />
                      <circle cx="5" cy="19" r="5" fill="#B5B5B5" />
                      <circle cx="5" cy="33" r="5" fill="#B5B5B5" />
                    </svg>
                  </span>
                  {showOptions && (
                    <div className="options">
                      <div>Report</div>
                      <div>Block</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </>
        :
        <h2>List is empty</h2>
      }
    </>
  );
};

export default Followers;
