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
  Star,
} from 'lucide-react';
import { useThemeStore } from '../store/theme';
import MouseFollower from '../components/MouseFollower';
import heroBg from '../assets/Herobg.jpg';
import 'car-makes-icons/dist/style.css';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const { isDarkMode } = useThemeStore(); // Removing toggle as we force dark mode
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Define brand icons array using CSS classes from car-makes-icons
  const brandIcons = [
    {  className: 'car-acura' },
    {  className: 'car-alfa-romeo' },
    {  className: 'car-dodge' },
    {  className: 'car-ferrari' },
    {  className: 'car-fiat' },
    {  className: 'car-ford' },
    { className: 'car-jeep-alt' },
    {  className: 'car-land-rover' },
    {  className: 'car-bmw' },
    {  className: 'car-lexus' },
    {  className: 'car-mazda' },
    {  className: 'car-toyota' },
    {  className: 'car-tesla' },
    {  className: 'car-volkswagen' },
    {  className: 'car-suzuki' },
    {  className: 'car-mercedes-benz' },
    {  className: 'car-aston-martin-alt' },
    {  className: 'car-audi' },
    {  className: 'car-bentley' },
    {  className: 'car-cadillac' },
    {  className: 'car-chevrolet' },
    {  className: 'car-citroen' },
   

   
  ];

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

  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // GSAP Animations
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

    // Horizontal scroll for Brand Logos section
    if (brandRef.current) {
      const brandInner = brandRef.current.querySelector('.brand-inner');
      gsap.to(brandInner, {
        x: '-40%',
        ease: 'none',
        scrollTrigger: {
          trigger: brandRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });
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

    animateSection(featuresRef, '.feature-card', 0.4, 50, 0.1);
    animateSection(pricingRef, '.pricing-card', 0.4, 50, 0.1);
    animateSection(reviewsRef, '.review-card', 0.45, 50, 0.1);

    ScrollTrigger.refresh();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <MouseFollower />

      {/* Navigation */}
      <nav className="fixed w-full bg-black/80 backdrop-blur-4xl z-50 border-gray-500 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold">
            MekinaHub
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/showroom" className="hover:text-gray-300">
              Showroom
            </Link>
            <Link to="/marketplace" className="hover:text-gray-300">
              Marketplace
            </Link>
            <Link to="/compare" className="hover:text-gray-300">
              Compare
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
            >
              Sign In
            </Link>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-black">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link to="/showroom" className="block px-3 py-2 rounded-lg hover:bg-gray-800">
                Features
              </Link>
              <Link to="/marketplace" className="block px-3 py-2 rounded-lg hover:bg-gray-800">
                Pricing
              </Link>
              <Link to="/compare" className="block px-3 py-2 rounded-lg hover:bg-gray-800">
                Our Customers
              </Link>
              <Link to="/login" className="block px-3 py-2 mt-2 rounded-lg bg-primary-500 text-black hover:bg-primary-700 hover:text-white">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>
      {/* Hero Section improved */}
      <section
  ref={heroRef}
  className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
  style={{ backgroundImage: `url(${heroBg})` }}
>
  {/* Hero Content */}
  <div className="absolute inset-0 bg-black/30"></div>
  <div className="relative max-w-7xl mx-auto flex flex-col items-center">
    <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
      The best Car Website in <span className="text-primary-400">Ethiopia</span>
    </h1>
    <p className="text-xl text-gray-200 mb-8 max-w-2xl">
      Don’t deny yourself the pleasure of driving the best premium cars from around the world—here and now.
    </p>
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Link
        to="/showroom"
        className="px-8 py-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center"
      >
        Explore <ArrowRight className="w-5 h-5 ml-2" />
      </Link>
      <Link
        to="/register"
        className="px-6 py-4 rounded-lg bg-white text-black font-bold font-sans hover:bg-gray-500 hover:text-white flex items-center justify-center"
      >
        Register <ArrowRight className="w-12 h-5 ml-2" />
      </Link>
    </div>
  </div>
</section>
{/* Gradient divider acting as a bottom border */}
<div className="w-full h-2 bg-gradient-to-r from-primary-400 to-transparent"></div>



      {/* Brand Logos Section correct icon size */}
      <section className="py-12 bg-black   ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6">
          <h2 className="text-xl font-semibold">Trusted Brands</h2>
          <p className="text-gray-400 p-3">
            Driving excellence from the best manufacturers around the globe.
          </p>
        </div>
        <div ref={brandRef} className="max-w-7xl h-15 mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="brand-inner flex gap-2 ">
            {brandIcons.map((brand, idx) => (
              <div key={idx} className="flex flex-col w-25 items-center">
                <i className={`${brand.className} w-28 h-15 text-primary-400 text-5xl`}></i>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-black border-t border-gray-800 mt-12 pt-8 text-center">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
    <h2 className="text-3xl font-bold text-white mb-4">Revolutionary Features</h2>
    <p className="text-gray-400">Everything you need to make informed decisions</p>
  </div>
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 sm:px-6 lg:px-8">
    {features.map((f) => (
      <div
        key={f.title}
        className="
          feature-card group relative p-[2px] rounded-xl 
          bg-gradient-to-r from-primary-300 via-primary-500 to-blue-600 
          shadow-lg hover:shadow-2xl transition-all duration-300 
        "
      >
        {/* Inner black container */}
        <div
          className="
            bg-black rounded-[inherit] p-6 transition-all duration-300
            group-hover:scale-105 group-hover:-translate-y-2
            group-hover:bg-gradient-to-r 
            group-hover:from-pink-400 
            group-hover:via-purple-400 
            group-hover:to-blue-400
            group-hover:text-black
          "
        >
          <div className="w-12 h-12 bg-transparent rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover: border-black">
            <f.icon className="w-6 h-6 text-white group-hover:text-black " />
          </div>
          <h3 className="text-xl font-semibold text-white group-hover:text-black mb-2">
            {f.title}
          </h3>
          <p className="text-gray-400 group-hover:text-black">{f.description}</p>
        </div>
      </div>
    ))}
  </div>
</section>



      {/* Pricing Section */}
      <section ref={pricingRef} className="py-20 bg-black border-t border-gray-800 mt-12 pt-8 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Dealer Plans</h2>
          <p className="text-gray-400">Choose the perfect plan for your dealership</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
          {pricingPlans.map((p) => (
            <div
              key={p.name}
              className={`pricing-card bg-black border border-gray-800 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-all duration-300 hover:shadow-2xl ${
                p.popular ? 'ring-2 ring-primary-600' : ''
              }`}
            >
              {p.popular && (
                <div className="bg-primary-600 text-white text-center py-1">Most Popular</div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">{p.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">${p.price}</span>
                  {p.price !== 'Custom' && (
                    <span className="text-gray-400">/month</span>
                  )}
                </div>
                <ul className="space-y-4 mb-6 text-gray-300">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" /> {feat}
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
      <section ref={reviewsRef} className="py-20 bg-black border-t border-gray-800 mt-12 pt-8 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Reviews</h2>
          <p className="text-gray-400">What our customers are saying</p>
        </div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="review-card bg-black border border-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            >
              <p className="text-gray-300 italic mb-4">“{r.quote}”</p>
              <div className="flex items-center">
                {[...Array(r.rating)].map((_, idx) => (
                  <Star key={idx} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <p className="mt-4 text-white font-semibold">- {r.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-12 border-t border-gray-800 mt-12 pt-8 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-primary-600 mb-4">MekinaHub</h3>
              <p>
                Revolutionizing the automotive marketplace with cutting-edge technology.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/showroom" className="hover:text-white">
                    3D Showroom
                  </Link>
                </li>
                <li>
                  <Link to="/compare" className="hover:text-white">
                    Car Comparison
                  </Link>
                </li>
                <li>
                  <Link to="/marketplace" className="hover:text-white">
                    Marketplace
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500">&copy; 2024 MekinaHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
