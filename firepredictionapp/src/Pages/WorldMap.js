import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, divIcon, point } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

/*
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});


*/


export default function WorldMap() {

    const markers = [{
        geocode: [48.86, 2.3522],
        popUp: "Hello"},
        {geocode: [48.85, 2.3522],
        popUp: "my"},
        {geocode: [48.855, 2.34],
        popUp: "darling"},
    ]

    const customIcon = new Icon(
        {
            //iconUrl: require("./img/marker-icon.png"),
            iconUrl: "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png",

            iconSize: [38, 38],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }
    );

    const createCustomClusterIcon = function (cluster) {
        return divIcon({
            html: `<div class="cluster-icon">${cluster.getChildCount()}</span>`,
            className: "cluster-marker-cluster",
            iconSize: point(33, 33, true)
        });
    }



    return (
        <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100vh", width: "100%" }}
        >
        <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        //url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        
        />
        <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createCustomClusterIcon}
        
        >
        {markers.map(marker => (
            <Marker position={marker.geocode} key={marker.geocode} icon={customIcon}>
                <Popup>{marker.popUp}</Popup>
            </Marker>
        ))
        }
        </MarkerClusterGroup>
        </MapContainer>
    );
}