//us-gun-violence.web.app/gundata.json

import {GoogleMapsOverlay} from "@deck.gl/google-maps"
import {ScatterplotLayer} from "@deck.gl/layers"
import {HeatmapLayer, HexagonLayer} from "@deck.gl/aggregation-layers"
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

function hideTooltip() {
  tooltip.style.display = 'none';
}

window.initMap = () => {
  document.body.append(tooltip);

  // Create menu container
  const menuContainer = document.createElement('div');
  menuContainer.className = 'menu-container';

  // Add mouse enter/leave handlers for menu
  menuContainer.addEventListener('mouseenter', hideTooltip);
  menuContainer.addEventListener('mouseleave', hideTooltip);

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
  vizLabel.textContent = 'Views:';
  vizContainer.appendChild(vizLabel);

  const scatterplotCheckbox = document.createElement('input');
  scatterplotCheckbox.type = 'checkbox';
  scatterplotCheckbox.id = 'scatterplot';
  scatterplotCheckbox.name = 'visualization';
  scatterplotCheckbox.value = 'scatterplot';
  scatterplotCheckbox.checked = true;

  const heatmapCheckbox = document.createElement('input');
  heatmapCheckbox.type = 'checkbox';
  heatmapCheckbox.id = 'heatmap';
  heatmapCheckbox.name = 'visualization';
  heatmapCheckbox.value = 'heatmap';

  const hexagonCheckbox = document.createElement('input');
  hexagonCheckbox.type = 'checkbox';
  hexagonCheckbox.id = 'hexagon';
  hexagonCheckbox.name = 'visualization';
  hexagonCheckbox.value = 'hexagon';

  const scatterplotLabel = document.createElement('label');
  scatterplotLabel.htmlFor = 'scatterplot';
  scatterplotLabel.textContent = 'Scatterplot';

  const heatmapLabel = document.createElement('label');
  heatmapLabel.htmlFor = 'heatmap';
  heatmapLabel.textContent = 'Heatmap';

  const hexagonLabel = document.createElement('label');
  hexagonLabel.htmlFor = 'hexagon';
  hexagonLabel.textContent = 'Hexagon';

  vizContainer.appendChild(scatterplotCheckbox);
  vizContainer.appendChild(scatterplotLabel);
  vizContainer.appendChild(heatmapCheckbox);
  vizContainer.appendChild(heatmapLabel);
  vizContainer.appendChild(hexagonCheckbox);
  vizContainer.appendChild(hexagonLabel);

  menuContainer.appendChild(datasetContainer);
  menuContainer.appendChild(vizContainer);
  document.body.appendChild(menuContainer);

  const map = new google.maps.Map(document.getElementById('map'),{
    center: {lat: 40.0, lng: -100.0},
    zoom: 5,
    mapId: null
  })

  const overlay = new GoogleMapsOverlay({
    layers: []
  })
  overlay.setMap(map)

  // Handle layer switching
  async function updateLayer() {
    const datasetUrl = datasetSelect.value;
    const enabledViews = Array.from(vizContainer.querySelectorAll('input[name="visualization"]:checked')).map(input => input.value);
    
    const data = await transformInputDataForDisplay(datasetUrl);
    const layers = [];
    
    if (enabledViews.includes('scatterplot')) {
      layers.push(new ScatterplotLayer({
        id: 'scatterplot',
        data: data,
        filled: true,
        radiusUnits: 'meters',
        radiusScale: 1000,
        getRadius: d => d.radius,
        getPosition: d => [d.longitude, d.latitude],
        getFillColor: d => d.color,
        pickable: true,
        onHover: (info) => {
          if (info.object) {
            updateTooltip(info.x, info.y, info.object);
          } else {
            hideTooltip();
          }
        }
      }));
    }

    if (enabledViews.includes('heatmap')) {
      layers.push(new HeatmapLayer({
        id: 'heatmap',
        data: data,
        getPosition: d => [d.longitude, d.latitude],
        getWeight: d => d.magnitude || 0,
        radiusPixels: 30,
        intensity: 1,
        threshold: 0.05,
        colorRange: [[0, 0, 255, 100], [255, 0, 0, 255]],
      }));
    }

    if (enabledViews.includes('hexagon')) {
      layers.push(new HexagonLayer({
        id: 'hexagon',
        data: data,
        getPosition: d => [d.longitude, d.latitude],
        getElevationWeight: d => d.radius || 0,
        colorRange: [[0, 0, 255, 100], [255, 0, 0, 255]],
        elevationScale: 100,
        extruded: true,
        radius: 5000,         
        opacity: 0.6,        
        coverage: 0.88,
        lowerPercentile: 50,
      }));
    }
    
    overlay.setProps({ layers });
  }

  // Initial layer setup
  updateLayer();

  datasetSelect.addEventListener('change', updateLayer);
  vizContainer.addEventListener('change', updateLayer);
}

