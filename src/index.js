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
        <h1 style="font-size: 14px;">Incident: ${object.incident_id}</h1>
        <div style="font-size: 12px;">Killed: ${object.n_killed}</div>
        <div style="font-size: 10px; max-width: 100px">Notes: ${object.notes}</div>
      </div>`
  } else {
    tooltip.style.display = 'none';
  }
}

const scatterplot = () => new ScatterplotLayer({
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

const heatmap = () => new HeatmapLayer({
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
})

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

  // Create radio buttons for layer selection
  const radioContainer = document.createElement('div');
  radioContainer.style.display = 'flex';
  radioContainer.style.gap = '20px';

  const scatterplotRadio = document.createElement('input');
  scatterplotRadio.type = 'radio';
  scatterplotRadio.id = 'scatterplot';
  scatterplotRadio.name = 'layer';
  scatterplotRadio.value = 'scatterplot';
  scatterplotRadio.checked = true;

  const heatmapRadio = document.createElement('input');
  heatmapRadio.type = 'radio';
  heatmapRadio.id = 'heatmap';
  heatmapRadio.name = 'layer';
  heatmapRadio.value = 'heatmap';

  const scatterplotLabel = document.createElement('label');
  scatterplotLabel.htmlFor = 'scatterplot';
  scatterplotLabel.textContent = 'Scatterplot';

  const heatmapLabel = document.createElement('label');
  heatmapLabel.htmlFor = 'heatmap';
  heatmapLabel.textContent = 'Heatmap';

  radioContainer.appendChild(scatterplotRadio);
  radioContainer.appendChild(scatterplotLabel);
  radioContainer.appendChild(heatmapRadio);
  radioContainer.appendChild(heatmapLabel);
  menuContainer.appendChild(radioContainer);
  document.body.appendChild(menuContainer);

  const map = new google.maps.Map(document.getElementById('map'),{
    center: {lat: 40.0, lng: -100.0},
    zoom: 5
  })

  const overlay = new GoogleMapsOverlay({
    layers: [scatterplot()]
  })
  overlay.setMap(map)

  // Handle layer switching
  radioContainer.addEventListener('change', (e) => {
    if (e.target.value === 'scatterplot') {
      overlay.setProps({ layers: [scatterplot()] });
    } else {
      overlay.setProps({ layers: [heatmap()] });
    }
  });
}

