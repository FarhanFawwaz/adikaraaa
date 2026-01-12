import { Outlet, useLocation, Link } from "react-router-dom";
import { Navbar } from "./Navbar";

export const Layout = () => {
  const location = useLocation();
  const hideFooterPaths = ["/login", "/register"];
  const showFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <div className="min-h-screen bg-dark text-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      {showFooter && (
        <footer className="footer bg-card-dark border-t border-slate-800 pt-16 pb-8 mt-auto">
          <div className="container mx-auto px-4">
            <div className="footer-content grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
              <div className="footer-brand col-span-1 lg:col-span-1">
                <div className="logo flex items-center gap-2 text-xl font-bold mb-4">
                  
                  <span>
                    NeuroRehab<span className="text-primary-400">AI</span>
                  </span>
                </div>
                <p className="footer-tagline text-slate-400 text-sm leading-relaxed mb-6">
                  Rehabilitasi stroke yang lebih cerdas dengan teknologi IoT dan
                  AI
                </p>
                <div className="social-links flex gap-4">
                  <a href="#" aria-label="Instagram" className="text-slate-400 hover:text-white transition-colors">
                    <i className="fab fa-instagram text-lg"></i>
                  </a>
                  <a href="#" aria-label="Twitter" className="text-slate-400 hover:text-white transition-colors">
                    <i className="fab fa-twitter text-lg"></i>
                  </a>
                  <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-white transition-colors">
                    <i className="fab fa-linkedin text-lg"></i>
                  </a>
                  <a href="#" aria-label="YouTube" className="text-slate-400 hover:text-white transition-colors">
                    <i className="fab fa-youtube text-lg"></i>
                  </a>
                </div>
              </div>

              <div className="footer-links col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="footer-column">
                  <h4 className="text-white font-semibold mb-4">Produk</h4>
                  <ul className="space-y-2">
                    <li><a href="#features" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Fitur</a></li>
                    <li><a href="#games" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Game Terapi</a></li>
                    <li><a href="#technology" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Teknologi</a></li>
                    <li><Link to="/dashboard" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Dashboard Pasien</Link></li>
                  </ul>
                </div>

                <div className="footer-column">
                  <h4 className="text-white font-semibold mb-4">Perusahaan</h4>
                  <ul className="space-y-2">
                    <li><a href="#about" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Tentang Kami</a></li>
                    <li><a href="#team" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Tim</a></li>
                    <li><a href="#contact" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Kontak</a></li>
                    <li><a href="#careers" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Karir</a></li>
                  </ul>
                </div>

                <div className="footer-column">
                  <h4 className="text-white font-semibold mb-4">Dukungan</h4>
                  <ul className="space-y-2">
                    <li><a href="#faq" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">FAQ</a></li>
                    <li><a href="#docs" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Dokumentasi</a></li>
                    <li><a href="#privacy" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Kebijakan Privasi</a></li>
                    <li><a href="#terms" className="text-slate-400 hover:text-primary-400 text-sm transition-colors">Syarat &amp; Ketentuan</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="footer-bottom pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm gap-4">
              <p>
                &copy; 2026 NeuroRehab Glove AI - Pop Mie Dower, Telkom
                University. All rights reserved.
              </p>
              <p className="footer-attribution flex items-center gap-2 text-primary-400 font-medium">
                <i className="fas fa-trophy"></i> Inovasi SDGs Batch 2026
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
