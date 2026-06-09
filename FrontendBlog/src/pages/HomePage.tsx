import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getArticles, getCategories, type Post, type Category } from "../api/blog";
import "../styles/HomePage.css";

function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getArticles(), getCategories()]).then(([postsData, categoriesData]) => {
            setPosts(postsData);
            setTrendingPosts([...postsData].sort((a, b) => b.likes - a.likes).slice(0, 5));
            setCategories(categoriesData.filter(c => c.id !== "all"));
            setLoading(false);
        });
    }, []);

    return (
        <div className="home-page">
            <Navbar />

            <div className="hybrid-layout">
                {/* LEFT SIDEBAR: Categories / Spaces (Quora/Reddit style) */}
                <aside className="left-sidebar">
                    <div className="sidebar-section-card">
                        <h3 className="sidebar-section-title">Espaces populaires</h3>
                        <nav className="sidebar-nav">
                            <Link to="/articles" className="sidebar-nav-item">
                                <span className="space-icon">📚</span>
                                <span className="space-name">Voir tous les articles</span>
                            </Link>
                            {categories.map((cat) => (
                                <Link key={cat.id} to={`/articles?category=${cat.id}`} className="sidebar-nav-item">
                                    <span className="space-icon">{cat.icon}</span>
                                    <span className="space-name">{cat.name}</span>
                                    <span className="space-count">{cat.count}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="sidebar-section-card promo-card">
                        <h4>Partagez vos connaissances</h4>
                        <p>Découvrez, apprenez et contribuez aux sujets technologiques de pointe.</p>
                        <Link to="/profile" className="promo-btn">Mon Profil</Link>
                    </div>
                </aside>

                {/* MIDDLE COLUMN: Main Feed (Reddit/Quora style feed, Forbes style articles) */}
                <main className="feed-main">
                    {/* Welcome Editorial Banner */}
                    <header className="editorial-hero">
                        <span className="editorial-eyebrow">À LA UNE SUR BLOGIDSI</span>
                        <h1 className="editorial-title">WELCOME TO OUR BLOG</h1>
                    </header>

                    {/* Feed Posts */}
                    <div className="feed-posts-list">
                        {loading ? (
                            <div className="feed-loading-container">
                                <div className="feed-loading-spinner" />
                                <span>Chargement de votre flux...</span>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <article key={post.id} className="feed-post-card">
                                    {/* Author Header */}
                                    <div className="post-author-bar">
                                        <img src={post.authorAvatar} alt={post.author} className="post-author-avatar" />
                                        <div className="post-author-meta">
                                            <span className="post-author-name">{post.author}</span>
                                            <span className="post-dot">•</span>
                                            <span className="post-date">{post.date}</span>
                                        </div>
                                        <Link to={`/articles?category=${post.category.toLowerCase()}`} className="post-category-tag">
                                            {post.category}
                                        </Link>
                                    </div>

                                    {/* Content Area */}
                                    <Link to={`/article/${post.id}`} className="post-content-link">
                                        <div className="post-body-grid">
                                            <div className="post-text-content">
                                                <h2 className="post-title">{post.title}</h2>
                                                <p className="post-excerpt">{post.description}</p>
                                            </div>
                                            {post.image && (
                                                <div className="post-image-wrapper">
                                                    <img src={post.image} alt={post.title} className="post-image" loading="lazy" />
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Interactive Footer (Reddit / Quora Style) */}
                                    <div className="post-actions-bar">
                                        <div className="action-buttons-group">
                                            <button className="feed-action-btn like-btn">
                                                <svg className="action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                                </svg>
                                                <span>{post.likes}</span>
                                            </button>

                                            <Link to={`/article/${post.id}#comments`} className="feed-action-btn comment-btn">
                                                <svg className="action-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                                </svg>
                                                <span>{post.comments}</span>
                                            </Link>
                                        </div>

                                        <div className="action-buttons-group">
                                            <span className="read-time-indicator">{post.readTime} min de lecture</span>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </main>

                {/* RIGHT SIDEBAR: Forbes style Trending, Quora style Who to Follow */}
                <aside className="right-sidebar">
                    <div className="sidebar-section-card forbes-trending">
                        <h3 className="sidebar-section-title">Les plus lus</h3>
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

                    <div className="sidebar-section-card contributors-card">
                        <h3 className="sidebar-section-title">Auteurs à suivre</h3>
                        <div className="contributors-list">
                            <div className="contributor-item">
                                <img src="https://ui-avatars.com/api/?name=Ayoub+El+Mansouri&background=2563EB&color=fff&size=32" alt="Avatar" className="contributor-avatar" />
                                <div className="contributor-info">
                                    <span className="contributor-name">Ayoub El Mansouri</span>
                                    <span className="contributor-bio">Tech Lead & Passionné React</span>
                                </div>
                            </div>
                            <div className="contributor-item">
                                <img src="https://ui-avatars.com/api/?name=Sara+Benali&background=10B981&color=fff&size=32" alt="Avatar" className="contributor-avatar" />
                                <div className="contributor-info">
                                    <span className="contributor-name">Sara Benali</span>
                                    <span className="contributor-bio">Ingénieure Web & TS Enthusiast</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <Footer />
        </div>
    );
}

export default Home;
