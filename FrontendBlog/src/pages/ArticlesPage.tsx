import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { createArticle, deleteArticle, getArticles, getCategories, type Post, type Category } from "../api/blog";
import { useAuth } from "../auth/authProvider";
import "../styles/ArticlesPage.css";

const sortOptions = [
    { value: "newest", label: "Plus récents" },
    { value: "oldest", label: "Plus anciens" },
    { value: "popular", label: "Populaires (Likes)" },
    { value: "mostCommented", label: "Commentés" },
];

export default function ArticlesPage() {
    const { user, isAdmin } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [articles, setArticles] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState("newest");
    const [likedArticles, setLikedArticles] = useState<number[]>([]);
    const [composeOpen, setComposeOpen] = useState(false);
    const [newPost, setNewPost] = useState({ title: "", content: "", categoryId: "", image: "" });
    const [status, setStatus] = useState<string | null>(null);

    const loadData = () => {
        setLoading(true);
        Promise.all([getArticles(), getCategories()]).then(([articlesData, categoriesData]) => {
            setArticles(articlesData);
            setTrendingPosts([...articlesData].sort((a, b) => b.likes - a.likes).slice(0, 5));
            setCategories(categoriesData);
            setLoading(false);
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    const selectedCategory = searchParams.get("category") || "all";
    const urlSearchQuery = searchParams.get("search") || "";

    const setSelectedCategory = (category: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (category === "all") {
            newParams.delete("category");
        } else {
            newParams.set("category", category);
        }
        setSearchParams(newParams);
    };

    const toggleLike = (e: React.MouseEvent, articleId: number) => {
        e.preventDefault();
        e.stopPropagation();
        setLikedArticles((prev) =>
            prev.includes(articleId)
                ? prev.filter((id) => id !== articleId)
                : [...prev, articleId]
        );
    };

    const clearSearch = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete("search");
        setSearchParams(newParams);
    };

    const filteredArticles = articles
        .filter((article) => {
            const matchesSearch = !urlSearchQuery ||
                article.title.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
                article.description.toLowerCase().includes(urlSearchQuery.toLowerCase());
            const matchesCategory = selectedCategory === "all" ||
                article.category.toLowerCase() === selectedCategory.toLowerCase() ||
                article.categoryId === selectedCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case "oldest":
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case "popular":
                    return b.likes - a.likes;
                case "mostCommented":
                    return b.comments - a.comments;
                default:
                    return 0;
            }
        });

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setStatus("Connectez-vous pour publier un article.");
            return;
        }
        try {
            await createArticle({
                title: newPost.title,
                content: newPost.content,
                image: newPost.image,
                categoryId: newPost.categoryId ? Number(newPost.categoryId) : null,
            });
            setNewPost({ title: "", content: "", categoryId: "", image: "" });
            setComposeOpen(false);
            setStatus("Article publié avec succès.");
            loadData();
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Publication impossible.");
        }
    };

    const handleDeletePost = async (articleId: number) => {
        if (!window.confirm("Supprimer cet article ?")) return;
        try {
            await deleteArticle(articleId);
            setStatus("Article supprimé.");
            loadData();
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Suppression impossible.");
        }
    };

    return (
        <div className="articles-page">
            <Navbar />

            <div className="hybrid-layout">
                {/* LEFT SIDEBAR: Categories / Spaces (Quora/Reddit style) */}
                <aside className="left-sidebar">
                    <div className="sidebar-section-card">
                        <h3 className="sidebar-section-title">Espaces / Catégories</h3>
                        <nav className="sidebar-nav">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    className={`sidebar-nav-item btn-link ${selectedCategory === cat.id ? "active" : ""}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    <span className="space-icon">{cat.icon}</span>
                                    <span className="space-name">{cat.name}</span>
                                    <span className="space-count">{cat.count}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="sidebar-section-card info-card">
                        <h4>Aide à la lecture</h4>
                        <p>Sélectionnez un espace pour filtrer les articles par thématique. Utilisez la barre d'interaction pour aimer ou commenter.</p>
                    </div>
                </aside>

                {/* MIDDLE COLUMN: Feed List */}
                <main className="feed-main">
                    {user && (
                        <div className="composer-card">
                            <div>
                                <h2>Publier un article</h2>
                                <p>{isAdmin ? "Vous publiez comme administrateur." : "Vos articles seront liés à votre compte."}</p>
                            </div>
                            <button className="composer-toggle" onClick={() => setComposeOpen((open) => !open)}>
                                {composeOpen ? "Fermer" : "Ajouter un post"}
                            </button>
                            {composeOpen && (
                                <form className="composer-form" onSubmit={handleCreatePost}>
                                    <input
                                        placeholder="Titre de l'article"
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                        required
                                    />
                                    <select
                                        value={newPost.categoryId}
                                        onChange={(e) => setNewPost({ ...newPost, categoryId: e.target.value })}
                                    >
                                        <option value="">Sans catégorie</option>
                                        {categories.filter((cat) => cat.id !== "all").map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <input
                                        placeholder="Image URL"
                                        value={newPost.image}
                                        onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                                    />
                                    <textarea
                                        placeholder="Contenu de l'article"
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        rows={5}
                                        required
                                    />
                                    <button type="submit" className="composer-submit">Publier</button>
                                </form>
                            )}
                            {status && <p className="feed-status">{status}</p>}
                        </div>
                    )}

                    {/* Header info */}
                    <div className="feed-filter-header">
                        <div className="header-info">
                            <h2 className="feed-header-title">
                                {selectedCategory === "all" ? "Tous les articles" : `Espace : ${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}`}
                            </h2>
                            {urlSearchQuery && (
                                <div className="search-query-badge">
                                    <span>Recherche : "{urlSearchQuery}"</span>
                                    <button onClick={clearSearch} className="clear-search-btn" aria-label="Effacer la recherche">×</button>
                                </div>
                            )}
                        </div>

                        {/* Sort Selector */}
                        <div className="feed-sort-controls">
                            <span className="sort-label">Trier par :</span>
                            <select
                                className="feed-sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Articles List */}
                    <div className="feed-posts-list">
                        {loading ? (
                            <div className="feed-loading-container">
                                <div className="feed-loading-spinner" />
                                <span>Chargement des articles...</span>
                            </div>
                        ) : filteredArticles.length === 0 ? (
                            <div className="no-results-card">
                                <div className="no-results-icon">🔍</div>
                                <h3>Aucun article trouvé</h3>
                                <p>Essayez de modifier votre recherche ou sélectionnez un autre espace dans la barre latérale.</p>
                            </div>
                        ) : (
                            filteredArticles.map((article) => (
                                <article key={article.id} className="feed-post-card">
                                    {/* Author Header */}
                                    <div className="post-author-bar">
                                        <img src={article.authorAvatar} alt={article.author} className="post-author-avatar" />
                                        <div className="post-author-meta">
                                            <span className="post-author-name">{article.author}</span>
                                            <span className="post-dot">•</span>
                                            <span className="post-date">{article.date}</span>
                                        </div>
                                        <span className="post-category-tag">
                                            {article.category}
                                        </span>
                                    </div>

                                    {/* Content Area */}
                                    <Link to={`/article/${article.id}`} className="post-content-link">
                                        <div className="post-body-grid">
                                            <div className="post-text-content">
                                                <h2 className="post-title">{article.title}</h2>
                                                <p className="post-excerpt">{article.description}</p>
                                            </div>
                                            {article.image && (
                                                <div className="post-image-wrapper">
                                                    <img src={article.image} alt={article.title} className="post-image" loading="lazy" />
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Interactive Footer (Reddit / Quora Style) */}
                                    <div className="post-actions-bar">
                                        <div className="action-buttons-group">
                                            <button
                                                className={`feed-action-btn like-btn ${likedArticles.includes(article.id) ? "active-liked" : ""}`}
                                                onClick={(e) => toggleLike(e, article.id)}
                                            >
                                                <svg className="action-icon" width="16" height="16" viewBox="0 0 24 24" fill={likedArticles.includes(article.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                                </svg>
                                                <span>{article.likes + (likedArticles.includes(article.id) ? 1 : 0)}</span>
                                            </button>

                                            <Link to={`/article/${article.id}#comments`} className="feed-action-btn comment-btn">
                                                <svg className="action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                                </svg>
                                                <span>{article.comments}</span>
                                            </Link>
                                        </div>

                                        <div className="action-buttons-group">
                                            <span className="read-time-indicator">{article.readTime} min de lecture</span>
                                            {article.canDelete && (
                                                <button className="feed-action-btn danger-btn" onClick={() => handleDeletePost(article.id)}>
                                                    Supprimer
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </main>

                {/* RIGHT SIDEBAR: Trending (Forbes style) */}
                <aside className="right-sidebar">
                    <div className="sidebar-section-card forbes-trending">
                        <h3 className="sidebar-section-title">Les plus populaires</h3>
                        <div className="trending-list">
                            {trendingPosts.map((post, idx) => (
                                <Link key={post.id} to={`/article/${post.id}`} className="trending-item">
                                    <span className="trending-number">{idx + 1}</span>
                                    <div className="trending-item-content">
                                        <span className="trending-category">{post.category}</span>
                                        <h4 className="trending-title">{post.title}</h4>
                                        <span className="trending-author">Par {post.author}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            <Footer />
        </div>
    );
}
