import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import Card3D from "../components/Card3D";
import { getCategories, type Category } from "../api/blog";
import "../styles/CategoriesPage.css";

const categoryColors = ["#2458D8", "#0F8F7B", "#B45309", "#8B5CF6", "#DC2626", "#0891B2"];

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        getCategories()
            .then((data) => {
                if (mounted) setCategories(data.filter((cat) => cat.id !== "all"));
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="categories-page">
            <Navbar />
            <main>
                <section className="categories-hero">
                    <div className="container">
                        <span className="categories-hero-badge">Categories</span>
                        <h1>Explorez nos <span className="gradient-text">categories</span></h1>
                        <p>Trouvez les articles qui correspondent a vos centres d'interet</p>
                    </div>
                </section>

                <section className="categories-grid-section">
                    <div className="container">
                        {loading && <div className="categories-state">Chargement des categories...</div>}

                        {!loading && categories.length === 0 && (
                            <div className="categories-state">
                                Aucune categorie pour le moment. Ajoute une categorie depuis l'espace admin.
                            </div>
                        )}

                        {!loading && categories.length > 0 && (
                            <div className="categories-grid">
                                {categories.map((cat, i) => {
                                    const color = categoryColors[i % categoryColors.length];
                                    return (
                                        <ScrollReveal key={cat.id} delay={i * 80}>
                                            <Card3D strength={5}>
                                                <Link to={`/articles?category=${cat.id}`} className="category-card card-glow-border">
                                                    <div className="category-icon" style={{ backgroundColor: `${color}20`, color }}>
                                                        {cat.icon || "📁"}
                                                    </div>
                                                    <h3>{cat.name}</h3>
                                                    {cat.description && <p className="category-description">{cat.description}</p>}
                                                    <span className="category-count">{cat.count} articles</span>
                                                </Link>
                                            </Card3D>
                                        </ScrollReveal>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
