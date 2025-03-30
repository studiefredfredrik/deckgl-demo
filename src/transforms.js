export const AVAILABLE_DATASETS = [
  {
    id: 'gun-violence',
    name: 'Gun Violence Incidents',
    url: './gundata.json'
  },
  {
    id: 'earthquakes',
    name: 'Recent Earthquakes',
    url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
  }
];

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 150];
}

function transformGunViolenceData(data) {
  if (!Array.isArray(data)) {
    console.error('Gun violence data is not an array');
    return [];
  }
  return data.map(incident => ({
    heading: `Gun Incident ${incident.incident_id || 'Unknown'}`,
    subHeading: `Killed: ${incident.n_killed}`,
    notes: incident.notes || 'No additional information available',
    latitude: incident.latitude,
    longitude: incident.longitude,
    magnitude: incident.n_killed,
    radius: 1,
    color: incident.n_killed > 0 ? hexToRGB('#C80028') : hexToRGB('#FF8C00')
  }));
}

function transformEarthquakeData(data) {
  const earthquakes = Array.isArray(data) ? data : data.features || [];
  if (!earthquakes.length) {
    console.error('No earthquake data found');
    return [];
  }
  return earthquakes.map(eq => ({
    heading: `Earthquake in ${eq.properties?.place || 'Unknown Location'}`,
    subHeading: `Magnitude ${eq.properties?.mag || eq.magnitude || 0}`,
    notes: `Time: ${new Date(eq.properties?.time || eq.time).toLocaleString()}`,
    latitude: eq.coordinates?.[1] || eq.geometry?.coordinates?.[1] || eq.latitude,
    longitude: eq.coordinates?.[0] || eq.geometry?.coordinates?.[0] || eq.longitude,
    magnitude: eq.properties?.mag || eq.magnitude || 0,
    radius: (eq.properties?.mag || eq.magnitude || 0) * 30,
    color: [255, 0, 0, 150] // Default red color
  }));
}

export async function transformInputDataForDisplay(datasetUrl) {
  try {
    const response = await fetch(datasetUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Determine which transform to use based on the URL
    if (datasetUrl.includes('gundata.json')) {
      return transformGunViolenceData(data);
    } else if (datasetUrl.includes('earthquakes/feed')) {
      return transformEarthquakeData(data);
    } else {
      throw new Error('Unknown dataset format');
    }
  } catch (error) {
    console.error('Error transforming data:', error);
    return [];
  }
} 

/*

The display function requires the following format:

[
  {
  "heading": "Earthquake in alaska",
  "subHeading": "Magnitude 1.5",
	"notes": "There was a earthquake on september 4'th and it was rather small, and didn't do much damage"
  "latitude": 40.888,
  "longitude": -73.5899,
	"magnitude": 1.5, // use this for how large the area of the dots on the scatter plot is
  "color": null, // paint it red if null 
 },
 {
  "heading": "Earthquake in Maine",
  "subHeading": "Magnitude 1.0",
	"notes": "There was a earthquake on september 5'th and it was small, no damage"
  "latitude": 39.888,
  "longitude": -74.5899,
	"magnitude": 1.0, 
  "color": "#FFFFFF", 
 },
]

*/