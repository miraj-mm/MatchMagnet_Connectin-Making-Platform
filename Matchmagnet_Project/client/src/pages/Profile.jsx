import axios from "axios";
import { useEffect, useState } from "react"
import { useCookies } from "react-cookie";
import { hobbies } from "../libs/hobbies";

export default function Profile() {
  const [cookies, setCookie, removeCookie] = useCookies(['user'])
  const [user, setUser] = useState(null);
  const [userHobbies, setUserHobbies] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8000/user?userId=' + cookies.UserId)
      .then((response) => {
        console.log(response)
        setUser(response.data);
        setUserHobbies(Object.fromEntries(hobbies.map(h => [h, response.data.hobbies?.includes(h)])));
      })
      .catch((error) => {
        console.log(error)
      });
  }, [])

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});
  /**
   * @param {import("react").FormEvent} e
   */
  async function save(e) {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const file = data.get('url');
    const dob = new Date(data.get('dob'));
    data.set('dob_day', dob.getDate());
    data.set('dob_month', dob.getMonth() + 1);
    data.set('dob_year', dob.getFullYear());

    if(file.size) data.set('url', await toBase64(file));
    else data.set('url', user.url);

    data.set('user_id', cookies.UserId);
    axios.put('http://localhost:8000/user', {formData: {...Object.fromEntries(data), hobbies: Object.keys(userHobbies).filter(h => userHobbies[h])} })
    .then((response) => {
      console.log(response);
      alert('Saved')
      })
      .catch((error) => {
        console.log(error)
      });
  }
  /**
   * @param {import("react").ChangeEvent} e 
   */
  function addHobby(e) {
    setUserHobbies(h => ({...h, [e.target.value]: e.target.checked}));
  }
  return (
    <div>
      <h1 className="profile-header">Profile</h1>
      {user && (
        <div style={{ padding: '1rem', margin: '0 auto', maxWidth: '500px' }}>
          <form onSubmit={save} style={{ display: 'grid', gap: '16px' }}>
            <img style={{width: '100%'}} src={user.url} alt={user.first_name} />
            <input type="file" name="url" id="url" />
            <p style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid pink' }}>{user.email}</p>
            <input defaultValue={user.first_name} type="text" name="first_name" id="first_name" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid pink' }} />
            <textarea defaultValue={user.about} name="about" id="about" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid pink' }}></textarea>
            <input type="date" name="dob" defaultValue={`${String(user.dob_year).padStart(4, '0')}-${String(user.dob_month).padStart(2, '0')}-${String(user.dob_day).padStart(2, '0')}`} id="dob" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid pink' }} />
            <select name="gender_identity" id="gender_identity" style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid pink' }}>
              <option selected={user.gender_identity == "man"} value="man">Man</option>
              <option selected={user.gender_identity == "woman"} value="woman">Woman</option>
            </select>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', accentColor: 'pink' }}>
              <p>Gender Interest:</p>
              <label>Woman
                <input defaultChecked={user.gender_interest == "woman"} type="radio" name="gender_interest" id="gender_interest" value={"woman"} />
              </label>
              <label>Man
                <input defaultChecked={user.gender_interest == "man"} type="radio" name="gender_interest" id="gender_interest" value={"man"} />
              </label>
              <label>Both
                <input defaultChecked={user.gender_interest == "both"} type="radio" name="gender_interest" id="gender_interest" value={"both"} />
              </label>
            </div>
            <label style={{ display: 'flex', gap: '1rem', alignItems: 'center', accentColor: 'pink' }}>
              Show Gender:
              <input defaultChecked={user.show_gender} type="checkbox" name="show_gender" id="show_gender" />
            </label>
            
            <p>Hobbies:</p>
            <div style={{display: "flex", flexWrap: "wrap", gap: "1rem", padding: "1rem"}}>
              {hobbies.map(hobby => (
                <label key={hobby} style={{backgroundColor: "pink", padding: "0.5rem", borderRadius: "6px"}}>
                  <input defaultChecked={user?.hobbies?.includes(hobby)} onChange={addHobby} type="checkbox" name="hobbies" value={hobby} />
                  {hobby}
                </label>
              ))}
            </div>
            <button style={{ padding: "1rem 0.5rem", backgroundColor: "pink" }}>Save</button>
          </form>
        </div>
      )}
    </div>
  )
}
