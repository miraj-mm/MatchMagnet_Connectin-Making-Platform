import { useCookies } from "react-cookie"
import { Link } from "react-router-dom"

const ChatHeader=({user})=>{
  const [cookies,setCookie,removeCookie] = useCookies(['user'])

  const logout = ()=>{
    removeCookie('UserId',cookies.UserId)
    removeCookie('AuthToken',cookies.AuthToken)
    window.location.href= "/"
  }

  return (
    <div className="chat-container-header">
      <div className="profile">
        <div className="img-container">
          <Link to={"/profile"}>
            <img src= {user.url} alt={"photo of " + user.first_name}/>
          </Link>
        </div>
        <h3>{user.first_name}</h3>
      </div>
      <i className="log-out-icon" onClick={logout}>#</i>
    </div>
  )
}

export default ChatHeader