import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { GamesHub } from "./pages/GamesHub";
import { BirdGame } from "./pages/BirdGame";
import { LevelsGame } from "./pages/LevelsGame";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/games" element={<GamesHub />} />
          <Route path="/game/bird" element={<BirdGame />} />
          <Route path="/game/levels" element={<LevelsGame />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
