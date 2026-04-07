import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";
import Home from "./features/landing/components/Home";
import Chat from "./features/chat/pages/Chat";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* <Route path="/" element={<LoginRoute />} /> */}
          <Route
            path="/"
            element={
              // <ProtectedRoute>
                <Home />
              // </ProtectedRoute>
            }
          />
          {/* <Route path="/login" element={<LoginRoute />} />
          <Route path="/" element={<Navigate to="/login" replace />} /> */}

          <Route
            path="/commercial-ai"
            element={<Chat chatType="commercial-ai" />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
