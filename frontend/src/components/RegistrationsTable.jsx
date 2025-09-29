import { useEffect, useState } from "react";
import axios from "axios";

export default function RegistrationsTable() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/registrations");
      setRegistrations(res.data);
      setLoading(false);
    } catch {
      setRegistrations([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // initial load

    const interval = setInterval(() => {
      fetchData(); // refresh every 30 seconds
    }, 30000);

    return () => clearInterval(interval); // cleanup
  }, []);

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

  if (loading) {
    return <p className="text-gray-600">Loading registrations...</p>;
  }

  if (registrations.length === 0) {
    return <p className="text-gray-600">No registrations yet.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
        <p className="text-sm text-gray-500">
          Auto-refreshes every 30 seconds.
        </p>
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
        >
          Download CSV
        </button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {registrations.map((row, idx) => (
            <tr
              key={idx}
              className="hover:bg-gray-50 transition duration-300 ease-in-out"
            >
              <td className="px-4 py-3">{row.name}</td>
              <td className="px-4 py-3">{row.email}</td>
              <td className="px-4 py-3">
                {new Date(row.date).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
