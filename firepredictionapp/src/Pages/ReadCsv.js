import Papa from 'papaparse';

export default function READCSV(filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            return new Promise((resolve, reject) => {
                Papa.parse(data, {
                    header: true,
                    complete: function(results) {
                        const markers = results.data
                            .map((row, index) => ({
                                geocode: [parseFloat(row.latitude), parseFloat(row.longitude)],
                                popUp: row.year
                            }))
                            .filter(marker => 
                                Array.isArray(marker.geocode) && 
                                marker.geocode.length === 2 && 
                                !isNaN(marker.geocode[0]) && 
                                !isNaN(marker.geocode[1])
                            );
                        resolve(markers);
                    },
                    error: function(error) {
                        reject(error);
                    }
                });
            });
        })
        .catch(e => {
            console.log('There was a problem with your fetch operation: ' + e.message);
        });
}

export function READCSVAllRows(filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            return new Promise((resolve, reject) => {
                Papa.parse(data, {
                    header: true,
                    complete: function(results) {
                        resolve(results.data);
                    },
                    error: function(error) {
                        reject(error);
                    }
                });
            });
        })
        .catch(e => {
            console.log('There was a problem with your fetch operation: ' + e.message);
        });
}