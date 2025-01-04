import Home from "./pages/Home"
import Dashboard from "./pages/Dashboard"
import OnBoarding from "./pages/OnBoarding"
import {BrowserRouter,Routes,Route} from "react-router-dom"
import { useCookies, CookiesProvider } from "react-cookie"
import Profile from "./pages/Profile"

const App= ()=> {
  const [cookies,setCookie,removeCookie] = useCookies(['user'])

  return (
    <CookiesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          {cookies.AuthToken && <Route path="/dashboard" element={<Dashboard/>}/>}
          {cookies.AuthToken && <Route path="/onboarding" element={<OnBoarding/>}/>}
          {cookies.AuthToken && <Route path="/profile" element={<Profile/>}/>}
        </Routes>
      </BrowserRouter>
    </CookiesProvider>
  );
}

export default App;
