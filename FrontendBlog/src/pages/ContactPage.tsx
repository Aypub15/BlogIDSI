import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import "../styles/ContactPage.css";

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconPhone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconLocation = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(form);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="contact-page">
      <Navbar />
      <main>
        <section className="contact-hero">
          <div className="container">
            <span className="contact-hero-badge">💬 Contact</span>
            <h1>Contactez-nous</h1>
            <p>Une question, une suggestion ? Nous sommes là pour vous répondre.</p>
          </div>
        </section>

        <section className="contact-form-section">
          <div className="container">
            <div className="contact-grid">
              <ScrollReveal>
                <div className="contact-info">
                  <h2>Informations</h2>
                  <div className="info-items">
                    <div className="info-item">
                      <div className="info-icon" style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
                        <IconMail />
                      </div>
                      <div>
                        <span className="info-label">Email</span>
                        <span className="info-value">contact@blogidsi.com</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                        <IconPhone />
                      </div>
                      <div>
                        <span className="info-label">Téléphone</span>
                        <span className="info-value">+212 5XX XXX XXX</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                        <IconLocation />
                      </div>
                      <div>
                        <span className="info-label">Adresse</span>
                        <span className="info-value">Casablanca, Maroc</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#A855F7' }}>
                        <IconClock />
                      </div>
                      <div>
                        <span className="info-label">Disponibilité</span>
                        <span className="info-value">Lun-Ven 9h-18h</span>
                      </div>
                    </div>
                  </div>
                  <div className="contact-social">
                    <span className="contact-social-label">Suivez-nous</span>
                    <div className="social-links">
                      <a href="#" className="social-link" aria-label="Twitter">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                        </svg>
                      </a>
                      <a href="#" className="social-link" aria-label="GitHub">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                        </svg>
                      </a>
                      <a href="#" className="social-link" aria-label="LinkedIn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                          <rect x="2" y="9" width="4" height="12"/>
                          <circle cx="4" cy="4" r="2"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={150}>
                <form onSubmit={handleSubmit} className="contact-form">
                  <h2>Envoyez-nous un message</h2>
                  <div className="form-group">
                    <label>Nom complet</label>
                    <div className="form-input-wrap">
                      <span className="form-input-icon"><IconUser /></span>
                      <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Jean Dupont" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <div className="form-input-wrap">
                      <span className="form-input-icon"><IconMail /></span>
                      <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jean@exemple.com" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea rows={5} required value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Votre message..." />
                  </div>
                  <button type="submit" className="submit-contact">
                    <IconSend /> Envoyer le message
                  </button>
                  {sent && <p className="success-message">✅ Message envoyé avec succès !</p>}
                </form>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
