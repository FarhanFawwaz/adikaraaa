import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../services/authService";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Check user login status
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, [location]); // Re-check when location changes

  // Handle hash navigation when landing on page with hash
  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const sectionId = location.hash.substring(1); // Remove #
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
          const navbarHeight = 80;
          const targetPosition = section.offsetTop - navbarHeight;
          window.scrollTo({ top: targetPosition, behavior: "smooth" });
        }
      }, 100); // Small delay to ensure page is loaded
    }
  }, [location]);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === "/" && location.pathname !== "/") return "";
    return location.pathname.startsWith(path) ? "active" : "";
  };

  const handleNavClick = (e, sectionId) => {
    // Only handle hash navigation on landing page
    if (location.pathname === "/" && sectionId) {
      e.preventDefault();
      const section = document.getElementById(sectionId);
      if (section) {
        const navbarHeight = 80;
        const targetPosition = section.offsetTop - navbarHeight;
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
        setIsMobileMenuOpen(false);
      }
    } else if (location.pathname !== "/" && sectionId) {
      // If not on landing page, navigate to landing page with section
      e.preventDefault();
      navigate(`/#${sectionId}`);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setShowDropdown(false);
    navigate("/");
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`} id="navbar">
      <div className="nav-container-fluid">
        <div className="nav-content">
          <Link to="/" className="logo">            
            <img src="../assets/images/image.png" alt="" />
            <span>
              NeuroRehab<span className="gradient-text">AI</span>
            </span>
          </Link>

          <div
            className={`nav-links ${isMobileMenuOpen ? "mobile-active" : ""}`}
            id="navLinks"
          >
            <Link
              to="/"
              className={`nav-link ${isActive("/")}`}
              onClick={(e) => handleNavClick(e, "home")}
            >
              Beranda
            </Link>

            <>
              {user && (
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive("/dashboard")}`}
                >
                  Dashboard
                </Link>
              )}
              <a
                href="#features"
                className="nav-link"
                onClick={(e) => handleNavClick(e, "features")}
              >
                Fitur
              </a>
              <a
                href="#rehabilitation"
                className="nav-link"
                onClick={(e) => handleNavClick(e, "rehabilitation")}
              >
                Rehabilitasi
              </a>
              <a
                href="#games"
                className="nav-link"
                onClick={(e) => handleNavClick(e, "games")}
              >
                Game
              </a>
              <a
                href="#technology"
                className="nav-link"
                onClick={(e) => handleNavClick(e, "technology")}
              >
                Teknologi
              </a>
              <a
                href="#about"
                className="nav-link"
                onClick={(e) => handleNavClick(e, "about")}
              >
                Tentang
              </a>
            </>
          </div>

          <div className="nav-actions">
            {user ? (
              /* User sudah login - tampilkan profil */
              <div className="user-profile-menu">
                <button
                  className="user-profile-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <span className="user-name">{user.name}</span>
                  <i
                    className={`fas fa-chevron-down ${
                      showDropdown ? "rotate" : ""
                    }`}
                  ></i>
                </button>

                {showDropdown && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="user-avatar large">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                        <span className="user-role">
                          {user.role === "patient" ? "Pasien" : "Fisioterapis"}
                        </span>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link
                      to="/dashboard"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <i className="fas fa-tachometer-alt"></i>
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      <i className="fas fa-user-cog"></i>
                      Pengaturan Profil
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* User belum login - tampilkan tombol login/register */
              <>
                <Link to="/login" className="btn btn-outline">
                  <i className="fas fa-sign-in-alt"></i> Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  <i className="fas fa-user-plus"></i> Daftar
                </Link>
              </>
            )}
          </div>

          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? "active" : ""}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};
