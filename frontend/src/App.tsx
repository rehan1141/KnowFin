import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
          <AppRoutes />
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
