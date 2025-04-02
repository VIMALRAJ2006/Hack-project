import { useEffect } from "react";

export default function StoreLocator() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      initMap();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  window.initMap = function () {
    const coimbatoreCenter = { lat: 11.0168, lng: 76.9558 };
    const map = new google.maps.Map(document.getElementById("map"), {
      center: coimbatoreCenter,
      zoom: 13,
    });

    // Example store marker
    new google.maps.Marker({
      position: coimbatoreCenter,
      map: map,
      title: "Coimbatore Store",
    });
  };

  return (
    <div>
      <h2>Find a Store</h2>
      <div id="map" style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
}
