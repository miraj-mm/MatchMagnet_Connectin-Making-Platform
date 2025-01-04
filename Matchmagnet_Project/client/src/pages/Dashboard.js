import { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";
import { useCookies } from "react-cookie";
import ChatContainer from "../components/ChatContainer"
import axios from "axios";
const Dashboard = () => {

  const [user, setUser] = useState(null)
  const [genderedUsers, setGenderedUsers] = useState(null)
  const [lastDirection, setLastDirection] = useState();
  const [cookies, setCookie, removeCookie] = useCookies(['user'])

  const userId = cookies.UserId

  const getUser = async () => {
    try {
      const response = await axios.get('http://localhost:8000/user', {
        params: { userId }
      })
      setUser(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getGenderedUsers = async () => {
    try {
      // const response=await axios.get('http://localhost:8000/gendered-users',{
      //   params: {gender:user?.gender_interest}
      // })
      const response = await axios.post('http://localhost:8000/matches', {
        gender_interest: user?.gender_interest,
        hobbies: user?.hobbies || []
      });
      setGenderedUsers(response.data);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    if (user?._id) getGenderedUsers();
  }, [user])
  //console.log(genderedUsers)

  const updateMatches = async (matchedUserId) => {
    try {
      await axios.put('http://localhost:8000/addmatch', {
        userId,
        matchedUserId
      })
      getUser()
    } catch (error) {
      console.log(error)
    }
  }

  //console.log(user)



  const swiped = (direction, swipedUserId) => {

    if (direction === 'right') {
      updateMatches(swipedUserId)
    }
    setLastDirection(direction);
  };

  const outOfFrame = (name) => {
    console.log(name + " left the screen!");
  };

  // const matchedUserIds=user?.matches?.map(({user_id})=>user_id).concat(userId) || [];

  // const filteredGenderUsers=genderedUsers?.filter(
  //   genderedUser=>!matchedUserIds?.includes(genderedUser.user_id)
  // )

  return (
    <>
      {user &&
        <div className="dashboard">
          <ChatContainer user={user} />
          <div className="swipe-container">
            <div className="card-container">
              {
                genderedUsers?.map((genderedUser, i) =>
                  <TinderCard // Change here: Replace TinderCard with div
                    className="swipe"
                    key={`${i} ${genderedUser.first_name}`}
                    onSwipe={(dir) => swiped(dir, genderedUser.user_id)}
                    onCardLeftScreen={() => outOfFrame(genderedUser.first_name)}
                  >
                    <div style={{ backgroundImage: 'url(' + genderedUser.url + ')' }} className="card bg-primary"  >
                      <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', overflow: 'hidden'}}>
                         <h3 style={{backdropFilter: 'blur(20px)', backgroundColor: '#ffffff20'}}>{genderedUser.first_name}</h3> 
                          <h3 style={{backdropFilter: 'blur(20px)', backgroundColor: '#ffffff20'}}>You have {genderedUser.intersectionSize} things in common</h3>
                      </div>
                    </div>
                  </TinderCard>
                )
              }
              <div className="swipe-info">
                {lastDirection ? <p>You swiped {lastDirection}</p> : <p />}
              </div>

            </div>
          </div>
        </div>}
    </>

  );
};

export default Dashboard;
