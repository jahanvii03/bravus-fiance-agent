import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from './contexts/authContext';
import { LoginRoute } from './features/auth/components/LoginRoute';
function App() {

  return (
    <BrowserRouter>
    <AuthProvider>
<Routes>
<Route path="/" element={<LoginRoute/>}/>
</Routes>
    </AuthProvider>
    </BrowserRouter>
 
  )
}

export default App
