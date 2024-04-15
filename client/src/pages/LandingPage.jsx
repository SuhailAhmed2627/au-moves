import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Login.css";

function LandingPage() {
  const navigate = useNavigate();

  const driverSubmit = async (e) => {
    e.preventDefault();

    navigate("/driverLogin");
  };
  const studentSubmit = async (e) => {
    e.preventDefault();

    navigate("/login");
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
              <center>
                <h3>Choose to Sign-in:</h3> <p></p>
                <button
                  onClick={driverSubmit}
                  className="btn btn-primary btn-block"
                >
                  I am a Driver
                </button>{" "}
                <p></p>
                <button
                  onClick={studentSubmit}
                  className="btn btn-primary btn-block"
                >
                  I am a Student
                </button>
              </center>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default LandingPage;
