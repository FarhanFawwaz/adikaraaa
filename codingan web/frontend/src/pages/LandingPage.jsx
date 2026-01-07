import { Link } from "react-router-dom";

const Icons = {
  Medical: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4v16" />
      <path d="M4 12h16" />
    </svg>
  ),
  Game: (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
      <rect x="2" y="6" width="20" height="12" rx="2" />
    </svg>
  ),
  Chart: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-primary mb-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Hand: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-primary mb-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 11V6a2 2 0 0 0-4 0v5" />
      <path d="M14 10V4a2 2 0 0 0-4 0v6" />
      <path d="M10 10.5V2a2 2 0 0 0-4 0v10" />
      <path d="M6 11V7a2 2 0 0 0-4 0v6c0 5 3.5 9 8 9h4c4 0 7-3.5 7-8v-3z" />
    </svg>
  ),
  Bot: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-primary mb-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  IoT: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-primary mb-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 17l6-6" />
      <path d="M20 17l-6-6" />
      <path d="M12 19V5" />
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  ),
  Analytics: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-primary mb-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    </svg>
  ),
  Dev: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-16 h-16 text-primary mb-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Design: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-16 h-16 text-primary mb-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  ),
  Research: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-16 h-16 text-primary mb-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 18h8" />
      <path d="M3 22h18" />
      <path d="M14 22a7 7 0 1 0 0-14h-1" />
      <path d="M9 14h2" />
      <path d="M9 12a2 2 0 0 1-2-2" />
    </svg>
  ),
  Gamepad: () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-12 h-12 text-primary mb-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
      <rect x="2" y="6" width="20" height="12" rx="2" />
    </svg>
  ),
};

export const LandingPage = () => {
  return (
    <div className="bg-light text-text-dark min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-card-dark to-dark text-white pt-24 pb-20 px-[5%] rounded-br-[100px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl font-bold leading-tight mb-4 bg-gradient-to-br from-accent to-primary bg-clip-text text-transparent">
              NeuroRehab Glove AI
            </h1>
            <h2 className="text-2xl text-slate-400 mb-5 font-light">
              Rehabilitasi Pasien Stroke dengan Teknologi IoT & AI
            </h2>
            <p className="text-lg leading-relaxed text-slate-300 mb-8">
              Sistem pemantauan dan rehabilitasi berbasis sarung tangan pintar
              dengan sensor ECG, MAX30102, dan Flex Sensor yang terintegrasi
              dengan dashboard real-time dan gamifikasi untuk meningkatkan
              motivasi pasien.
            </p>
            <div className="flex gap-5 flex-wrap justify-center md:justify-start">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-blue-400/30 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
              >
                <Icons.Medical className="w-6 h-6" /> Medical Dashboard
              </Link>
              <Link
                to="/games"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg bg-gradient-to-br from-purple to-purple-400 text-white shadow-lg shadow-purple-500/30 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
              >
                <Icons.Game className="w-6 h-6" /> Game Rehabilitasi
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center">
            <img
              src="/assets/images/gloves (1).png"
              alt="Smart Glove"
              className="max-w-full h-auto drop-shadow-2xl animate-[float_3s_ease-in-out_infinite]"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-[5%] max-w-7xl mx-auto" id="features">
        <h2 className="text-center text-4xl mb-12 text-dark font-bold">
          Fitur Utama
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              Icon: Icons.Chart,
              title: "Real-Time Monitoring",
              desc: "Pemantauan ECG, detak jantung (BPM), dan saturasi oksigen (SpO2) secara real-time",
            },
            {
              Icon: Icons.Hand,
              title: "Flex Sensor Tracking",
              desc: "5 sensor fleksibilitas untuk tracking gerakan jari dengan akurasi tinggi",
            },
            {
              Icon: Icons.Gamepad,
              title: "Gamifikasi",
              desc: "Game interaktif untuk meningkatkan motivasi dan konsistensi rehabilitasi",
            },
            {
              Icon: Icons.Bot,
              title: "AI-Powered",
              desc: "Analisis data menggunakan Machine Learning untuk progress tracking",
            },
            {
              Icon: Icons.IoT,
              title: "IoT Integration",
              desc: "Koneksi WebSocket untuk komunikasi real-time antara hardware dan software",
            },
            {
              Icon: Icons.Analytics,
              title: "Progress Analytics",
              desc: "Dashboard lengkap dengan visualisasi data dan analitik progress pasien",
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className="flex justify-center">
                <feature.Icon />
              </div>
              <h3 className="text-xl font-bold mb-4 text-primary">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="bg-dark text-white py-20 px-[5%]" id="technology">
        <h2 className="text-center text-4xl mb-12 font-bold">
          Teknologi yang Digunakan
        </h2>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Hardware",
              items: [
                "ESP32 (Microcontroller)",
                "AD8232 (ECG Sensor)",
                "MAX30102 (Heart Rate & SpO2)",
                "Flex Sensors (5x)",
              ],
            },
            {
              title: "Software",
              items: [
                "React.js (Frontend)",
                "Python WebSocket (Backend)",
                "TensorFlow/Keras (AI Model)",
                "Real-time Data Visualization",
              ],
            },
            {
              title: "Features",
              items: [
                "Real-time ECG Monitoring",
                "Vitals Dashboard",
                "Interactive Games",
                "Progress Tracking",
              ],
            },
          ].map((tech, idx) => (
            <div
              key={idx}
              className="bg-white/5 p-8 rounded-2xl border border-white/10"
            >
              <h3 className="text-2xl font-semibold mb-5 text-accent">
                {tech.title}
              </h3>
              <ul className="space-y-3">
                {tech.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-slate-300 border-b border-white/10 pb-2 last:border-0"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-[5%] max-w-7xl mx-auto" id="team">
        <h2 className="text-center text-4xl mb-12 text-dark font-bold">
          Tim ADIKARA 2025
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              Icon: Icons.Dev,
              title: "Developer Team",
              role: "Hardware & Software Integration",
            },
            {
              Icon: Icons.Design,
              title: "Design Team",
              role: "UI/UX & Product Design",
            },
            {
              Icon: Icons.Research,
              title: "Research Team",
              role: "Medical Research & Testing",
            },
          ].map((member, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 text-center"
            >
              <div className="flex justify-center">
                <member.Icon />
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">
                {member.title}
              </h3>
              <p className="text-slate-500">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-8">
        <p>
          &copy; 2025 NeuroRehab Glove AI - ADIKARA 2025. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
