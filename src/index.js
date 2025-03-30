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

function updateTooltip({x, y, object}) {
  if (object) {
    tooltip.style.display = 'block';
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.innerHTML = `
      <div style="background-color: white; border-radius: 4px; padding: 4px;">
        <h1 style="font-size: 14px;">Incident: ${object.incident_id || 'Earthquake'}</h1>
        <div style="font-size: 12px;">${object.n_killed ? `Killed: ${object.n_killed}` : `Magnitude: ${object.magnitude}`}</div>
        <div style="font-size: 10px; max-width: 100px">${object.notes || ''}</div>
      </div>`
  } else {
    tooltip.style.display = 'none';
  }
}

window.initMap = () => {
  document.body.append(tooltip);

  // Create menu container
  const menuContainer = document.createElement('div');
  menuContainer.style.position = 'fixed';
  menuContainer.style.bottom = '20px';
  menuContainer.style.left = '50%';
  menuContainer.style.transform = 'translateX(-50%)';
  menuContainer.style.backgroundColor = 'white';
  menuContainer.style.padding = '10px';
  menuContainer.style.borderRadius = '4px';
  menuContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  menuContainer.style.zIndex = '1000';

  // Create controls container
  const controlsContainer = document.createElement('div');
  controlsContainer.style.display = 'flex';
  controlsContainer.style.flexDirection = 'column';
  controlsContainer.style.gap = '10px';

  // Create dataset selection container
  const datasetContainer = document.createElement('div');
  datasetContainer.style.display = 'flex';
  datasetContainer.style.gap = '20px';

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
  gunDataLabel.textContent = 'Gun Violence Data';

  const earthquakeDataLabel = document.createElement('label');
  earthquakeDataLabel.htmlFor = 'earthquake-data';
  earthquakeDataLabel.textContent = 'Earthquake Data';

  datasetContainer.appendChild(gunDataRadio);
  datasetContainer.appendChild(gunDataLabel);
  datasetContainer.appendChild(earthquakeDataRadio);
  datasetContainer.appendChild(earthquakeDataLabel);

  // Create visualization type container
  const vizContainer = document.createElement('div');
  vizContainer.style.display = 'flex';
  vizContainer.style.gap = '20px';

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

  controlsContainer.appendChild(datasetContainer);
  controlsContainer.appendChild(vizContainer);
  menuContainer.appendChild(controlsContainer);
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
              updateTooltip(info)
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
              updateTooltip(info)
            }
          });
    } else {
      console.log('Loading earthquake data...');
      try {
        // First try to fetch the data to verify it exists
        fetch('./earthquakes_past_hour.json')
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(data => {
            console.log('Earthquake data structure:', data);
            // Check if data is an array or if it's nested in a property
            const earthquakes = Array.isArray(data) ? data : data.features || [];
            console.log('Number of earthquakes:', earthquakes.length);
            console.log('Sample earthquake:', earthquakes[0]);
            
            // Transform the data to ensure consistent structure
            const transformedData = earthquakes.map(eq => {
              // Log the raw earthquake data to see its structure
              console.log('Raw earthquake data:', eq);
              
              // Handle different possible data structures
              const coords = eq.coordinates || eq.geometry?.coordinates || [eq.longitude, eq.latitude];
              // Try different possible locations for magnitude
              const magnitude = eq.magnitude || 
                              eq.properties?.magnitude || 
                              eq.properties?.mag || 
                              eq.mag || 
                              eq.properties?.properties?.magnitude;
              
              console.log('Extracted magnitude:', magnitude);
              
              return {
                coordinates: coords,
                magnitude: magnitude,
                ...eq
              };
            });

            // Log magnitude values for debugging
            console.log('Transformed data:', transformedData);
            console.log('Magnitude values:', transformedData.map(d => d.magnitude));

            layer = visualization === 'scatterplot'
              ? new ScatterplotLayer({
                  id: 'earthquake-scatterplot',
                  data: transformedData,
                  filled: true,
                  radiusMaxPixels: 50,
                  radiusMinPixels: 20,
                  getPosition: d => d.coordinates,
                  getFillColor: d => [255, 0, 0, 150],
                  pickable: true,
                  onHover: (info) => {
                    updateTooltip(info)
                  }
                })
              : new HeatmapLayer({
                  id: 'earthquake-heatmap',
                  data: transformedData,
                  getPosition: d => d.coordinates,
                  getWeight: d => d.magnitude || 0,
                  radiusPixels: 100,
                  intensity: 5,
                  threshold: 0.001,
                  colorRange: [[0, 0, 255, 0], [255, 0, 0, 255]],
                  pickable: true,
                  onHover: (info) => {
                    updateTooltip(info)
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

