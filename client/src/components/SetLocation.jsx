import { useState } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

function SetLocation() {
  const [loadMap, setLoadMap] = useState(false);
  const center = {
    lat: 25.4123,
    lng: 55.5066,
  };

  const handleButtonClick = () => {
    setLoadMap(true);
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Set Location</button>
      {loadMap && (
        <LoadScript googleMapsApiKey="AIzaSyA2iBgN6KqXEGHlgYXHfgP2_9w6_7XrU2k">
          <GoogleMap
            center={center}
            zoom={15}
            mapContainerStyle={{
              width: "360px",
              height: "360px",
              marginTop: "120px",
            }}
          ></GoogleMap>
        </LoadScript>
      )}
    </div>
  );
}

export default SetLocation;
