import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000')
      .then((response) => response.text())
      .then((data) => setMessage(data));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Frontend App</h1>
        <p>{message}</p>
      </header>
    </div>
  );
}

export default App;
