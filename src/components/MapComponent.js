import React, { useEffect } from "react";
const MapComponent = () => {
  useEffect(() => {
    window.initMap = function () {
      const coimbatoreCenter = { lat: 11.0168, lng: 76.9558 };

      const map = new window.google.maps.Map(document.getElementById("map"), {
        center: coimbatoreCenter,
        zoom: 13,
      });

      new window.google.maps.Marker({
        position: coimbatoreCenter,
        map: map,
        title: "Coimbatore Center",
      });
    };

    if (!window.google) {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } else {
      window.initMap();
    }
  }, []);

  return <div id="map" style={{ width: "100%", height: "500px", marginTop: "20px" }}></div>;
};

export default MapComponent;