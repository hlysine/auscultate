import React from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import App from './App';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AudioContext } from './AudioContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
]);

const container = document.querySelector('#root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <AudioContext>
      <RouterProvider router={router} />
    </AudioContext>
  </React.StrictMode>
);
