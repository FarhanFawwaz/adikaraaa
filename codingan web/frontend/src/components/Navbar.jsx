import { Link, useLocation } from "react-router-dom";

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    // Basic active check, checks if the pathname starts with the link path for sub-routes
    if (path === "/" && location.pathname !== "/")
      return "text-slate-400 hover:text-white";
    return location.pathname.startsWith(path)
      ? "text-accent"
      : "text-slate-400 hover:text-white";
  };

  return (
    <nav className="bg-card-dark border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              {/* Simple Logo Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-white"
              >
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
              </svg>
            </div>
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent"
            >
              NeuroRehab AI
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${isActive(
                "/"
              )}`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors ${isActive(
                "/dashboard"
              )}`}
            >
              Dashboard
            </Link>
            <Link
              to="/games"
              className={`text-sm font-medium transition-colors ${isActive(
                "/games"
              )}`}
            >
              Games
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
