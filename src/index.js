//us-gun-violence.web.app/gundata.json

import {GoogleMapsOverlay} from "@deck.gl/google-maps"
import {HexagonLayer} from "@deck.gl/aggregation-layers"
import {ScatterplotLayer} from "@deck.gl/layers"
import {HeatmapLayer} from "@deck.gl/aggregation-layers"

const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.zIndex = 1;
tooltip.style.opacity = '0.9'
tooltip.style.pointerEvents = 'none';

function updateTooltip(x, y, heading, subheading, description) {
  tooltip.style.display = 'block';
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  tooltip.innerHTML = `
    <div style="background-color: white; border-radius: 4px; padding: 4px;">
      <h1 style="font-size: 14px;">Incident: ${heading}</h1>
      <div style="font-size: 12px;">${subheading}</div>
      <div style="font-size: 10px; max-width: 100px">${description}</div>
    </div>`
}

window.initMap = () => {
  document.body.append(tooltip);

  // Create menu container
  const menuContainer = document.createElement('div');
  menuContainer.style.position = 'fixed';
  menuContainer.style.bottom = '20px';
  menuContainer.style.left = '50%';
  menuContainer.style.transform = 'translateX(-50%)';
  menuContainer.style.display = 'flex';
  menuContainer.style.gap = '20px';
  menuContainer.style.zIndex = '1000';
  menuContainer.style.flexDirection = 'row';
  menuContainer.style.flexWrap = 'wrap';
  menuContainer.style.justifyContent = 'center';

  // Add media query for smaller screens
  const mediaQuery = window.matchMedia('(max-width: 600px)');
  function handleScreenChange(e) {
    menuContainer.style.flexDirection = e.matches ? 'column' : 'row';
    menuContainer.style.gap = e.matches ? '10px' : '20px';
  }
  mediaQuery.addListener(handleScreenChange);
  handleScreenChange(mediaQuery);

  // Create dataset selection container
  const datasetContainer = document.createElement('div');
  datasetContainer.style.backgroundColor = 'white';
  datasetContainer.style.padding = '10px';
  datasetContainer.style.borderRadius = '4px';
  datasetContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  datasetContainer.style.display = 'flex';
  datasetContainer.style.gap = '20px';
  datasetContainer.style.alignItems = 'center';
  datasetContainer.style.minWidth = '200px';
  datasetContainer.style.justifyContent = 'center';

  const datasetLabel = document.createElement('div');
  datasetLabel.textContent = 'Dataset:';
  datasetLabel.style.fontWeight = 'bold';
  datasetContainer.appendChild(datasetLabel);

  const gunDataRadio = document.createElement('input');
  gunDataRadio.type = 'radio';
  gunDataRadio.id = 'gun-data';
  gunDataRadio.name = 'dataset';
  gunDataRadio.value = 'gun-data';
  gunDataRadio.checked = true;

  const earthquakeDataRadio = document.createElement('input');
  earthquakeDataRadio.type = 'radio';
  earthquakeDataRadio.id = 'earthquake-data';
  earthquakeDataRadio.name = 'dataset';
  earthquakeDataRadio.value = 'earthquake-data';

  const gunDataLabel = document.createElement('label');
  gunDataLabel.htmlFor = 'gun-data';
  gunDataLabel.textContent = 'Gun Violence';

  const earthquakeDataLabel = document.createElement('label');
  earthquakeDataLabel.htmlFor = 'earthquake-data';
  earthquakeDataLabel.textContent = 'Earthquakes';

  datasetContainer.appendChild(gunDataRadio);
  datasetContainer.appendChild(gunDataLabel);
  datasetContainer.appendChild(earthquakeDataRadio);
  datasetContainer.appendChild(earthquakeDataLabel);

  // Create visualization type container
  const vizContainer = document.createElement('div');
  vizContainer.style.backgroundColor = 'white';
  vizContainer.style.padding = '10px';
  vizContainer.style.borderRadius = '4px';
  vizContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  vizContainer.style.display = 'flex';
  vizContainer.style.gap = '20px';
  vizContainer.style.alignItems = 'center';
  vizContainer.style.minWidth = '200px';
  vizContainer.style.justifyContent = 'center';

  const vizLabel = document.createElement('div');
  vizLabel.textContent = 'View:';
  vizLabel.style.fontWeight = 'bold';
  vizContainer.appendChild(vizLabel);

  const scatterplotRadio = document.createElement('input');
  scatterplotRadio.type = 'radio';
  scatterplotRadio.id = 'scatterplot';
  scatterplotRadio.name = 'visualization';
  scatterplotRadio.value = 'scatterplot';
  scatterplotRadio.checked = true;

  const heatmapRadio = document.createElement('input');
  heatmapRadio.type = 'radio';
  heatmapRadio.id = 'heatmap';
  heatmapRadio.name = 'visualization';
  heatmapRadio.value = 'heatmap';

  const scatterplotLabel = document.createElement('label');
  scatterplotLabel.htmlFor = 'scatterplot';
  scatterplotLabel.textContent = 'Scatterplot';

  const heatmapLabel = document.createElement('label');
  heatmapLabel.htmlFor = 'heatmap';
  heatmapLabel.textContent = 'Heatmap';

  vizContainer.appendChild(scatterplotRadio);
  vizContainer.appendChild(scatterplotLabel);
  vizContainer.appendChild(heatmapRadio);
  vizContainer.appendChild(heatmapLabel);

  menuContainer.appendChild(datasetContainer);
  menuContainer.appendChild(vizContainer);
  document.body.appendChild(menuContainer);

  const map = new google.maps.Map(document.getElementById('map'),{
    center: {lat: 40.0, lng: -100.0},
    zoom: 5
  })

  const overlay = new GoogleMapsOverlay({
    layers: []
  })
  overlay.setMap(map)

  // Handle layer switching
  function updateLayer() {
    const dataset = datasetContainer.querySelector('input[name="dataset"]:checked').value;
    const visualization = vizContainer.querySelector('input[name="visualization"]:checked').value;
    
    let layer;
    console.log('dataset',dataset)
    if (dataset === 'gun-data') {
      layer = visualization === 'scatterplot' 
        ? new ScatterplotLayer({
            id: 'scatterplot',
            data: './gundata.json',
            filled: true,
            radiusMaxPixels: 5,
            radiusMinPixels: 2,
            getPosition: d => [d.longitude, d.latitude],
            getFillColor: d => d.n_killed > 0 ? [200, 0 , 40 , 150] : [255, 140, 0, 100],
            pickable: true,
            onHover: (info) => {
              if (info.object) {
                updateTooltip(
                  info.x,
                  info.y,
                  info.object.incident_id || 'Gun Incident',
                  `Killed: ${info.object.n_killed}`,
                  info.object.notes || ''
                )
              } else {
                tooltip.style.display = 'none';
              }
            }
          })
        : new HeatmapLayer({
            id: 'heatmap',
            data: './gundata.json',
            getPosition: d => [d.longitude, d.latitude],
            getWeight: d => d.n_killed,
            radiusPixels: 30,
            intensity: 1,
            threshold: 0.05,
            pickable: true,
            onHover: (info) => {
              if (info.object) {
                updateTooltip(
                  info.x,
                  info.y,
                  info.object.incident_id || 'Gun Incident',
                  `Killed: ${info.object.n_killed}`,
                  info.object.notes || ''
                )
              } else {
                tooltip.style.display = 'none';
              }
            }
          });
    } else {
      console.log('Loading earthquake data...');
      try {
        // First try to fetch the data to verify it exists
        fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson')
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            // Check if data is an array or if it's nested in a property
            const earthquakes = Array.isArray(data) ? data : data.features || [];
            console.log('Number of earthquakes:', earthquakes.length);
            
            // Transform the data to ensure consistent structure
            const transformedData = earthquakes.map(eq => ({
              coordinates: eq.coordinates || eq.geometry?.coordinates || [eq.longitude, eq.latitude],
              magnitude: eq.magnitude || eq.properties?.magnitude || eq.properties?.mag || eq.mag || eq.properties?.properties?.magnitude || 0,
              ...eq
            }));

            // Log only essential information
            console.log('Sample magnitude values:', transformedData.slice(0, 3).map(d => d.magnitude));

            layer = visualization === 'scatterplot'
              ? new ScatterplotLayer({
                  id: 'earthquake-scatterplot',
                  data: transformedData,
                  filled: true,
                  radiusUnits: 'meters',
                  radiusScale: 100000, // 100km
                  getRadius: d => d.magnitude * 1, // Make radius proportional to magnitude
                  getPosition: d => d.coordinates,
                  getFillColor: d => [255, 0, 0, 150],
                  pickable: true,
                  onHover: (info) => {
                    if (info.object) {
                      updateTooltip(
                        info.x,
                        info.y,
                        'Earthquake',
                        `Magnitude: ${info.object.magnitude}`,
                        info.object.notes || ''
                      )
                    } else {
                      tooltip.style.display = 'none';
                    }
                  }
                })
              : new HeatmapLayer({
                  id: 'earthquake-heatmap',
                  data: transformedData,
                  getPosition: d => d.coordinates,
                  getWeight: d => d.magnitude * 0.1 || 0,
                  radiusPixels: 100,
                  intensity: 5,
                  threshold: 0.001,
                  colorRange: [[0, 0, 255, 0], [255, 0, 0, 255]],
                  pickable: true,
                  onHover: (info) => {
                    if (info.object) {
                      updateTooltip(
                        info.x,
                        info.y,
                        'Earthquake',
                        `Magnitude: ${info.object.magnitude}`,
                        info.object.notes || ''
                      )
                    } else {
                      tooltip.style.display = 'none';
                    }
                  }
                });
            
            overlay.setProps({ layers: [layer] });
          })
          .catch(error => {
            console.error('Error loading earthquake data:', error);
          });
      } catch (error) {
        console.error('Error creating earthquake layer:', error);
      }
      return; // Exit early since we're handling the layer update in the fetch callback
    }
    
    overlay.setProps({ layers: [layer] });
  }

  // Initial layer setup
  updateLayer();

  datasetContainer.addEventListener('change', updateLayer);
  vizContainer.addEventListener('change', updateLayer);
}

