import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getTokenExpiryTime, scheduleAutoLogout } from "../utils/auth";

axios.defaults.withCredentials = true; // send cookies with every request

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/registrations");
        setRegistrations(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch registrations", err);
        navigate("/admin-login");
      }
    };

    fetchData();
    scheduleAutoLogout(() => navigate("/admin-login"));
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeLeft = getTokenExpiryTime();
      if (timeLeft !== null) {
        setCountdown(Math.max(0, Math.floor(timeLeft / 1000)));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const deleteEntry = async (email) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this entry?"
    );
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/registrations/${email}`);
      const res = await axios.get("http://localhost:5000/registrations");
      setRegistrations(res.data);
    } catch (err) {
      console.error("Failed to delete entry", err);
      navigate("/admin-login");
    }
  };

  const exportCSV = () => {
    if (registrations.length === 0) return;

    const header = ["Name", "Email", "Date"];
    const rows = registrations.map((r) => [
      `"${r.name}"`,
      `"${r.email}"`,
      `"${new Date(r.date).toLocaleString()}"`,
    ]);
    const csvContent = [header.join(","), ...rows.map((r) => r.join(","))].join(
      "\n"
    );

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "registrations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/logout",
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/admin-login");
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading registrations...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        <button
          onClick={handleLogout}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          Logout
        </button>
      </div>

      <p className="text-sm text-gray-500 mb-2">
        Session expires in: {countdown} seconds
      </p>

      <button
        onClick={exportCSV}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Export CSV
      </button>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r.email} className="border-t hover:bg-gray-50 transition">
              <td className="px-4 py-2">{r.name}</td>
              <td className="px-4 py-2">{r.email}</td>
              <td className="px-4 py-2">{new Date(r.date).toLocaleString()}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => deleteEntry(r.email)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
