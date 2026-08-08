import { BrowserRouter } from 'react-router-dom'
import { InstallGate } from './components/pwa/InstallGate'
import AppRouter from './router/AppRouter'

function App() {
  return (
    <InstallGate>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </InstallGate>
  )
}

export default App
