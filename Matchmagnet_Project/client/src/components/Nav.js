import colorLogo from '../images/logo3.0.png'

import justlogo from '../images/logo3.0.png'

const Nav = ({minimal,setShowModal,showModal,setIsSignUp})=>{

  const handleClick=()=> {
      setShowModal(true)
      setIsSignUp(false)
  }

  const authToken = false
  return(
    <nav>
        <div className="logo-container">
          <img className="logo" src={minimal ? colorLogo : justlogo}/>
        </div>

        {!authToken && !minimal && <button className="nav-button" 
        onClick={handleClick}
        disabled={showModal}
        >log in</button>}
    </nav>
  )
}
export default Nav