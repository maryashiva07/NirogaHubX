import { useNavigate } from "react-router-dom";

import "./AboutUs.css";

const AboutUs = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/patient/dashboard");
  };

  return (
    <div className="about-page">
      <header className="about-header">
        <div className="about-logo" onClick={() => navigate("/")}>
          <div className="about-logo-icon">❤</div>

          <div>
            <h2>NirogaHub</h2>
            <span>Healthcare Made Simple</span>
          </div>
        </div>

        <nav className="about-nav">
          <button onClick={() => navigate("/patient/dashboard")}>Home</button>

          <button className="active">About Us</button>

          <button onClick={() => navigate("/patient/profile")}>Profile</button>

          <button onClick={() => navigate("/patient/clinics")}>Clinics</button>
        </nav>

        <button className="about-header-button" onClick={handleGetStarted}>
          Get Started
        </button>
      </header>

      <main>
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="about-badge">ABOUT NIROGAHUB</span>

            <h1>
              Making Healthcare
              <span> Simpler, Faster & Better.</span>
            </h1>

            <p>
              NirogaHub is a healthcare technology platform designed to make
              doctor discovery, appointment management and token-based
              consultations simpler for patients and easier for healthcare
              providers.
            </p>

            <div className="about-hero-actions">
              <button
                className="primary-about-button"
                onClick={handleGetStarted}
              >
                Get Started
              </button>

              <button
                className="secondary-about-button"
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                How It Works
              </button>
            </div>
          </div>

          <div className="about-hero-visual">
            <div className="hero-circle hero-circle-one"></div>

            <div className="hero-circle hero-circle-two"></div>

            <div className="hero-health-card">
              <div className="hero-heart">❤</div>

              <h3>Healthcare</h3>

              <p>
                More accessible.
                <br />
                More organized.
                <br />
                More human.
              </p>

              <div className="hero-mini-stat">
                <span>●</span>
                Patient First
              </div>
            </div>
          </div>
        </section>

        <section className="about-trust-strip">
          <div>
            <strong>Patient First</strong>
            <span>Designed around patient needs</span>
          </div>

          <div>
            <strong>Simple Experience</strong>
            <span>Less waiting, less confusion</span>
          </div>

          <div>
            <strong>Connected Care</strong>
            <span>Patients and doctors together</span>
          </div>

          <div>
            <strong>Privacy Focused</strong>
            <span>Your information matters</span>
          </div>
        </section>

        <section className="about-section about-story">
          <div className="about-section-label">OUR STORY</div>

          <div className="about-two-column">
            <div>
              <h2>
                Healthcare should feel
                <span> simple.</span>
              </h2>

              <p>
                Visiting a doctor should not mean spending unnecessary time
                waiting, making repeated phone calls or struggling to understand
                the appointment process.
              </p>

              <p>
                NirogaHub was created with a simple idea: use technology to
                remove unnecessary complexity from everyday healthcare
                experiences.
              </p>

              <p>
                We are building a platform where patients can discover doctors,
                manage tokens and keep track of their appointments from one
                place, while doctors can manage their patient queues more
                efficiently.
              </p>
            </div>

            <div className="story-highlight">
              <div className="story-highlight-icon">❤</div>

              <h3>Our Core Belief</h3>

              <p>
                Technology should not make healthcare more complicated. It
                should make healthcare easier to access and easier to manage.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section mission-section">
          <div className="about-section-label">WHAT DRIVES US</div>

          <div className="about-section-heading">
            <h2>
              Our Mission & <span>Vision</span>
            </h2>

            <p>
              We are building technology with people at the center of
              healthcare.
            </p>
          </div>

          <div className="mission-grid">
            <div className="mission-card">
              <div className="mission-icon">🎯</div>

              <h3>Our Mission</h3>

              <p>
                To make everyday healthcare interactions simpler, more
                transparent and accessible by connecting patients and healthcare
                providers through easy-to-use technology.
              </p>
            </div>

            <div className="mission-card">
              <div className="mission-icon">🌱</div>

              <h3>Our Vision</h3>

              <p>
                To build a trusted healthcare ecosystem where finding care,
                managing appointments and communicating with healthcare
                providers feels effortless for everyone.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section values-section">
          <div className="about-section-label">OUR VALUES</div>

          <div className="about-section-heading">
            <h2>
              Principles that guide
              <span> NirogaHub</span>
            </h2>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-number">01</div>

              <h3>Patient First</h3>

              <p>
                Every experience starts with understanding what makes healthcare
                easier for patients.
              </p>
            </div>

            <div className="value-card">
              <div className="value-number">02</div>

              <h3>Simplicity</h3>

              <p>
                Healthcare technology should be easy to understand and easy to
                use.
              </p>
            </div>

            <div className="value-card">
              <div className="value-number">03</div>

              <h3>Trust</h3>

              <p>
                We believe transparency and responsible handling of information
                are essential.
              </p>
            </div>

            <div className="value-card">
              <div className="value-number">04</div>

              <h3>Accessibility</h3>

              <p>
                We aim to make useful healthcare technology accessible to people
                and clinics of different sizes.
              </p>
            </div>

            <div className="value-card">
              <div className="value-number">05</div>

              <h3>Innovation</h3>

              <p>
                We continuously explore better ways to solve real healthcare
                problems with technology.
              </p>
            </div>

            <div className="value-card">
              <div className="value-number">06</div>

              <h3>Humanity</h3>

              <p>
                Behind every appointment is a real person, and technology should
                never forget that.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section how-section" id="how-it-works">
          <div className="about-section-label">HOW NIROGAHUB WORKS</div>

          <div className="about-section-heading">
            <h2>
              Healthcare in a few
              <span> simple steps</span>
            </h2>

            <p>
              We are designing the experience to be simple from discovery to
              consultation.
            </p>
          </div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">01</div>

              <div className="step-icon">🔎</div>

              <h3>Find a Doctor</h3>

              <p>
                Discover available doctors and healthcare providers through
                NirogaHub.
              </p>
            </div>

            <div className="step-line"></div>

            <div className="step-card">
              <div className="step-number">02</div>

              <div className="step-icon">🎫</div>

              <h3>Get Your Token</h3>

              <p>
                Choose a doctor and manage your appointment token digitally.
              </p>
            </div>

            <div className="step-line"></div>

            <div className="step-card">
              <div className="step-number">03</div>

              <div className="step-icon">🕐</div>

              <h3>Track Your Turn</h3>

              <p>
                Keep track of your token and appointment status from one place.
              </p>
            </div>

            <div className="step-line"></div>

            <div className="step-card">
              <div className="step-number">04</div>

              <div className="step-icon">❤</div>

              <h3>Get Care</h3>

              <p>
                Reach the clinic prepared and spend less time dealing with
                appointment uncertainty.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section benefits-section">
          <div className="benefits-content">
            <div className="about-section-label">WHY NIROGAHUB</div>

            <h2>
              Built for both
              <span> patients and doctors.</span>
            </h2>

            <p>
              NirogaHub is designed to solve problems on both sides of the
              healthcare experience.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">👨‍⚕️</div>

              <h3>For Doctors</h3>

              <ul>
                <li>Manage patient queues digitally</li>
                <li>Organize appointment tokens</li>
                <li>Maintain clinic information</li>
                <li>Manage availability</li>
                <li>Reduce unnecessary queue confusion</li>
              </ul>

              <button onClick={() => navigate("/doctor")}>
                Doctor Portal →
              </button>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">🧑‍🦽</div>

              <h3>For Patients</h3>

              <ul>
                <li>Discover available doctors</li>
                <li>Manage tokens digitally</li>
                <li>Track appointment status</li>
                <li>View appointment history</li>
                <li>Manage personal profile</li>
              </ul>

              <button onClick={() => navigate("/patient")}>
                Patient Portal →
              </button>
            </div>
          </div>
        </section>

        <section className="about-section privacy-section">
          <div className="privacy-card">
            <div className="privacy-icon">🔒</div>

            <div>
              <div className="about-section-label">TRUST & PRIVACY</div>

              <h2>
                Your information deserves
                <span> responsible handling.</span>
              </h2>

              <p>
                Healthcare information is personal. NirogaHub is designed with
                privacy and responsible data handling in mind. We aim to collect
                and use information only where it is necessary to provide the
                platform's functionality.
              </p>

              <div className="privacy-points">
                <div>
                  <span>✓</span>
                  Secure authentication
                </div>

                <div>
                  <span>✓</span>
                  Protected account access
                </div>

                <div>
                  <span>✓</span>
                  Role-based access
                </div>

                <div>
                  <span>✓</span>
                  Responsible data practices
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section future-section">
          <div className="about-section-heading">
            <div className="about-section-label">OUR FUTURE</div>

            <h2>
              Building the future of
              <span> connected healthcare.</span>
            </h2>

            <p>
              NirogaHub is starting with a simple problem — making doctor visits
              and token management easier. But our long-term vision goes beyond
              appointments.
            </p>
          </div>

          <div className="future-grid">
            <div className="future-card">
              <span>01</span>
              <h3>Smarter Clinics</h3>
              <p>Better digital tools for clinics and healthcare providers.</p>
            </div>

            <div className="future-card">
              <span>02</span>
              <h3>Better Patient Experience</h3>
              <p>
                More convenient ways for patients to manage their healthcare
                journey.
              </p>
            </div>

            <div className="future-card">
              <span>03</span>
              <h3>Connected Healthcare</h3>
              <p>
                Creating a connected ecosystem between patients, doctors and
                clinics.
              </p>
            </div>

            <div className="future-card">
              <span>04</span>
              <h3>Technology for Good</h3>
              <p>
                Using modern technology to solve meaningful healthcare problems.
              </p>
            </div>
          </div>
        </section>

        <section className="about-cta">
          <div className="about-cta-content">
            <span>START YOUR JOURNEY</span>

            <h2>
              Better healthcare starts
              <br />
              with a simpler experience.
            </h2>

            <p>
              Join NirogaHub and experience a more organized way to manage your
              healthcare journey.
            </p>

            <button onClick={handleGetStarted}>
              Get Started with NirogaHub →
            </button>
          </div>
        </section>
      </main>

      <footer className="about-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">❤</div>

              <div>
                <h2>NirogaHub</h2>
                <span>Healthcare Made Simple</span>
              </div>
            </div>

            <p>
              Making everyday healthcare simpler, more accessible and more
              organized through technology.
            </p>
          </div>

          <div className="footer-column">
            <h3>Company</h3>

            <button onClick={() => navigate("/patient/dashboard")}>Home</button>

            <button>About Us</button>

            <button onClick={() => navigate("/patient/dashboard")}>
              Patients
            </button>

            <button onClick={() => navigate("/patient/clinic")}>Clinics</button>
          </div>

          <div className="footer-column">
            <h3>For Patients</h3>

            <button onClick={() => navigate("/patient")}>Find a Doctor</button>

            <button onClick={() => navigate("/patient")}>Get Started</button>

            <button onClick={() => navigate("/patient/history")}>
              Appointment History
            </button>
          </div>

          <div className="footer-column">
            <h3>Support</h3>

            <button>Help Center</button>

            <button>Contact Us</button>

            <button>Privacy Policy</button>

            <button>Terms of Service</button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} NirogaHub. All rights reserved.</p>

          <p>Built with care for better healthcare.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;
