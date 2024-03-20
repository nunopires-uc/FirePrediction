import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, divIcon, point } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import './WorldMapstyles.css'
import { Grid, Paper } from "@mui/material";
import READCSV, {READCSVAllRows} from './ReadCsv';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Checkbox } from '@mui/material';



export default function WorldMap() {
    const [showPanel, setShowPanel] = useState(false);
    const [markers, setMarkers] = useState([]);
    const [markerData, setMarkerData] = useState(null);
    const [selectedMarkerIndex, setSelectedMarkerIndex] = useState(null);
    const [graphData, setGraphData] = useState([]);
    const [selectedEntries, setSelectedEntries] = useState(0);
    const [selectedFields, setSelectedFields] = useState([]);
    const colors = ["#ACC3A6", "#5D6D7E", "#A569BD", "#F1948A", "#45B39D", "#F1C40F", "#E74C3C", "#34495E", "#16A085", "#27AE60"];
    const [panelWidth, setPanelWidth] = useState(4);


    /*const csvFile = fs.readFileSync('./dataset/sample.csv', 'utf8');
    Papa.parse(csvFile, {
        header: true,
        complete: function(results) {
            const selectedColumns = results.data.map(row => ({
                column1: row.column1,
                column2: row.column2,
            }));
    
            console.log(selectedColumns);
        }
    });*/

    useEffect(() => {
        READCSV('/dataset/sample.csv').then(data => {
            setMarkers(data);
        }).catch(error => {
            console.error(error);
        });
    }, []);


    useEffect(() => {
        if (selectedMarkerIndex !== null) {
            const fileNames = ['outputONE.csv', 'outputTWO.csv', 'outputTHREE.csv'];
            const fileName = fileNames[selectedMarkerIndex];
            READCSVAllRows(`/dataset/${fileName}`).then(data => {
                setMarkerData(data[0]);
                setGraphData(data.slice(0, selectedEntries));
            }).catch(error => {
                console.error(error);
            });
        }
    }, [selectedMarkerIndex, selectedEntries]);

    console.log(markers);

    const handleClose = () => {
        setShowPanel(false);
    };

    const MapClickHandler = () => {
        const map = useMapEvents({
            click: () => {
                setShowPanel(false);
            },
        });
    
        return null;
    };

    const handleFieldChange = (field) => {
        setSelectedFields(prevFields => {
            if (prevFields.includes(field)) {
                // If the field is already selected, unselect it
                return prevFields.filter(f => f !== field);
            } else {
                // If the field is not selected, select it
                return [...prevFields, field];
            }
        });
    };
    
    




    /*const markers = [{
        geocode: [48.86, 2.3522],
        popUp: "Hello"},
        {geocode: [48.85, 2.3522],
        popUp: "my"},
        {geocode: [48.855, 2.34],
        popUp: "darling"},
    ]*/

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

    const handleMarkerClick = (index) => {
        console.log(index);
        setSelectedMarkerIndex(index);
        setShowPanel(true);
        const fileNames = ['outputONE.csv', 'outputTWO.csv', 'outputTHREE.csv'];
        const fileName = fileNames[index];
        READCSVAllRows(`/dataset/${fileName}`).then(data => {
            setMarkerData(data[0]);
            setGraphData(data.slice(0, selectedEntries));
            console.log(data);
        }).catch(error => {
            console.error(error);
        });
    }



    return (
        <Grid container style={{ height: '100vh' }}>
            <Grid item xs={showPanel ? 12 - panelWidth : 12}>
                <MapContainer
                    center={[40.1394270001517, -7.50764199998644]}
                    zoom={13}
                    scrollWheelZoom={false}
                    style={{ width: '100%', height: '100%' }}
                    onClick={handleClose}
                >
                    <MapClickHandler />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    <MarkerClusterGroup
                        chunkedLoading
                        iconCreateFunction={createCustomClusterIcon}
                    >
                        {markers.map((marker, index) => (
                            <Marker position={marker.geocode} key={marker.geocode} icon={customIcon} eventHandlers={{ click: () => handleMarkerClick(index) }}>
                                <Popup>{marker.popUp}</Popup>
                            </Marker>
                        ))}
                    </MarkerClusterGroup>
                </MapContainer>
            </Grid>
            {showPanel && (
    <Grid item xs={panelWidth}>
        <button onClick={() => setPanelWidth(prevWidth => prevWidth === 4 ? 8 : 4)}>
            Expand/Collapse Panel
        </button>
        <Paper elevation={3} style={{ height: '100%', overflow: 'auto', backgroundColor: 'white' }}>
        {markerData && (
            <div>
                {/* ... */}
                <form>
                    <label>
                        Number of entries:
                        <input type="number" value={selectedEntries} onChange={e => setSelectedEntries(e.target.value)} />
                    </label>
                    {Object.keys(markerData).map(key => (
                        key !== 'latitude' && key !== 'longitude' && key !== 'altitude' && (
                            <label key={key}>
                                <Checkbox checked={selectedFields.includes(key)} onChange={() => handleFieldChange(key)} />
                                {key}
                            </label>
                        )
                    ))}
                </form>
                <LineChart width={800} height={500} data={graphData}>
                    <XAxis dataKey="hourly.time"/>
                    <YAxis/>
                    <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
                    <Legend />
                    <Tooltip />
                    {selectedFields.map((field, index) => (
                        <Line 
                            type="natural" 
                            dataKey={field} 
                            stroke={colors[index % colors.length]} 
                            name={field} 
                            key={field} 
                        />
                    ))}
                </LineChart>
            </div>
        )}
        </Paper>
    </Grid>
    )}
        </Grid>
    );
}