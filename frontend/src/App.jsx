import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Registrations from "./pages/Registrations.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
// Example Firestore page (optional)
import UserList from "./components/UserList.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registrations" element={<Registrations />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Example Firestore page */}
            <Route path="/users" element={<UserList />} />
            {/* Catch-all 404 */}
            <Route
              path="*"
              element={
                <p className="text-center text-red-500">404 – Page Not Found</p>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
