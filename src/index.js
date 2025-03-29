
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

window.initMap = () => {


  document.body.append(tooltip);

  const map = new google.maps.Map(document.getElementById('map'),{
    center: {lat: 40.0, lng: -100.0},
    zoom: 5
  })

  const overlay = new GoogleMapsOverlay({
    layers: [
      scatterplot()
    ]
  })
  overlay.setMap(map)

  // to do changes to the overlay (not used here tho)
  // overlay.setProps({ layers: [] })
}

