import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export const LandingPage = () => {
  const typingRef = useRef(null);

  // Typing effect
  useEffect(() => {
    const typingTexts = ["Gamifikasi AI", "IoT Pintar", "Rehabilitasi Seru"];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      if (!typingRef.current) return;

      const currentText = typingTexts[textIndex];

      if (isDeleting) {
        typingRef.current.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typingRef.current.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % typingTexts.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    };

    type();
  }, []);

  // Counter animation component
  const Counter = ({ target, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const counterRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated.current) {
              hasAnimated.current = true;
              const duration = 2000;
              const increment = target / (duration / 16);
              let current = 0;

              const updateCounter = () => {
                current += increment;
                if (current < target) {
                  setCount(Math.floor(current));
                  requestAnimationFrame(updateCounter);
                } else {
                  setCount(target);
                }
              };

              updateCounter();
            }
          });
        },
        { threshold: 0.1 }
      );

      if (counterRef.current) {
        observer.observe(counterRef.current);
      }

      return () => observer.disconnect();
    }, [target]);

    return (
      <span ref={counterRef} className="counter">
        {count}
        {suffix}
      </span>
    );
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = 80;
      const targetPosition = section.offsetTop - navbarHeight;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  };

  const features = [
    {
      icon: "fa-gamepad",
      title: "Gamifikasi Terapi",
      description:
        "Latihan fisioterapi berubah jadi game seru! Piano virtual, tangkap buah, dan mini game lainnya membuat rehabilitasi tidak membosankan.",
      list: ["4+ Game interaktif", "Adaptive difficulty", "Progress tracking"],
    },
    {
      icon: "fa-heartbeat",
      title: "Monitoring Jantung",
      description:
        "Pantau detak jantung dan SpO2 secara real-time dengan sensor medis MAX30102 dan EKG menggunakan AD8232.",
      list: ["Real-time vitals", "EKG visualization", "Alert system"],
    },
    {
      icon: "fa-brain",
      title: "AI Aritmia Detection",
      description:
        "Algoritma Deep Learning (FCNN) mendeteksi 5 jenis aritmia dengan akurasi 98% berdasarkan MIT-BIH database.",
      list: ["98% accuracy", "5 jenis denyut", "Early warning"],
    },
    {
      icon: "fa-chart-line",
      title: "Progress Analytics",
      description:
        "Dashboard lengkap untuk pasien dan fisioterapis. Lacak ROM, konsistensi latihan, dan perkembangan dari waktu ke waktu.",
      list: ["Visual charts", "Compliance tracking", "Goal setting"],
    },
    {
      icon: "fa-shield-halved",
      title: "Safety First",
      description:
        "Sistem auto-pause saat anomali jantung terdeteksi. Notifikasi instant ke keluarga dan tenaga medis.",
      list: ["Auto-pause game", "Instant alert", "Fatigue detection"],
    },
    {
      icon: "fa-wallet",
      title: "Harga Terjangkau",
      description:
        "Dirancang dengan komponen COTS (Commercial Off-The-Shelf) dengan biaya produksi di bawah Rp 1 juta.",
      list: ["< Rp 1.000.000", "IoT ready", "Mudah dirawat"],
    },
  ];

  const games = [
    {
      id: "piano",
      icon: "fa-music",
      tag: "Motorik Halus",
      title: "Finger Piano",
      description:
        "Mainkan melodi dengan gerakan jari. Melatih koordinasi jari individual dan timing.",
      time: "5-7 menit",
      level: "Pemula - Mahir",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: "catch",
      icon: "fa-apple-alt",
      tag: "Grip Strength",
      title: "Fruit Catch",
      description:
        "Tangkap buah jatuh dengan menggenggam tangan. Melatih kekuatan dan kecepatan reaksi.",
      time: "5-8 menit",
      level: "Mudah - Sedang",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: "memory",
      icon: "fa-brain",
      tag: "Kognitif + Motorik",
      title: "Memory Pattern",
      description:
        "Ikuti urutan gerakan jari. Melatih memori kerja dan sequencing motorik.",
      time: "5-8 menit",
      level: "Sedang - Sulit",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      id: "garden",
      icon: "fa-seedling",
      tag: "Long-term Engagement",
      title: "Gardening Simulator",
      description:
        "Tanam dan rawat taman virtual. Latihan konsisten membuat tanaman tumbuh indah.",
      time: "10-15 menit",
      level: "Semua Level",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  const rehabPrograms = [
    {
      route: "/game/levels",
      icon: "fa-trophy",
      tag: "Gamified Progress",
      title: "Level Achievements",
      description: "Sistem level berbasis XP untuk memotivasi kemajuan rehabilitasi. Buka level baru dan raih pencapaian.",
      gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      metrics: [
        { icon: "fa-star", label: "XP System" },
        { icon: "fa-lock-open", label: "Unlockables" }
      ]
    },
    {
      route: "/game/daily-exercise",
      icon: "fa-calendar-check",
      tag: "Rutinitas Harian",
      title: "Daily Exercises",
      description: "Program latihan harian terstruktur untuk membangun konsistensi. 4 sesi latihan berbeda setiap hari.",
      gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
      metrics: [
        { icon: "fa-fire", label: "Streaks" },
        { icon: "fa-chart-bar", label: "Tracking" }
      ]
    }
  ];

  return (
    <div>
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="badge fade-in">
                <i className="fas fa-trophy"></i>
                Inovasi Telkom University 2026
              </div>

              <h1 className="hero-title fade-in-up">
                Rehabilitasi Stroke
                <br />
                <span className="gradient-text">Lebih Cerdas</span> dengan
                <br />
                <span className="typing-text" ref={typingRef}>
                  Gamifikasi AI
                </span>
              </h1>

              <p className="hero-description fade-in-up delay-1">
                Sarung tangan pintar yang mengubah fisioterapi menjadi
                pengalaman menyenangkan, sambil memantau kesehatan jantung Anda
                secara real-time dengan teknologi AI.
              </p>

              <div className="hero-stats fade-in-up delay-2">
                <div className="stat-item">
                  <div className="stat-value">
                    <i className="fas fa-heartbeat"></i>
                    <Counter target={98} suffix="%" />
                  </div>
                  <div className="stat-label">Akurasi Deteksi</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    <i className="fas fa-gamepad"></i>
                    <Counter target={4} suffix="+" />
                  </div>
                  <div className="stat-label">Game Terapi</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    <i className="fas fa-users"></i>
                    <Counter target={1000} suffix="+" />
                  </div>
                  <div className="stat-label">Target Pengguna</div>
                </div>
              </div>

              <div className="hero-actions fade-in-up delay-3">
                <Link to="/dashboard" className="btn btn-hero">
                  <i className="fas fa-rocket"></i>
                  Mulai Rehabilitasi
                  <span className="btn-glow"></span>
                </Link>
                <button
                  className="btn btn-outline-hero"
                  onClick={() => scrollToSection("games")}
                >
                  <i className="fas fa-play-circle"></i>
                  Lihat Demo
                </button>
              </div>
            </div>

            <div className="hero-visual fade-in-right">
              <div className="glove-showcase">
                <div className="glove-container">
                  <img
                    src="/assets/images/glove-mockup.svg"
                    alt="NeuroRehab Glove"
                    className="glove-image"
                  />
                  <div className="pulse-ring"></div>
                  <div className="pulse-ring delay-1"></div>
                </div>

                {/* Floating Cards */}
                <div className="floating-card card-1">
                  <div className="card-icon">
                    <i className="fas fa-hand-rock"></i>
                  </div>
                  <div className="card-text">
                    <strong>Flex Sensor</strong>
                    <span>5 Sensor Jari</span>
                  </div>
                </div>

                <div className="floating-card card-2">
                  <div className="card-icon">
                    <i className="fas fa-heart-pulse"></i>
                  </div>
                  <div className="card-text">
                    <strong>EKG Monitor</strong>
                    <span>Real-time</span>
                  </div>
                </div>

                <div className="floating-card card-3">
                  <div className="card-icon">
                    <i className="fas fa-brain"></i>
                  </div>
                  <div className="card-text">
                    <strong>AI Detection</strong>
                    <span>Aritmia 98%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <p>Scroll untuk jelajahi</p>
        </div>
      </section>



      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Mengapa Pilih Kami?</span>
            <h2 className="section-title">
              Fitur <span className="gradient-text">Unggulan</span>
            </h2>
            <p className="section-description">
              Kombinasi teknologi IoT, AI, dan gamifikasi untuk rehabilitasi
              yang efektif dan menyenangkan
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                className="feature-card"
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <div className="feature-icon">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <ul className="feature-list">
                  {feature.list.map((item, i) => (
                    <li key={i}>
                      <i className="fas fa-check"></i> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rehabilitation Section */}
      <section className="games-section" id="rehabilitation">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Program Terstruktur</span>
            <h2 className="section-title">
              Program <span className="gradient-text">Rehabilitasi</span>
            </h2>
            <p className="section-description">
              Tingkatkan pemulihan Anda dengan program latihan yang terarah, terukur, dan menyenangkan.
            </p>
          </div>

          <div className="games-showcase">
            {rehabPrograms.map((program, index) => (
              <Link
                to={program.route}
                className="game-card"
                key={index}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="game-image">
                  <div
                    className="game-preview"
                    style={{ background: program.gradient }}
                  >
                    <i className={`fas ${program.icon}`}></i>
                  </div>
                </div>
                <div className="game-info">
                  <div className="game-tag">{program.tag}</div>
                  <h3 className="game-title">{program.title}</h3>
                  <p className="game-description">{program.description}</p>
                  <div className="game-metrics">
                    {program.metrics.map((metric, i) => (
                      <span key={i}>
                        <i className={`fas ${metric.icon}`}></i> {metric.label}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="games-section" id="games">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Latihan Jadi Lebih Seru</span>
            <h2 className="section-title">
              Game <span className="gradient-text">Rehabilitasi</span>
            </h2>
            <p className="section-description">
              Setiap game dirancang untuk melatih aspek motorik berbeda dengan
              cara yang menyenangkan
            </p>
          </div>

          <div className="games-showcase">
            {games.map((game) => (
              <Link
                to={`/game/${game.id}`}
                className="game-card"
                key={game.id}
                data-game={game.id}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="game-image">
                  <div
                    className="game-preview"
                    style={{ background: game.gradient }}
                  >
                    <i className={`fas ${game.icon}`}></i>
                  </div>
                </div>
                <div className="game-info">
                  <div className="game-tag">{game.tag}</div>
                  <h3 className="game-title">{game.title}</h3>
                  <p className="game-description">{game.description}</p>
                  <div className="game-metrics">
                    <span>
                      <i className="fas fa-clock"></i> {game.time}
                    </span>
                    <span>
                      <i className="fas fa-signal"></i> {game.level}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology" id="technology">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Powered by Advanced Tech</span>
            <h2 className="section-title">
              Teknologi <span className="gradient-text">Di Baliknya</span>
            </h2>
          </div>

          <div className="tech-grid">
            <div className="tech-stack">
              <h3>Hardware</h3>
              <div className="tech-items">
                <div className="tech-item">
                  <i className="fas fa-microchip"></i>
                  <span>ESP32 Microcontroller</span>
                </div>
                <div className="tech-item">
                  <i className="fas fa-hand-pointer"></i>
                  <span>Flex Sensors (5x)</span>
                </div>
                <div className="tech-item">
                  <i className="fas fa-heartbeat"></i>
                  <span>MAX30102 (SpO2/HR)</span>
                </div>
                <div className="tech-item">
                  <i className="fas fa-wave-square"></i>
                  <span>AD8232 (EKG)</span>
                </div>
              </div>
            </div>

            <div className="tech-stack">
              <h3>Software</h3>
              <div className="tech-items">
                <div className="tech-item">
                  <i className="fab fa-python"></i>
                  <span>TensorFlow (AI Model)</span>
                </div>
                <div className="tech-item">
                  <i className="fas fa-network-wired"></i>
                  <span>MQTT over WebSocket</span>
                </div>
                <div className="tech-item">
                  <i className="fab fa-js"></i>
                  <span>JavaScript (Frontend)</span>
                </div>
                <div className="tech-item">
                  <i className="fas fa-database"></i>
                  <span>MIT-BIH Database</span>
                </div>
              </div>
            </div>
          </div>

          <div className="tech-diagram">
            <img
              src="/assets/images/system-architecture.svg"
              alt="System Architecture"
              className="diagram-image"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" id="about">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Siap Memulai Perjalanan Rehabilitasi?</h2>
            <p className="cta-description">
              Bergabunglah dengan ribuan pasien yang telah merasakan manfaat
              rehabilitasi dengan teknologi AI
            </p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-hero">
                <i className="fas fa-rocket"></i>
                Daftar Sekarang Gratis
              </Link>
              <button
                className="btn btn-outline-hero"
                onClick={() => scrollToSection("features")}
              >
                <i className="fas fa-info-circle"></i>
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <i className="fas fa-hand-sparkles"></i>
                <span>
                  NeuroRehab<span className="gradient-text">AI</span>
                </span>
              </div>
              <p className="footer-tagline">
                Rehabilitasi stroke yang lebih cerdas dengan teknologi IoT dan
                AI
              </p>
              <div className="social-links">
                <a href="#" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Produk</h4>
                <a href="#features">Fitur</a>
                <a href="#games">Game Terapi</a>
                <a href="#technology">Teknologi</a>
                <Link to="/dashboard">Dashboard Pasien</Link>
              </div>

              <div className="footer-column">
                <h4>Perusahaan</h4>
                <a href="#about">Tentang Kami</a>
                <a href="#team">Tim</a>
                <a href="#contact">Kontak</a>
                <a href="#careers">Karir</a>
              </div>

              <div className="footer-column">
                <h4>Dukungan</h4>
                <a href="#faq">FAQ</a>
                <a href="#docs">Dokumentasi</a>
                <a href="#privacy">Kebijakan Privasi</a>
                <a href="#terms">Syarat &amp; Ketentuan</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              &copy; 2026 NeuroRehab Glove AI - Pop Mie Dower, Telkom
              University. All rights reserved.
            </p>
            <p className="footer-attribution">
              <i className="fas fa-trophy"></i> Inovasi SDGs Batch 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
