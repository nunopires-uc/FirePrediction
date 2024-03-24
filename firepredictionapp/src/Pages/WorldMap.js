import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, divIcon, point } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import './WorldMapstyles.css'
import { Grid, Paper } from "@mui/material";
import READCSV, {READCSVAllRows} from './ReadCsv';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Box, TextField, FormControlLabel, Checkbox } from '@mui/material';


function distanceTwoPoints(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radius of the Earth in meters
    const phi1 = lat1 * (Math.PI / 180); // converting degrees to radians
    const phi2 = lat2 * (Math.PI / 180);
    const delta_phi = (lat2 - lat1) * (Math.PI / 180);
    const delta_lambda = (lon2 - lon1) * (Math.PI / 180);

    const a = Math.sin(delta_phi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(delta_lambda / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

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
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [clickedMarkerData, setClickedMarkerData] = useState({});

    const [clickedMarkerIndexes, setClickedMarkerIndexes] = useState([]);

    const getNewMarkerFromCSV = async (fileName) => {
        const data = await READCSVAllRows(`/dataset/${fileName}`);
        const newMarker = {
            geocode: [data[1].latitude, data[1].longitude],
            popUp: 'New Marker'
        };
        return newMarker;
    };


    useEffect(() => {
        READCSV('/dataset/sample.csv').then(data => {
            setMarkers(data);
        }).catch(error => {
            console.error(error);
        });
    }, []);

    useEffect(() => {
        if (!showPanel) {
            setClickedMarkerIndexes([]);
        }
    }, [showPanel]);


    useEffect(() => {
        if (selectedMarkerIndex !== null) {
            const fileNames = ['outputONE.csv', 'outputTWO.csv', 'outputTHREE.csv'];
            const fileName = fileNames[selectedMarkerIndex];
            READCSVAllRows(`/dataset/${fileName}`).then(data => {
                setMarkerData(data[0]);
                //setGraphData(data.slice(0, selectedEntries));
                setGraphData(data.slice(Math.max(0, data.length - selectedEntries)));
            }).catch(error => {
                console.error(error);
            });
        }
    }, [selectedMarkerIndex, selectedEntries]);

    //console.log(markers);

    useEffect(() => {
        console.log(clickedMarkerIndexes);
    }, [clickedMarkerIndexes]);
    
    const handleClose = () => {
        setShowPanel(false);
    };

    const MapClickHandler = () => {
        const map = useMapEvents({
            click: () => {
                setShowPanel(false);
                setSelectedMarker(null);
            },
        });
        return null;
    };

    const handleFieldChange = (field) => {
        setSelectedFields(prevFields => {
            if (prevFields.includes(field)) {
                return prevFields.filter(f => f !== field);
            } else {
                return [...prevFields, field];
            }
        });
    };

    const customIcon = new Icon({
            iconUrl: process.env.PUBLIC_URL + '/img/fire-icon.svg',
            iconSize: [38, 38],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }
    );


    const WeatherStationIcon = new Icon({
        iconUrl: process.env.PUBLIC_URL + '/img/station-icon.svg',
        iconSize: [54, 54],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });


    const createCustomClusterIcon = function (cluster) {
        return divIcon({
            html: `<div class="cluster-icon">${cluster.getChildCount()}</span>`,
            className: "cluster-marker-cluster",
            iconSize: point(33, 33, true)
        });
    }

    const handleMarkerClick = async (index) => {
        console.log(index);
        setSelectedMarkerIndex(index);
        setShowPanel(true);
        const fileNames = ['outputONE.csv', 'outputTWO.csv', 'outputTHREE.csv'];
        const fileName = fileNames[index];
        /*READCSVAllRows(`/dataset/${fileName}`).then(data => {
            setMarkerData(data[0]);
            setGraphData(data.slice(0, selectedEntries));
            console.log(data);
        }).catch(error => {
            console.error(error);
        });*/
        const data = await READCSVAllRows(`/dataset/${fileName}`);
        setClickedMarkerData(prevData => ({ ...prevData, [index]: data }));

        setSelectedMarker({ ...markers[index], newMarker: await getNewMarkerFromCSV(fileName) });
        setClickedMarkerIndexes(prevIndexes => [...prevIndexes, index]);
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
                        {markers.map((marker, index) => {
                            if (selectedMarker && marker.geocode[0] === selectedMarker.geocode[0] && marker.geocode[1] === selectedMarker.geocode[1]) {
                                return null;
                            }

                            return (
                                <Marker position={marker.geocode} key={marker.geocode} icon={customIcon} eventHandlers={{ click: () => handleMarkerClick(index) }}>
                                    <Popup>{marker.popUp}</Popup>
                                </Marker>
                            );
                        })}
                        {selectedMarker && (
                            <>
                                <Marker position={selectedMarker.geocode} key={selectedMarker.geocode} icon={customIcon}>
                                    <Popup>{selectedMarker.popUp}</Popup>
                                </Marker>
                                <Marker position={selectedMarker.newMarker.geocode} key={selectedMarker.newMarker.geocode} icon={WeatherStationIcon}>
                                <Tooltip permanent>
                                    {selectedMarker.newMarker.popUp}
                                    <br />
                                    Distance: {distanceTwoPoints(selectedMarker.geocode[0], selectedMarker.geocode[1], selectedMarker.newMarker.geocode[0], selectedMarker.newMarker.geocode[1])} meters
                                </Tooltip>
                                </Marker>
                                <Polyline positions={[selectedMarker.geocode, selectedMarker.newMarker.geocode]} color="red" />
                            </>
                        )}
                    </MarkerClusterGroup>
                </MapContainer>
            </Grid>
            {showPanel && (
    <Grid item xs={panelWidth}>
        
        <Paper elevation={3} style={{ height: '100%', overflow: 'auto', backgroundColor: 'white' }}>
        {markerData && (
            <div>

                <button onClick={() => setPanelWidth(prevWidth => prevWidth === 4 ? 8 : 4)}>
                        Expand/Collapse Panel
                </button>
                <Box component="form" sx={{ m: 1 }}>
    <TextField
        label="Distance"
        value={selectedMarker ? distanceTwoPoints(
            selectedMarker.geocode[0], 
            selectedMarker.geocode[1], 
            selectedMarker.newMarker.geocode[0], 
            selectedMarker.newMarker.geocode[1]
        ) : ''}
        InputProps={{
            readOnly: true,
        }}
    />
    <TextField
        label="Number of entries"
        type="number"
        value={selectedEntries}
        onChange={e => setSelectedEntries(e.target.value)}
    />
    {Object.keys(markerData).map(key => (
        key !== 'latitude' && key !== 'longitude' && key !== 'altitude' && key !== 'time' && (
            <FormControlLabel
                key={key}
                control={
                    <Checkbox
                        checked={selectedFields.includes(key)}
                        onChange={() => handleFieldChange(key)}
                    />
                }
                label={key}
            />
        )
    ))}
</Box>
                
                
                {clickedMarkerIndexes.map(index => (
                    <LineChart width={800} height={500} data={clickedMarkerData[index].slice(Math.max(0, clickedMarkerData[index].length - selectedEntries))}>
                    <XAxis dataKey="time"/>
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
                ))}
            </div>
        )}
        </Paper>
    </Grid>
    )}
        </Grid>
    );
}