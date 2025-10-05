import { NavLink } from "react-router-dom";
import "../App.tsx";

function Navigation() {
  return (
    <nav className="nav nav-pills flex-column flex-sm-row">
      <NavLink
        className={({ isActive }) =>
          `flex-sm-fill text-sm-center nav-link ${isActive ? "active" : ""}`
        }
        to="/"
      >
        Home
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          `flex-sm-fill text-sm-center nav-link ${isActive ? "active" : ""}`
        }
        to="/categories"
      >
        Categories
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          `flex-sm-fill text-sm-center nav-link ${isActive ? "active" : ""}`
        }
        to="/recipes"
      >
        Recipes
      </NavLink>
    </nav>
  );
}

export default Navigation;
