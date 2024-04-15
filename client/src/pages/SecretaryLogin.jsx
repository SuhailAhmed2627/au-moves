import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";
import { useNavigate } from "react-router-dom";

function SecretaryLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post("http://localhost:3000/secretary/login", {
        username,
        password,
      });
      const token = result.data.token;
      if (!token) {
        alert("Username or password is incorrect");
        return;
      }
      localStorage.setItem("token", token);
      navigate("/SecretaryHome");
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="container m-0 p-0">
      <div className="login-wrp">
        <div className="top">
          <div className="logo">
            <img src="src/assets/am-logo.png" alt="" width="200px" />
          </div>
        </div>
        <div className="bottom">
          <form className="login-form">
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Your Employee ID"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Enter Your Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="checkbox-inline">
                <input type="checkbox" value="" /> Keep me signed in
              </label>
            </div>
            <button
              onClick={handleSubmit}
              className="btn btn-primary btn-block"
            >
              Login
            </button>
            <center>
              <p>
                Not a secretary? <a href="/">Go Back</a>
              </p>
            </center>
          </form>
        </div>
      </div>
    </div>
  );
}
export default SecretaryLogin;
