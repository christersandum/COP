import OAuthInfo from '@arcgis/core/identity/OAuthInfo.js';
import IdentityManager from '@arcgis/core/identity/IdentityManager.js';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css';

// Register OAuth with ArcGIS IdentityManager
const oauthInfo = new OAuthInfo({
  appId: import.meta.env.VITE_ARCGIS_APP_ID || 'resourcetracker',
  portalUrl: 'https://beredskap.maps.arcgis.com',
  popup: false,
  flowType: 'implicit',
  redirectUri: window.location.origin + '/resourcetracker/',
});

IdentityManager.registerOAuthInfos([oauthInfo]);

createRoot(document.getElementById('root')).render(<App />);
