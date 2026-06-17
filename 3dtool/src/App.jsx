import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import VoxelArchitect from './components/VoxelArchitect'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <VoxelArchitect />
    </>
  )
}

export default App
