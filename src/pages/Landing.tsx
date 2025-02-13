import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Car,
  Scale,
  Store,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Moon,
  Sun,
  Star,
} from 'lucide-react';
import { useThemeStore } from '../store/theme';
import MouseFollower from '../components/MouseFollower';
import heroBg from '../assets/Herobg.jpg';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Data arrays
  const features = [
    {
      icon: Car,
      title: '3D Car Showroom',
      description: 'Explore cars in stunning 3D with 360° views and detailed specs.',
    },
    {
      icon: Scale,
      title: 'Smart Comparison',
      description: 'Compare cars side by side with detailed specs and features.',
    },
    {
      icon: Store,
      title: 'Marketplace',
      description: 'Buy and sell cars directly through our trusted dealer network.',
    },
    {
      icon: MessageSquare,
      title: 'Direct Communication',
      description: 'Chat with dealers and get instant responses to your queries.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Basic Dealer',
      price: '99',
      features: [
        'Up to 10 car listings',
        'Basic analytics',
        'Standard support',
        'Basic dealer profile',
      ],
    },
    {
      name: 'Premium Dealer',
      price: '199',
      features: [
        'Unlimited car listings',
        'Advanced analytics',
        'Priority support',
        'Featured listings',
        'Custom dealer profile',
        'Lead generation tools',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: [
        'Multiple dealership locations',
        'API access',
        'Dedicated account manager',
        'Custom integration',
        'Advanced reporting',
        'White-label options',
      ],
    },
  ];

  const reviews = [
    {
      quote:
        'This platform revolutionized how I shop for cars. The 3D showroom is incredible!',
      author: 'Jane Doe',
      rating: 5,
    },
    {
      quote: 'Excellent experience and top-notch customer service. Highly recommend!',
      author: 'John Smith',
      rating: 4,
    },
    {
      quote:
        'A game-changer in the automotive market. The smart comparison tool is a lifesaver.',
      author: 'Alice Johnson',
      rating: 5,
    },
  ];

  // Toggle dark mode on the document root
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // GSAP animations
  useEffect(() => {
    // HERO Animation (unchanged)
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.5 });
    if (heroRef.current) {
      const h1 = heroRef.current.querySelector('h1');
      const p = heroRef.current.querySelector('p');
      const links = Array.from(heroRef.current.querySelectorAll('a'));
      heroTimeline
        .fromTo(h1, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 0.8 })
        .fromTo(p, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
        .fromTo(
          links,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          '-=0.4'
        );
    }

    // Helper: Animate section items using fromTo (like hero)
    const animateSection = (
      ref: React.RefObject<HTMLDivElement>,
      selector: string,
      duration: number,
      yOffset: number,
      staggerDelay: number
    ) => {
      if (ref.current) {
        const items = Array.from(ref.current.querySelectorAll(selector));
        items.forEach((item, i) => {
          gsap.fromTo(
            item,
            { opacity: 0, y: yOffset },
            {
              opacity: 1,
              y: 0,
              duration,
              delay: i * staggerDelay,
              scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }
    };

    // Animate Features, Pricing, Reviews similar to hero animation
    animateSection(featuresRef, '.feature-card', 0.4, 50, 0.1);
    animateSection(pricingRef, '.pricing-card', 0.4, 50, 0.1);
    animateSection(reviewsRef, '.review-card', 0.45, 50, 0.1);

    ScrollTrigger.refresh();
  }, []);

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      <MouseFollower />

      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Link to="/" className="text-2xl font-bold text-gray-600 flex items-center">
              MekinaHub
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/showroom"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600"
              >
                Showroom
              </Link>
              <Link
                to="/marketplace"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600"
              >
                Marketplace
              </Link>
              <Link
                to="/compare"
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600"
              >
                Compare
              </Link>
              <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-300 dark:bg-gray-700">
                {isDarkMode ? <Sun className="w-5 h-5 text-primary-400" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg text-white hover:bg-gray-300"
              >
                Sign In
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/showroom"
                className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Showroom
              </Link>
              <Link
                to="/marketplace"
                className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Marketplace
              </Link>
              <Link
                to="/compare"
                className="block px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Compare
              </Link>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section (unchanged) */}
      <section
        ref={heroRef}
        className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBg})`
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left z-10">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-100 mb-6">
              The Future of Car Shopping is <span className="text-primary-400">Here</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto md:mx-0">
              Experience cars like never before with our immersive 3D showroom, smart comparison tools, and trusted marketplace.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Link
                to="/showroom"
                className="px-8 py-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center"
              >
                Explore Showroom <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/marketplace"
                className="px-8 py-4 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
              >
                Visit Marketplace <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Revolutionary Features</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Everything you need to make informed decisions
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="feature-card bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Dealer Plans</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Choose the perfect plan for your dealership
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((p) => (
            <div
              key={p.name}
              className={`pricing-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-2xl ${
                p.popular ? 'ring-2 ring-primary-600' : ''
              }`}
            >
              {p.popular && (
                <div className="bg-primary-600 text-white text-center py-1">Most Popular</div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{p.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">${p.price}</span>
                  {p.price !== 'Custom' && (
                    <span className="text-gray-600 dark:text-gray-300">/month</span>
                  )}
                </div>
                <ul className="space-y-4 mb-6">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" /> {feat}
                    </li>
                  ))}
                </ul>
                <button className="w-full px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section ref={reviewsRef} className="relative py-20 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Reviews</h2>
          <p className="text-gray-600 dark:text-gray-300">
            What our customers are saying
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="review-card bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            >
              <p className="text-gray-600 dark:text-gray-300 italic mb-4">
                “{r.quote}”
              </p>
              <div className="flex items-center">
                {[...Array(r.rating)].map((_, idx) => (
                  <Star key={idx} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <p className="mt-4 text-gray-900 dark:text-white font-semibold">
                - {r.author}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-primary-600 mb-4">MekinaHub</h3>
              <p className="text-gray-400">
                Revolutionizing the automotive marketplace with cutting-edge technology.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/showroom" className="text-gray-400 hover:text-white">
                    3D Showroom
                  </Link>
                </li>
                <li>
                  <Link to="/compare" className="text-gray-400 hover:text-white">
                    Car Comparison
                  </Link>
                </li>
                <li>
                  <Link to="/marketplace" className="text-gray-400 hover:text-white">
                    Marketplace
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MekinaHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
