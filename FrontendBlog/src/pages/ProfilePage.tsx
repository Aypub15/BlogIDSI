import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    createCategory,
    deleteArticle,
    deleteCategory,
    deleteUser,
    getArticles,
    getCategories,
    getUsers,
    type Category,
    type Post,
} from "../api/blog";
import { useAuth } from "../auth/authProvider";
import type { ApiUser } from "../api/client";
import "../styles/ProfilePage.css";

const IconArticle = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const IconShield = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const CATEGORY_ICON_OPTIONS = ["📁", "💻", "⚛️", "📘", "⚙️", "🎨", "☁️", "🔐", "🧠", "🚀", "📱", "🗄️"];

export default function ProfilePage() {
    const { user, isAdmin, changePassword } = useAuth();
    const [activeTab, setActiveTab] = useState<"posts" | "security" | "admin">("posts");
    const [posts, setPosts] = useState<Post[]>([]);
    const [users, setUsers] = useState<ApiUser[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "", icon: "📁" });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const loadProfileData = async () => {
        const allPosts = await getArticles();
        setPosts(isAdmin ? allPosts : allPosts.filter((post) => post.authorId === user?.id));
        const allCategories = await getCategories();
        setCategories(allCategories.filter((category) => category.id !== "all"));
        if (isAdmin) {
            setUsers(await getUsers());
        }
    };

    useEffect(() => {
        if (user) loadProfileData();
    }, [user, isAdmin]);

    const handleDeletePost = async (id: number) => {
        if (!window.confirm("Supprimer cet article ?")) return;
        try {
            await deleteArticle(id);
            setStatus("Article supprimé.");
            await loadProfileData();
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Suppression impossible.");
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createCategory(categoryForm);
            setCategoryForm({ name: "", description: "", icon: "📁" });
            setStatus("Catégorie ajoutée.");
            await loadProfileData();
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Création de catégorie impossible.");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!window.confirm("Supprimer cette catégorie ?")) return;
        try {
            await deleteCategory(id);
            setStatus("Catégorie supprimée.");
            await loadProfileData();
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Suppression de catégorie impossible.");
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm("Supprimer cet utilisateur et ses contenus ?")) return;
        try {
            await deleteUser(id);
            setStatus("Utilisateur supprimé.");
            await loadProfileData();
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Suppression utilisateur impossible.");
        }
    };

    const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setStatus("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }
        setPasswordSubmitting(true);
        setStatus(null);
        try {
            await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setStatus("Mot de passe change avec succes.");
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Changement de mot de passe impossible.");
        } finally {
            setPasswordSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="profile-page">
                <Navbar />
                <main className="profile-details-section">
                    <div className="container">
                        <div className="profile-empty">
                            <h1>Connexion requise</h1>
                            <p>Connectez-vous pour gérer vos articles et commentaires.</p>
                            <Link to="/login" className="settings-save-btn">Se connecter</Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Navbar />

            <main>
                <div className="profile-cover">
                    <div className="profile-cover-gradient" />
                    <div className="container">
                        <div className="profile-header">
                            <div className="profile-avatar-wrapper">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2458D8&color=fff&size=128`}
                                    alt={user.name}
                                    className="profile-avatar"
                                />
                            </div>
                            <div className="profile-info">
                                <h1 className="profile-name">{user.name}</h1>
                                <p className="profile-email">{user.email}</p>
                                <p className="profile-bio">
                                    {isAdmin ? "Administrateur de la plateforme BlogIDSI." : "Utilisateur BlogIDSI, capable de publier et commenter."}
                                </p>
                                <div className="profile-meta">
                                    <span>Rôle : {user.role}</span>
                                    <span>ID : {user.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="profile-stats-section">
                    <div className="container">
                        <div className="profile-stats-grid">
                            <div className="profile-stat-card">
                                <IconArticle />
                                <span className="profile-stat-number">{posts.length}</span>
                                <span className="profile-stat-label">{isAdmin ? "Articles plateforme" : "Mes articles"}</span>
                            </div>
                            <div className="profile-stat-card">
                                <IconShield />
                                <span className="profile-stat-number">{user.role}</span>
                                <span className="profile-stat-label">Permission active</span>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="profile-details-section">
                    <div className="container">
                        <div className="profile-tabs">
                            <button className={`profile-tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>
                                Articles
                            </button>
                            <button className={`profile-tab ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>
                                Securite
                            </button>
                            {isAdmin && (
                                <button className={`profile-tab ${activeTab === "admin" ? "active" : ""}`} onClick={() => setActiveTab("admin")}>
                                    Administration
                                </button>
                            )}
                        </div>

                        {status && <div className="profile-status">{status}</div>}

                        {activeTab === "posts" && (
                            <div className="profile-saved">
                                <h2>{isAdmin ? "Articles de la plateforme" : "Mes articles"}</h2>
                                <div className="saved-list">
                                    {posts.map((post) => (
                                        <div key={post.id} className="saved-item admin-row">
                                            <Link to={`/article/${post.id}`} className="saved-item-content">
                                                <strong>{post.title}</strong>
                                                <span>{post.author} · {post.date}</span>
                                            </Link>
                                            <button className="admin-danger-btn" onClick={() => handleDeletePost(post.id)}>
                                                Supprimer
                                            </button>
                                        </div>
                                    ))}
                                    {posts.length === 0 && <p className="profile-muted">Aucun article pour le moment.</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === "security" && (
                            <div className="profile-settings">
                                <h2>Changer le mot de passe</h2>
                                <form className="settings-form" onSubmit={handleChangePassword}>
                                    <div className="settings-field">
                                        <label>Mot de passe actuel</label>
                                        <input
                                            type="password"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                    <div className="settings-row">
                                        <div className="settings-field">
                                            <label>Nouveau mot de passe</label>
                                            <input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                minLength={6}
                                                required
                                            />
                                        </div>
                                        <div className="settings-field">
                                            <label>Confirmer le nouveau mot de passe</label>
                                            <input
                                                type="password"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                minLength={6}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button className="settings-save-btn" disabled={passwordSubmitting}>
                                        {passwordSubmitting ? "Modification..." : "Changer le mot de passe"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === "admin" && isAdmin && (
                            <div className="admin-grid">
                                <section className="admin-panel">
                                    <h2>Ajouter une catégorie</h2>
                                    <form className="admin-form" onSubmit={handleCreateCategory}>
                                        <input
                                            placeholder="Nom"
                                            value={categoryForm.name}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                            required
                                        />
                                        <div className="category-icon-field">
                                            <label>Icone de la categorie</label>
                                            <div className="category-icon-picker">
                                                {CATEGORY_ICON_OPTIONS.map((icon) => (
                                                    <button
                                                        key={icon}
                                                        type="button"
                                                        className={`category-icon-option ${categoryForm.icon === icon ? "active" : ""}`}
                                                        onClick={() => setCategoryForm({ ...categoryForm, icon })}
                                                        title={`Choisir ${icon}`}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                placeholder="Icone personnalisee"
                                                value={categoryForm.icon}
                                                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Description"
                                            value={categoryForm.description}
                                            onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                        />
                                        <button className="settings-save-btn">Ajouter</button>
                                    </form>

                                    <h3>Catégories</h3>
                                    <div className="admin-list">
                                        {categories.map((category) => (
                                            <div key={category.id} className="admin-row">
                                                <span>{category.icon} {category.name}</span>
                                                <button className="admin-danger-btn" onClick={() => handleDeleteCategory(category.id)}>
                                                    Supprimer
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="admin-panel">
                                    <h2>Utilisateurs</h2>
                                    <div className="admin-list">
                                        {users.map((item) => (
                                            <div key={item.id} className="admin-row">
                                                <span>{item.name} · {item.email} · {item.role}</span>
                                                <button
                                                    className="admin-danger-btn"
                                                    disabled={item.id === user.id}
                                                    onClick={() => handleDeleteUser(item.id)}
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}