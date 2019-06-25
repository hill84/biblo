import React from 'react';
import { app } from '../config/shared';

function BrowserNotSupported() {
  return (
    <div style={{ padding: 30, margin: '0 auto', width: 520, textAlign: 'center' }}>
      <img src={app.logo} alt={app.desc} style={{ margin: '0 auto', width: 76, height: 76 }} />
      <h1>Il tuo browser non &egrave; supportato.</h1>
      <p style={{ color: '#666' }}>{app.name} non &egrave; in grado di fornire un'esperienza ottimale su questo browser. Per usare questo sito, aggiorna all'ultima versione di <a href="https://www.google.com/intl/it/chrome/" target="_blank" rel="noopener noreferrer">Chrome</a>, <a href="https://www.mozilla.org/it/firefox/new/" target="_blank" rel="noopener noreferrer">Firefox</a>, <a href="https://www.opera.com/it" target="_blank" rel="noopener noreferrer">Opera</a>, <a href="https://www.apple.com/it/safari/" target="_blank" rel="noopener noreferrer">Safari</a> o <a href="https://www.microsoft.com/it-it/windows/microsoft-edge" target="_blank" rel="noopener noreferrer">Edge</a>.</p>
      <br />
      <p style={{ color: '#888', fontSize: '90%', padding: 30 }}>{app.desc}</p>
    </div>
  );
}
 
export default BrowserNotSupported;