import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Error from './pages/Error/Error.tsx';
import Home from './pages/Home/Home.tsx';
import i18n from './utils/i18n.ts';
import { I18nextProvider } from 'react-i18next';
import './main.scss';

const router = createBrowserRouter([
  { path: '/', element: <Home />, errorElement: <Error /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>
  </React.StrictMode>
);
