import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthClient } from '@dfinity/auth-client';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3498db',
    },
    secondary: {
      main: '#2c3e50',
    },
    error: {
      main: '#e74c3c',
    },
  },
});

async function initAuth() {
  const authClient = await AuthClient.create();
  return authClient;
}

initAuth().then((authClient) => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <App authClient={authClient} />
      </ThemeProvider>
    </React.StrictMode>,
  );
});
