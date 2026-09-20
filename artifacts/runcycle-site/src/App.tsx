import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowUpRight,
  Bot,
  Check,
  FileText,
  Menu,
  Sparkle,
  X,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('top');
  const [motionReady, setMotionReady] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    () => new Set(['top', 'features']),
  );
  const heroImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setMotionReady(true);

    const sections = ['top', 'features', 'product', 'pricing', 'about', 'contact']
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target instanceof HTMLElement) {
          const id = visible[0].target.id;
          setActiveSection(id);
          setVisibleSections((current) => {
            const next = new Set(current);
            next.add(id);
            return next;
          });
        }
      },
      { rootMargin: '-18% 0px -58% 0px', threshold: [0.08, 0.2, 0.45] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const image = heroImageRef.current;
    if (!image || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const updateParallax = () => {
      const scrollOffset = Math.min(window.scrollY * 0.14, 52);
      image.style.setProperty('--scroll-y', `${scrollOffset}px`);
      frame = 0;
    };
    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToSection = (href: string, focusWaitlist = false) => {
    const target = document.querySelector<HTMLElement>(href);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', href);
    setMenuOpen(false);

    if (focusWaitlist) {
      window.setTimeout(() => {
        document.getElementById('waitlist-email')?.focus();
      }, 650);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: waitlistEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    scrollToSection(href, href === '#contact');
  };

  const handleHeroPointerMove = (event: MouseEvent<HTMLDivElement>) => {
    const image = heroImageRef.current;
    if (!image || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    image.style.setProperty('--pointer-x', `${x * -10}px`);
    image.style.setProperty('--pointer-y', `${y * -7}px`);
    image.style.setProperty('--image-scale', '1.045');
  };

  const resetHeroPointer = () => {
    if (!heroImageRef.current) return;
    heroImageRef.current.style.setProperty('--pointer-x', '0px');
    heroImageRef.current.style.setProperty('--pointer-y', '0px');
    heroImageRef.current.style.setProperty('--image-scale', '1.001');
  };

  const sectionClass = (id: string) =>
    `${motionReady ? 'reveal' : ''} ${visibleSections.has(id) ? 'is-visible' : ''}`;

  const productSteps = [
    { icon: <FileText size={15} strokeWidth={1.7} />, label: 'Your knowledge becomes instructions' },
    { icon: <Sparkle size={15} strokeWidth={1.7} />, label: 'Your instructions become skills' },
    { icon: <Bot size={15} strokeWidth={1.7} />, label: 'Your skills power your AI' },
  ];

  return (
    <main className={`site-shell ${motionReady ? 'motion-ready' : ''}`}>
      <header className={`site-header ${activeSection !== 'top' ? 'is-scrolled' : ''}`} data-testid="header-navigation">
        <a className="wordmark" href="#top" data-testid="link-wordmark">
          <Sparkle size={15} strokeWidth={2.8} aria-hidden="true" />
          <span>Edison</span>
        </a>

        <nav className={`desktop-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {[
            ['Features', '#features'],
            ['Product', '#product'],
            ['MVP', '#pricing'],
            ['Vision', '#about'],
            ['Waitlist', '#contact'],
          ].map(([label, href]) => (
            <a
              href={href}
              key={label}
              className={activeSection === href.slice(1) ? 'is-active' : ''}
              onClick={(event) => handleNavClick(event, href)}
              data-testid={`link-nav-${label.toLowerCase()}`}
            >
              {label}
            </a>
          ))}
        </nav>

        <button
          className="header-install"
          type="button"
          onClick={() => scrollToSection('#contact', true)}
          data-testid="button-header-install"
        >
          Join the waitlist
        </button>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
          data-testid="button-mobile-menu"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      <div id="top" className="page-content">
        <section className="hero" aria-labelledby="hero-title">
          <div
            className="hero-image-wrap"
            onMouseMove={handleHeroPointerMove}
            onMouseLeave={resetHeroPointer}
            data-testid="image-hero-architecture"
          >
            <img
              ref={heroImageRef}
              className="hero-image"
              src="/images/hero-architecture.png"
              alt="A sunlit classical arcade opening onto the sea"
            />
            <div className="image-caption">Teach it once. Let it work.</div>
          </div>
          <div className="hero-copy">
            <h1 id="hero-title" data-testid="text-hero-title">
              Give your AI a brain
              <br />
              for your business.
            </h1>
            <div className="hero-proof">
              <p data-testid="text-hero-description">
                Edison turns your company's scattered knowledge into AI skills that can understand your rules, follow your processes, and get work done.
              </p>
              <div className="hero-actions">
                <button
                  className="button button-dark"
                  type="button"
                  onClick={() => scrollToSection('#contact', true)}
                  data-testid="button-hero-install"
                >
                  <Sparkle size={13} aria-hidden="true" />
                  Join the waitlist
                </button>
                <button
                  className="button button-light"
                  type="button"
                  onClick={() => scrollToSection('#product')}
                  data-testid="button-hero-trial"
                >
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="logo-strip" aria-label="What Edison brings together" data-testid="section-logo-strip">
          <span className="logo ebay">Documents</span>
          <span className="logo cal">Processes</span>
          <span className="logo symbol symbol-lines" aria-label="Knowledge">⌁</span>
          <span className="logo stripe">Rules</span>
          <span className="logo godaddy"><span className="go-mark">◌</span> Decisions</span>
          <span className="logo symbol symbol-loop" aria-label="Team knowledge">∞</span>
          <span className="logo inflection">AI Skills</span>
          <span className="logo aws">Agents</span>
        </section>

        <section className={`editorial-section feature-section ${sectionClass('features')}`} id="features" data-testid="section-features">
          <div className="eyebrow">01 / Features</div>
          <div className="feature-grid">
            <h2>Your company<br /><em>already knows.</em></h2>
            <div className="feature-intro">
              <p className="section-lede">Your best knowledge is already somewhere — in emails, Slack, documents, support tickets, databases, and inside the heads of your team.</p>
              <a className="text-link" href="#product" data-testid="link-features-product">
                Meet Edison <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
          <div className="feature-list">
            {[
              ['Capture Knowledge', 'Bring your company’s important information into one place: documents, processes, rules, decisions, and team knowledge.'],
              ['Build AI Skills', 'Turn that knowledge into clear, reusable instructions that AI agents can understand and use.'],
              ['Define Rules', 'Tell your AI what it can do, what it cannot do, and when it should involve a human.'],
            ].map(([title, text], index) => (
              <article className="feature-row" tabIndex={0} key={title} data-testid={`card-feature-${index + 1}`}>
                <span className="feature-number">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <ArrowUpRight size={16} aria-hidden="true" />
              </article>
            ))}
          </div>
        </section>

        <section className={`product-section ${sectionClass('product')}`} id="product" data-testid="section-product">
          <div className="product-graphic" aria-hidden="true">
            <span className="product-graphic-orbit orbit-one" />
            <span className="product-graphic-orbit orbit-two" />
            <span className="product-graphic-core"><Sparkle size={16} /></span>
          </div>
          <div className="product-statement">
            <div className="eyebrow">02 / Product</div>
            <h2>Meet<br /><em>Edison.</em></h2>
          </div>
          <div className="product-notes">
            <p>Edison is building the knowledge layer for business AI. It takes the knowledge your company already has and turns it into structured AI Skills that agents can understand and use.</p>
            <div className="product-detail" aria-label="How Edison works">
              {productSteps.map(({ icon, label }) => (
                <span className="product-detail-item" key={label}>
                  <span className="product-detail-icon">{icon}</span>
                  <span>{label}</span>
                  <ArrowUpRight size={14} className="product-detail-arrow" aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className={`pricing-section ${sectionClass('pricing')}`} id="pricing" data-testid="section-pricing">
          <div className="eyebrow">03 / MVP</div>
          <div className="pricing-content">
            <h2>Turn knowledge<br />into <em>skills.</em></h2>
            <div className="pricing-card">
              <div>
                <span className="pricing-label">The Edison MVP</span>
                <p className="pricing-copy">We’re starting with one simple goal: turn company knowledge into AI-ready skills.</p>
              </div>
              <button className="button button-dark" type="button" onClick={() => scrollToSection('#contact', true)} data-testid="button-pricing-trial">
                Join the waitlist <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </section>

        <section className={`about-section ${sectionClass('about')}`} id="about" data-testid="section-about">
          <div className="about-mark"><Sparkle size={23} strokeWidth={2.2} aria-hidden="true" /></div>
          <div>
            <div className="eyebrow">04 / Vision</div>
            <h2>From “Ask someone”<br /><em>to “Let AI handle it.”</em></h2>
          </div>
          <p>Today, your team finds information, understands rules, and takes action. With Edison, your AI agent gets the context it needs before it acts — making the knowledge your team has built usable by the AI working alongside them.</p>
        </section>

        <section className={`contact-section ${sectionClass('contact')}`} id="contact" data-testid="section-contact">
          <div className="eyebrow">05 / Waitlist</div>
          <div className="contact-cta">
            <div className="contact-copy">
              <h2>Give your AI<br /><em>a brain.</em></h2>
              <p>Join Edison from the beginning. Get early access as we turn your company’s knowledge into AI skills that actually work.</p>
            </div>
            {!submitted ? (
              <form className="waitlist-form" onSubmit={handleSubmit} data-testid="form-waitlist">
                <label className="sr-only" htmlFor="waitlist-email">Work email</label>
                <div className="waitlist-form-row">
                  <input
                    id="waitlist-email"
                    name="email"
                    type="email"
                    value={waitlistEmail}
                    onChange={(event) => setWaitlistEmail(event.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    required
                    data-testid="input-waitlist-email"
                  />
                  <button className="button button-dark" type="submit" disabled={isSubmitting} data-testid="button-waitlist-submit">
                    {isSubmitting ? 'Joining...' : <>Join the waitlist <ArrowUpRight size={14} /></>}
                  </button>
                </div>
                {submitError ? (
                  <p className="waitlist-note" style={{ color: '#ef4444' }}>{submitError}</p>
                ) : (
                  <span className="waitlist-note">No complicated setup. No sales pitch. Just early access.</span>
                )}
              </form>
            ) : (
              <div className="waitlist-success" role="status" data-testid="waitlist-success">
                <span className="waitlist-success-icon"><Check size={16} /></span>
                <div>
                  <strong>You’re on the list.</strong>
                  <p>We’ll be in touch shortly. Thanks for joining Edison from the beginning.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <footer className="site-footer">
          <a className="wordmark" href="#top" data-testid="link-footer-wordmark">
            <Sparkle size={14} strokeWidth={2.8} aria-hidden="true" />
            <span>Edison</span>
          </a>
          <span>Your company’s knowledge. Built for AI.</span>
          <span>© {new Date().getFullYear()} Edison</span>
        </footer>
      </div>

    </main>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
