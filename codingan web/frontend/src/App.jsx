import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { GamesHub } from "./pages/GamesHub";
import { BirdGame } from "./pages/BirdGame";
import { LevelsGame } from "./pages/LevelsGame";
import { FingerPiano } from "./pages/FingerPiano";
import { MemoryPattern } from "./pages/MemoryPattern";
import { FruitCatch } from "./pages/FruitCatch";
import { DailyExerciseDetail } from "./pages/DailyExerciseDetail";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with Layout (Navbar + Footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/games" element={<GamesHub />} />
          <Route
            path="/game/daily-exercise"
            element={<DailyExerciseDetail />}
          />
        </Route>

        {/* Game Routes without Layout (Full screen games) */}
        <Route path="/game/bird" element={<BirdGame />} />
        <Route path="/game/levels" element={<LevelsGame />} />
        <Route path="/game/piano" element={<FingerPiano />} />
        <Route path="/game/memory" element={<MemoryPattern />} />
        <Route path="/game/fruit" element={<FruitCatch />} />
        {/* Alias route for FruitCatch */}
        <Route path="/game/catch" element={<FruitCatch />} />
      </Routes>
    </Router>
  );
}

export default App;
