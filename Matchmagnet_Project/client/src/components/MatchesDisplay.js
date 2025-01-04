import axios from "axios"
import { useEffect, useState } from "react"


const MatchesDisplay=({matches,setClickedUser})=>{
  const [matchedProfiles,setMatchedProfiles]=useState(null)

  console.log("Matches", matches)
  const getmatches=async()=>{
    try{
      if(!matches) return;
      const response=await axios.get('http://localhost:8000/users',{
        params:{userIds:JSON.stringify( matches )}
      })
      setMatchedProfiles(response.data)
    }catch(error){
      console.log(error)
    }
  }

  useEffect(()=>{
    getmatches()
  },[matches])

  return (
    <div className="matches-display">
      {matchedProfiles?.map((match,_index)=>(
        <div key={_index + "match display"} className="match-card" onClick={()=>setClickedUser(match)}>
          <div className="img-container">
            <img src={match?.url} alt={match?.first_name+'profile'}/>
          </div>
          <h3>{match?.first_name}</h3>
        </div>
    ))}
      
    </div>
  )
}

export default MatchesDisplay