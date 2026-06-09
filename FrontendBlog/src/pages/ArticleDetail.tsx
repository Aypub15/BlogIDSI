import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import ReadingProgress from "../components/ReadingProgress";
import {
    createComment,
    deleteArticle,
    deleteComment,
    getArticleById,
    getArticleComments,
    getArticles,
    type CommentType,
    type Post,
} from "../api/blog";
import { useAuth } from "../auth/authProvider";
import "../styles/ArticleDetail.css";

type Article = Omit<Post, "comments"> & {
    commentsCount: number;
    comments: CommentType[];
    tags: string[];
    authorBio?: string;
};

const IconHeart = ({ filled }: { filled?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
);

const IconBookmark = ({ saved }: { saved?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
);

const IconShare = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
);

const IconClock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>
);

const IconTag = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
);

const IconArrowLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
    </svg>
);

const getSimilarArticles = (currentId: number, category: string, allPosts: Post[]): Post[] => {
    return allPosts
        .filter((article) => article.id !== currentId && article.category.toLowerCase() === category.toLowerCase())
        .slice(0, 2);
};

export default function ArticleDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [article, setArticle] = useState<Article | null>(null);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState<CommentType[]>([]);
    const [similarArticles, setSimilarArticles] = useState<Post[]>([]);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getArticleById(Number(id)),
            getArticles(),
            getArticleComments(Number(id)),
        ]).then(([fetched, all, fetchedComments]) => {
            if (fetched) {
                const mapped: Article = {
                    ...fetched,
                    commentsCount: fetched.comments,
                    comments: fetchedComments,
                    tags: [fetched.category],
                    authorBio: "Auteur passionné.",
                };
                setArticle(mapped);
                setComments(mapped.comments);
                setSimilarArticles(getSimilarArticles(mapped.id, mapped.category, all));
            }
            setLoading(false);
        });

        window.scrollTo(0, 0);
    }, [id]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article?.title,
                text: article?.description,
                url: window.location.href,
            });
        } else {
            setShowShareMenu(!showShareMenu);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href);
        setShowShareMenu(false);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) {
            setStatus("Connectez-vous pour commenter.");
            return;
        }

        try {
            const comment = await createComment(Number(id), newComment);
            setComments([...comments, comment]);
            setNewComment("");
            setStatus(null);
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Commentaire impossible.");
        }
    };

    const handleDeleteArticle = async () => {
        if (!article || !window.confirm("Supprimer cet article ?")) return;
        try {
            await deleteArticle(article.id);
            navigate("/articles", { replace: true });
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Suppression impossible.");
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!window.confirm("Supprimer ce commentaire ?")) return;
        try {
            await deleteComment(commentId);
            setComments(comments.filter((comment) => comment.id !== commentId));
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Suppression du commentaire impossible.");
        }
    };

    const handleGoToArticles = () => navigate("/articles");

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Chargement de l'article...</p>
                </div>
                <Footer />
            </>
        );
    }

    if (!article) {
        return (
            <>
                <Navbar />
                <div className="not-found-container">
                    <div className="not-found-content">
                        <h1>404</h1>
                        <p>Article non trouvé</p>
                        <button onClick={handleGoToArticles} className="back-to-articles">
                            Retour aux articles
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <div className="article-detail-page">
            <ReadingProgress />
            <Navbar />

            <main>
                <div className="article-nav">
                    <div className="container">
                        <button onClick={handleGoToArticles} className="back-button">
                            <IconArrowLeft />
                            Retour aux articles
                        </button>
                    </div>
                </div>

                <ScrollReveal>
                    <div className="article-container">
                        <div className="container">
                            <div className="article-header">
                                <Link to={`/articles?category=${article.category.toLowerCase()}`} className="article-category">
                                    {article.category}
                                </Link>
                                <h1 className="article-title">{article.title}</h1>

                                <div className="article-meta">
                                    <div className="author-section">
                                        <img src={article.authorAvatar} alt={article.author} className="author-avatar-large" />
                                        <div className="author-details">
                                            <span className="author-name">{article.author}</span>
                                            <div className="meta-info">
                                                <span className="read-time">
                                                    <IconClock /> {article.readTime} min de lecture
                                                </span>
                                                <span className="publish-date">Publié le {article.date}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="article-actions">
                                        <button className={`action-btn ${liked ? "active" : ""}`} onClick={() => setLiked(!liked)}>
                                            <IconHeart filled={liked} />
                                            <span>{article.likes + (liked ? 1 : 0)}</span>
                                        </button>
                                        <button className={`action-btn ${saved ? "active" : ""}`} onClick={() => setSaved(!saved)}>
                                            <IconBookmark saved={saved} />
                                        </button>
                                        <div className="share-wrapper">
                                            <button className="action-btn" onClick={handleShare}>
                                                <IconShare />
                                            </button>
                                            {showShareMenu && (
                                                <div className="share-menu">
                                                    <button onClick={copyToClipboard}>Copier le lien</button>
                                                </div>
                                            )}
                                        </div>
                                        {article.canDelete && (
                                            <button className="action-btn danger-action" onClick={handleDeleteArticle}>
                                                Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="article-image-main">
                                <img src={article.image} alt={article.title} />
                            </div>

                            <div className="article-content-main">
                                <div className="content-wrapper">
                                    <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content || "" }} />

                                    <div className="article-tags">
                                        <IconTag />
                                        {article.tags.map((tag) => (
                                            <Link key={tag} to={`/articles?category=${tag.toLowerCase()}`} className="tag">
                                                #{tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <div className="article-sidebar">
                                    <div className="author-card">
                                        <img src={article.authorAvatar} alt={article.author} />
                                        <h3>{article.author}</h3>
                                        <p>{article.authorBio}</p>
                                        <button className="follow-btn">Voir le profil</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal delay={100}>
                    <section className="comments-section">
                        <div className="container">
                            <h2>Commentaires ({comments.length})</h2>

                            <form onSubmit={handleAddComment} className="comment-form">
                                {status && <p className="comment-status">{status}</p>}
                                <textarea
                                    placeholder={user ? "Partagez votre avis sur cet article..." : "Connectez-vous pour publier un commentaire"}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={4}
                                    disabled={!user}
                                />
                                <button type="submit" className="submit-comment-btn" disabled={!user}>
                                    Publier le commentaire
                                </button>
                            </form>

                            <div className="comments-list">
                                {comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="comment-card">
                                            <img src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.author}&background=64748B&color=fff`} alt={comment.author} />
                                            <div className="comment-content">
                                                <div className="comment-header">
                                                    <strong>{comment.author}</strong>
                                                    <span>{comment.date}</span>
                                                </div>
                                                <p>{comment.content}</p>
                                                <button className="comment-like-btn">
                                                    <IconHeart filled={false} /> {comment.likes}
                                                </button>
                                                {(comment.canDelete || isAdmin) && (
                                                    <button className="comment-like-btn danger-comment" onClick={() => handleDeleteComment(comment.id)}>
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-comments">
                                        <p>Soyez le premier à commenter cet article !</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </ScrollReveal>

                {similarArticles.length > 0 && (
                    <ScrollReveal delay={200}>
                        <section className="similar-articles">
                            <div className="container">
                                <h2>Articles similaires</h2>
                                <div className="similar-grid">
                                    {similarArticles.map((similar) => (
                                        <Link to={`/article/${similar.id}`} key={similar.id} className="similar-card">
                                            <img src={similar.image} alt={similar.title} />
                                            <div className="similar-content">
                                                <span className="similar-category">{similar.category}</span>
                                                <h3>{similar.title}</h3>
                                                <p>{similar.description.substring(0, 100)}...</p>
                                                <div className="similar-meta">
                                                    <span>{similar.readTime} min</span>
                                                    <span>{similar.date}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </ScrollReveal>
                )}
            </main>

            <Footer />
        </div>
    );
}
