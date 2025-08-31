import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AnalyzePage from "./pages/AnalyzePage";
import ResultPage from "./pages/ResultPage";
import GalleryPage from "./pages/GalleryPage";
import GitHubGallery from "./pages/GitHubGallery";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/github-gallery/:username" element={<GitHubGallery />} />
      </Routes>
    </Router>
  );
}
