import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import BackToTop from "./components/BackToTop";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/HomePage";
import ArticlesPage from "./pages/ArticlesPage";
import ArticleDetail from "./pages/ArticleDetail";
import CategoriesPage from "./pages/CategoriesPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  return (
    <div className="page-enter" key={location.pathname}>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

function App() {
    return (
        <ThemeProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AppContent />
            <BackToTop />
          </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
