import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ScrollReveal from "../components/ScrollReveal";
import AnimatedCounter from "../components/AnimatedCounter";
import "../styles/AboutPage.css";

const team = [
  { name: "Ayoub El Mansouri", role: "Fondateur & Rédacteur", avatar: "https://ui-avatars.com/api/?name=Ayoub+El+Mansouri&background=2563EB&color=fff&size=96" },
  { name: "Sara Benali", role: "Rédactrice Technique", avatar: "https://ui-avatars.com/api/?name=Sara+Benali&background=10B981&color=fff&size=96" },
  { name: "Yassine Berrada", role: "Développeur Backend", avatar: "https://ui-avatars.com/api/?name=Yassine+Berrada&background=F59E0B&color=fff&size=96" },
  { name: "Leila Hakim", role: "Designer UI/UX", avatar: "https://ui-avatars.com/api/?name=Leila+Hakim&background=A855F7&color=fff&size=96" },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <Navbar />

      <main>
        <section className="about-hero">
          <div className="container">
            <span className="about-hero-badge">📚 À propos</span>
            <h1>BlogIDSI</h1>
            <p>Partage de connaissances depuis 2024</p>
          </div>
        </section>

        <section className="about-content">
          <div className="container">
            <div className="about-grid">
              <ScrollReveal>
                <div className="about-text">
                  <h2>Notre mission</h2>
                  <p>
                    BlogIDSI est une plateforme dédiée aux développeurs web et aux passionnés de technologies.
                    Nous créons du contenu de qualité sur React, TypeScript, le backend, l'UI/UX et bien plus.
                  </p>
                  <h2>Pourquoi BlogIDSI ?</h2>
                  <p>
                    Parce que le partage de connaissances accélère l'apprentissage. Nos articles sont écrits par
                    des experts du terrain et validés par la communauté.
                  </p>
                  <h2>Notre vision</h2>
                  <p>
                    Devenir la référence francophone pour l'apprentissage du développement web moderne,
                    en offrant un contenu gratuit, accessible et toujours à jour.
                  </p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={150}>
                <div className="about-stats">
                  <div className="stat-card card-glow-border">
                    <span className="stat-number"><AnimatedCounter end={150} suffix="+" /></span>
                    <span className="stat-label">Articles publiés</span>
                  </div>
                  <div className="stat-card card-glow-border">
                    <span className="stat-number"><AnimatedCounter end={25000} suffix="+" duration={3000} /></span>
                    <span className="stat-label">Lecteurs mensuels</span>
                  </div>
                  <div className="stat-card card-glow-border">
                    <span className="stat-number"><AnimatedCounter end={12} /></span>
                    <span className="stat-label">Auteurs contributeurs</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="about-team-section">
          <div className="container">
            <ScrollReveal>
              <div className="team-header">
                <h2>Notre équipe</h2>
                <p>Des passionnés à votre service</p>
              </div>
            </ScrollReveal>
            <div className="team-grid">
              {team.map((member, i) => (
                <ScrollReveal key={member.name} delay={i * 100}>
                  <div className="team-card card-glow-border">
                    <img src={member.avatar} alt={member.name} />
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
