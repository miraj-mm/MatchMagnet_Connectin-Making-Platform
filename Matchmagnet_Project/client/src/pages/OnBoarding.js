import { useState } from "react";
import Nav from "../components/Nav";
import { useCookies } from 'react-cookie'
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { hobbies } from "../libs/hobbies";


const OnBoarding = () => {
  const [cookies, setCookie, removeCookie] = useCookies(['user']);
  const [userHobbies, setUserHobbies] = useState({});
  const [url, setFile] = useState(null);
  const [formData, setFormdata] = useState({
    user_id: cookies.UserId,
    first_name: '',
    dob_day: '',
    dob_month: '',
    dob_year: '',
    show_gender: false,
    gender_identity: 'man',
    gender_interest: 'woman',
    url: '',
    about: '',
    matches: []
  })

  let navigate = useNavigate()

  
  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });


  const handleSubmit = async (e) => {
    console.log("submitted");
    e.preventDefault();
    try {
      const response = await axios.put('http://localhost:8000/user', { formData: {...formData, hobbies: Object.keys(userHobbies).filter(h => userHobbies[h]) } })
      const success = response.status === 200
      if (success) navigate('/dashboard')
    } catch (err) {
      console.log(err)
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    const name = e.target.name

    setFormdata((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }
  /**
   * @param {import("react").ChangeEvent} e 
   */
  function addHobby(e) {
    setUserHobbies(h => ({ ...h, [e.target.value]: e.target.checked }));
  }

  async function uploadImage(e) {
    if(e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await toBase64(file);
      setFormdata(p => ({ ...p, url: base64 }));
    }
  }

  return (
    <>
      <Nav minimal={true} setShowModal={() => { }} showModal={false} />
      <div className="onboarding">
        <h2>CREATE ACCOUNT</h2>

        <form onSubmit={handleSubmit}>
          <section>
            <label htmlFor="first_name">Full Name</label>
            <input
              id="first_name"
              type="text"
              name="first_name"
              placeholder="Full Name"
              required={true}
              value={formData.first_name}
              onChange={handleChange}
            />

            <label>Birthday</label>
            <div className="multiple-input-container">
              <input
                id="dob_day"
                type="number"
                name="dob_day"
                placeholder="DD"
                required={true}
                value={formData.dob_day}
                onChange={handleChange}
              />
              <input
                id="dob_month"
                type="number"
                name="dob_month"
                placeholder="MM"
                required={true}
                value={formData.dob_month}
                onChange={handleChange}
              />
              <input
                id="dob_year"
                type="number"
                name="dob_year"
                placeholder="YYYY"
                required={true}
                value={formData.dob_year}
                onChange={handleChange}
              />
            </div>

            <label>Gender</label>
            <div className="multiple-input-container">
              <input
                id="man-gender-identity"
                type="radio"
                name="gender_identity"
                value="man"
                onChange={handleChange}
                checked={formData.gender_identity === "man"}
              />
              <label htmlFor="man-gender-identity">Man</label>
              <input
                id="woman-gender-identity"
                type="radio"
                name="gender_identity"
                value="woman"
                onChange={handleChange}
                checked={formData.gender_identity === "woman"}
              />
              <label htmlFor="woman-gender-identity">Woman</label>
              <input
                id="more-gender-identity"
                type="radio"
                name="gender_identity"
                value="more"
                onChange={handleChange}
                checked={formData.gender_identity === "more"}
              />
              <label htmlFor="more-gender-identity">More</label>
            </div>

            <label htmlFor="show-gender">Show gender on my profile</label>
            <input
              id="show gender"
              type="checkbox"
              name="show_gender"
              onChange={handleChange}
              checked={formData.show_gender}
            />

            <label>Show Me</label>
            <div className="multiple-input-container">
              <input
                id="man-gender-interest"
                type="radio"
                name="gender_interest"
                value="man"
                onChange={handleChange}
                checked={formData.gender_interest === 'man'}
              />
              <label htmlFor="man-gender-interest">Man</label>
              <input
                id="woman-gender-interest"
                type="radio"
                name="gender_interest"
                value="woman"
                onChange={handleChange}
                checked={formData.gender_interest === 'woman'}
              />
              <label htmlFor="woman-gender-interest">Woman</label>
              <input
                id="everyone-gender-interest"
                type="radio"
                name="gender_interest"
                value="everyone"
                onChange={handleChange}
                checked={formData.gender_interest === 'everyone'}
              />
              <label htmlFor="everyone-gender-interest">Everyone</label>
            </div>

            <label htmlFor="about">About Me</label>
            <input
              id="about"
              type="text"
              name="about"
              required={true}
              placeholder="I like long walks.."
              value={formData.about}
              onChange={handleChange}
            />
            <label htmlFor="about">Profile Profile</label>
            <input type="file" name="url" id="url" onChange={uploadImage} />
            <input type="submit" />
          </section>

          <section>
            <p>Hobbies:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", padding: "1rem" }}>
              {hobbies.map(hobby => (
                <label key={hobby} style={{ backgroundColor: "#fee0e0", padding: "0.5rem", borderRadius: "6px" }}>
                  <input onChange={addHobby} type="checkbox" name="hobbies" value={hobby} />
                  {hobby}
                </label>
              ))}
            </div>
          </section>
        </form>
      </div>
    </>
  );
};
export default OnBoarding;
