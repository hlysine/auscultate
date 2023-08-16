import React from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';
import App from './App';
import Heart from './heart/Heart';
import Breath from './breath/Breath';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AudioContext } from './AudioContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/heart',
    element: (
      <AudioContext>
        <Heart />
      </AudioContext>
    ),
  },
  {
    path: '/breath',
    element: (
      <AudioContext>
        <Breath />
      </AudioContext>
    ),
  },
]);

const container = document.querySelector('#root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
