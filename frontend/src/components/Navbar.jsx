import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-semibold text-lg">Event Registration</div>
        <div className="flex items-center gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1 rounded transition duration-300 ease-in-out ${
                isActive
                  ? "text-white bg-blue-600"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              }`
            }
            end
          >
            Home
          </NavLink>
          <NavLink
            to="/registrations"
            className={({ isActive }) =>
              `px-3 py-1 rounded transition duration-300 ease-in-out ${
                isActive
                  ? "text-white bg-blue-600"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
              }`
            }
          >
            View Registrations
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
