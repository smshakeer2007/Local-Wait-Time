import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { PlaceDetailPage } from './pages/PlaceDetailPage.jsx';
import { AddPlacePage } from './pages/AddPlacePage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { ToastProvider } from './components/Toast.jsx';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/places/new" element={<AddPlacePage />} />
              <Route path="/places/:id" element={<PlaceDetailPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}
