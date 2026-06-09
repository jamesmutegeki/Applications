import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/layout";
import Home from "./pages/home";
import About from "./pages/about";
import PracticeAreas from "./pages/practice-areas";
import Team from "./pages/team";
import Blog from "./pages/blog";
import Contact from "./pages/contact";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="practice-areas" element={<PracticeAreas />} />
        <Route path="practice-areas/:slug" element={<PracticeAreas />} />
        <Route path="team" element={<Team />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<Blog />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}
