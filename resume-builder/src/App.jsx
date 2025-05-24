import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PersonalInfoForm from './components/PersonalInfoForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {
        <PersonalInfoForm />
      }
    </>
  )
}

export default App
