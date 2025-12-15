import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// 👇 这一行是关键！没有它，Tailwind CSS 就不会生效
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)