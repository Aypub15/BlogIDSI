import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Particles from "../components/Particles";
import ButtonRipple from "../components/ButtonRipple";
import { useAuth } from "../auth/authProvider";
import "../styles/AuthPage.css";

type TabType = "login" | "register";

// Icônes
const IconMail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);

const IconLock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);

const IconUser = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="5"/>
        <path d="M20 21a8 8 0 1 0-16 0"/>
    </svg>
);

const IconEye = ({ off }: { off: boolean }) => off ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const IconGoogle = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);

const IconGithub = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#24292e">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
);

export default function AuthPage() {
    const navigate = useNavigate();
    const { login, signup } = useAuth();
    const [tab, setTab] = useState<TabType>("login");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setSubmitting(true);
        setStatus(null);
        try {
            await login(String(form.get("email")), String(form.get("password")));
            navigate("/home", { replace: true });
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Connexion impossible");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const password = String(form.get("password"));
        const confirm = String(form.get("confirmPassword"));
        if (password !== confirm) {
            setStatus("Les mots de passe ne correspondent pas");
            return;
        }

        const name = `${form.get("firstName") || ""} ${form.get("lastName") || ""}`.trim();
        setSubmitting(true);
        setStatus(null);
        try {
            await signup(String(form.get("email")), password, name);
            navigate("/home", { replace: true });
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Création de compte impossible");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSwitchTab = (t: TabType) => {
        setTab(t);
    };

    return (
        <div className="auth-page">
            <div className="page">
                <div className="left-panel">
                    <div className="left-bg" />
                    <Particles count={20} />
                    <div className="left-content">
                        <span className="left-badge">Bienvenue sur notre blog</span>
                        <h1 className="left-title">
                            Rejoignez la<br />communauté <span>BlogIDSI</span>
                        </h1>
                        <p className="left-desc">
                            React, TypeScript, Backend, UI/UX et plusieurs sujets pour améliorer vos compétences en développement web.
                        </p>
                        <div className="left-features">
                            {["Accès à tous les articles exclusifs","Sauvegarde de vos favoris","Newsletter hebdomadaire","Commentaires et interactions"].map(f => (
                                <div className="feature-item" key={f}>
                                    <div className="feature-dot" />
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="right-panel">
                    <div className="form-card">
                        <div className="tab-row">
                            <button className={`tab-btn ${tab === "login" ? "active" : ""}`} onClick={() => handleSwitchTab("login")}>
                                Connexion
                            </button>
                            <button className={`tab-btn ${tab === "register" ? "active" : ""}`} onClick={() => handleSwitchTab("register")}>
                                Créer un compte
                            </button>
                        </div>

                        {tab === "login" ? (
                            <>
                                <div className="form-title">Bon retour 👋</div>
                                <div className="form-subtitle">Pas encore de compte ? <a href="#" onClick={e=>{e.preventDefault();handleSwitchTab("register")}}>Inscrivez-vous</a></div>
                                {status && <div className="auth-status">{status}</div>}
                                <form onSubmit={handleLogin}>
                                    <div className="field">
                                        <label>Adresse e-mail</label>
                                        <div className="input-wrap">
                                            <span className="input-icon"><IconMail /></span>
                                            <input name="email" type="email" placeholder="vous@exemple.com" required />
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label>Mot de passe</label>
                                        <div className="input-wrap">
                                            <span className="input-icon"><IconLock /></span>
                                            <input name="password" type={showPwd?"text":"password"} placeholder="••••••••" required />
                                            <button type="button" className="eye-btn" onClick={()=>setShowPwd(!showPwd)}><IconEye off={showPwd}/></button>
                                        </div>
                                    </div>
                                    <div className="form-options">
                                        <label className="checkbox-label">
                                            <input type="checkbox" />
                                            Se souvenir de moi
                                        </label>
                                        <a href="#" className="forgot-link">Mot de passe oublié ?</a>
                                    </div>
                                    <ButtonRipple type="submit" className="submit-btn" disabled={submitting}>
                                        {submitting ? "Connexion..." : "Se connecter"}
                                    </ButtonRipple>
                                </form>
                                <div className="divider">ou continuer avec</div>
                                <div className="social-row">
                                    <button className="social-btn"><IconGoogle /> Google</button>
                                    <button className="social-btn"><IconGithub /> GitHub</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-title">Créer un compte</div>
                                <div className="form-subtitle">Déjà inscrit ? <a href="#" onClick={e=>{e.preventDefault();handleSwitchTab("login")}}>Se connecter</a></div>
                                {status && <div className="auth-status">{status}</div>}
                                <form onSubmit={handleRegister}>
                                    <div className="field-row">
                                        <div className="field">
                                            <label>Prénom</label>
                                            <div className="input-wrap">
                                                <span className="input-icon"><IconUser /></span>
                                                <input name="firstName" type="text" placeholder="Jean" required />
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label>Nom</label>
                                            <div className="input-wrap">
                                                <span className="input-icon"><IconUser /></span>
                                                <input name="lastName" type="text" placeholder="Dupont" required />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label>Adresse e-mail</label>
                                        <div className="input-wrap">
                                            <span className="input-icon"><IconMail /></span>
                                            <input name="email" type="email" placeholder="vous@exemple.com" required />
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label>Mot de passe</label>
                                        <div className="input-wrap">
                                            <span className="input-icon"><IconLock /></span>
                                            <input name="password" type={showPwd?"text":"password"} placeholder="Minimum 6 caractères" minLength={6} required />
                                            <button type="button" className="eye-btn" onClick={()=>setShowPwd(!showPwd)}><IconEye off={showPwd}/></button>
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label>Confirmer le mot de passe</label>
                                        <div className="input-wrap">
                                            <span className="input-icon"><IconLock /></span>
                                            <input name="confirmPassword" type={showConfirm?"text":"password"} placeholder="Répétez le mot de passe" minLength={6} required />
                                            <button type="button" className="eye-btn" onClick={()=>setShowConfirm(!showConfirm)}><IconEye off={showConfirm}/></button>
                                        </div>
                                    </div>
                                    <div className="form-options" style={{marginBottom:18}}>
                                        <label className="checkbox-label">
                                            <input type="checkbox" />
                                            J'accepte les <a href="#" style={{color:"var(--blue)",marginLeft:4}}>conditions d'utilisation</a>
                                        </label>
                                    </div>
                                    <ButtonRipple type="submit" className="submit-btn" disabled={submitting}>
                                        {submitting ? "Création..." : "Créer mon compte"}
                                    </ButtonRipple>
                                </form>
                                <div className="divider">ou s'inscrire avec</div>
                                <div className="social-row">
                                    <button className="social-btn"><IconGoogle /> Google</button>
                                    <button className="social-btn"><IconGithub /> GitHub</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
