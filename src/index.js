//us-gun-violence.web.app/gundata.json

import {GoogleMapsOverlay} from "@deck.gl/google-maps"
import {ScatterplotLayer} from "@deck.gl/layers"
import {HeatmapLayer} from "@deck.gl/aggregation-layers"
import {AVAILABLE_DATASETS, transformInputDataForDisplay} from './transforms'
import './styles.css'

const tooltip = document.createElement('div');
tooltip.className = 'tooltip';

function updateTooltip(x, y, data) {
  tooltip.style.display = 'block';
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
  tooltip.innerHTML = `
    <div class="tooltip-content">
      <div class="tooltip-heading">${data.heading}</div>
      <div class="tooltip-subheading">${data.subHeading}</div>
      <div class="tooltip-description">${data.notes}</div>
    </div>`
}

window.initMap = () => {
  document.body.append(tooltip);

  // Create menu container
  const menuContainer = document.createElement('div');
  menuContainer.className = 'menu-container';

  // Create dataset selection container
  const datasetContainer = document.createElement('div');
  datasetContainer.className = 'control-box';

  const datasetLabel = document.createElement('div');
  datasetLabel.className = 'control-label';
  datasetLabel.textContent = 'Dataset:';
  datasetContainer.appendChild(datasetLabel);

  const datasetSelect = document.createElement('select');
  datasetSelect.className = 'dataset-select';
  AVAILABLE_DATASETS.forEach(dataset => {
    const option = document.createElement('option');
    option.value = dataset.url;
    option.textContent = dataset.name;
    datasetSelect.appendChild(option);
  });
  datasetContainer.appendChild(datasetSelect);

  // Create visualization type container
  const vizContainer = document.createElement('div');
  vizContainer.className = 'control-box';

  const vizLabel = document.createElement('div');
  vizLabel.className = 'control-label';
  vizLabel.textContent = 'View:';
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
  async function updateLayer() {
    const datasetUrl = datasetSelect.value;
    const visualization = vizContainer.querySelector('input[name="visualization"]:checked').value;
    
    const data = await transformInputDataForDisplay(datasetUrl);
    
    let layer;
    if (visualization === 'scatterplot') {
      layer = new ScatterplotLayer({
        id: 'scatterplot',
        data: data,
        filled: true,
        radiusUnits: 'meters',
        radiusScale: 1000,
        getRadius: d => d.magnitude * 100,
        getPosition: d => [d.longitude, d.latitude],
        getFillColor: d => d.color,
        pickable: true,
        onHover: (info) => {
          if (info.object) {
            updateTooltip(info.x, info.y, info.object);
          } else {
            tooltip.style.display = 'none';
          }
        }
      });
    } else {
      layer = new HeatmapLayer({
        id: 'heatmap',
        data: data,
        getPosition: d => [d.longitude, d.latitude],
        getWeight: d => d.magnitude || 0,
        radiusPixels: 30,
        intensity: 1,
        threshold: 0.05,
        colorRange: [[0, 0, 255, 0], [255, 0, 0, 255]],
        pickable: true,
        onHover: (info) => {
          if (info.object) {
            updateTooltip(info.x, info.y, info.object);
          } else {
            tooltip.style.display = 'none';
          }
        }
      });
    }
    
    overlay.setProps({ layers: [layer] });
  }

  // Initial layer setup
  updateLayer();

  datasetSelect.addEventListener('change', updateLayer);
  vizContainer.addEventListener('change', updateLayer);
}

