import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('React Error Boundary caught:', error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff1f6', fontFamily: 'sans-serif', padding: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '600px', width: '100%', boxShadow: '0 4px 30px rgba(216,27,96,0.15)', border: '1px solid #fecddf' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ color: '#c2185b', marginBottom: '0.5rem' }}>Terjadi Error di Aplikasi</h1>
            <p style={{ color: '#6b5b63', marginBottom: '1rem' }}>Mohon refresh halaman atau hubungi developer.</p>
            <pre style={{ background: '#fff1f6', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#a2154d', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {this.state.error?.toString()}
              {'\n'}
              {this.state.info?.componentStack}
            </pre>
            <button onClick={() => window.location.reload()}
              style={{ marginTop: '1rem', background: '#d81b60', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
              🔄 Refresh Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
