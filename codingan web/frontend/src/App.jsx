import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { GamesHub } from "./pages/GamesHub";
import { BirdGame } from "./pages/BirdGame";
import { LevelsGame } from "./pages/LevelsGame";
import { DailyExerciseDetail } from "./pages/DailyExerciseDetail";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/games" element={<GamesHub />} />
          <Route path="/game/bird" element={<BirdGame />} />
          <Route path="/game/levels" element={<LevelsGame />} />
          <Route path="/game/daily-exercise" element={<DailyExerciseDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
