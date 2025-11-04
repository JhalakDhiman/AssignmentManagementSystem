import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import logo from '../images/logo.svg'

const Navbar = () => {
  const { token, user, setToken, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="border-b border-richblue-25 py-3 flex items-center justify-between px-16">

      <div className="flex items-center gap-2">
        <img
          src={logo}
          alt="Logo"
          className="w-8 h-8"
        />
        <h1 className="text-xl font-semibold text-gray-800">AssignmentAcademy</h1>
      </div>


      <div className="flex items-center gap-4">
        {!token ? (
          <>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
            >
              Logout
            </button>
            <div className="relative flex items-center gap-2 group">
              <Link
                to={`/${user?.accountType === 'Student' ? 'student-dashboard' : 'professor-dashboard'}`}
              >
                <img
                  src={user?.image || "https://via.placeholder.com/40"}
                  alt="User"
                  className="w-10 h-10 rounded-full border cursor-pointer"
                />
              </Link>

              {/* Tooltip */}
              <span className="absolute -top-3 left-16 -translate-x-1/2 bg-richblue-100 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Dashboard
              </span>
            </div>


          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
