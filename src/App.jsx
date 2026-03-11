import React from 'react';
import SimuladorCooperclear from './SimuladorCooperclear';
import './App.css';

function App() {
  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1 }}>
        <SimuladorCooperclear />
      </div>
      <footer style={{ textAlign: 'center', padding: '1.5rem', fontSize: '14px', color: '#6b7280', marginTop: 'auto', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        Direitos reservados - Cooperclear | &reg; Feito por N Band Studio - 2026
      </footer>
    </div>
  );
}

export default App;
