import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';

import './index.css'
import HomePage from './pages/Home.tsx'
import ContactPage from './pages/Contact.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx' 
import AboutPage from './pages/About.tsx'
import ProjectsPage from './pages/Projects.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)


