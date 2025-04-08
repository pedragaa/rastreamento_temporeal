import React from 'react';
import MapaEntregadores from './components/MapaEntregadores';

function App() {
  const entregadores = [
    {
      latitude: -23.55052,
      longitude: -46.633308,
      origem: { latitude: -23.55052, longitude: -46.633308 },
      destino: { latitude: -23.559616, longitude: -46.658722 },
    },
    {
      latitude: -23.5621,
      longitude: -46.6525,
      origem: { latitude: -23.5621, longitude: -46.6525 },
      destino: { latitude: -23.5682, longitude: -46.6395 },
    },
    {
      latitude: -23.5532,
      longitude: -46.6267,
      origem: { latitude: -23.5532, longitude: -46.6267 },
      destino: { latitude: -23.5454, longitude: -46.6348 },
    },
  ];

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MapaEntregadores entregadores={entregadores} />
    </div>
  );
}

export default App;
