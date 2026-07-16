import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'nprogress/nprogress.css'
import App from './App.jsx'
import posthog from 'posthog-js'

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  defaults: '2026-05-30',
  capture_pageview: 'history_change',
  capture_pageleave: true,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
