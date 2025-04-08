import React from 'react';
import MapaEntregadores from './components/MapaEntregadores';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Corrige os ícones padrão do Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function App() {
  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ textAlign: 'center', margin: '10px 0' }}>📍 Painel do Gestor</h1>
      <div style={{ flex: 1 }}>
        <MapaEntregadores />
      </div>
    </div>
  );
}

export default App;
