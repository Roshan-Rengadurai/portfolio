import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createRoot } from 'react-dom/client'

import './index.css'
import HomePage from './pages/Home.tsx'
import ContactPage from './pages/Contact.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx' 
import AboutPage from './pages/About.tsx'
import ProjectsPage from './pages/Projects.tsx'
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/projects',
    element: <ProjectsPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/test',
    element: <NotFoundPage />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

