import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from '../src/router';

export default function CatchAllPage() {
  return <RouterProvider router={router} />;
} 