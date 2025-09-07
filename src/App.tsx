import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Quiz from './pages/Quiz'
import PolicyLibrary from './pages/PolicyLibrary'
import Progress from './pages/Progress'
import Landing from './pages/Landing'

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="quiz/:moduleId" element={<Quiz />} />
          <Route path="policies" element={<PolicyLibrary />} />
          <Route path="progress" element={<Progress />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}

export default App