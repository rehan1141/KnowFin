import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <h1 className="text-6xl font-extrabold text-slate-900">404</h1>
    <p className="mt-2 text-lg text-slate-600">Page not found</p>
    <Link
      to="/"
      className="mt-6 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition"
    >
      Return Home
    </Link>
  </div>
);
