import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const SOCIAL_LINKS = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          
          {/* About */}
          <section>
            <h3 className="text-white font-bold text-lg mb-4">ScaleKarrt</h3>
            <p className="text-sm leading-relaxed">
              Your trusted multi-vendor marketplace for quality products from
              verified sellers across India.
            </p>
          </section>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>

          {/* Seller Links */}
          <nav aria-label="Seller links">
            <h4 className="text-white font-semibold mb-4">For Sellers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/seller/register" className="hover:text-white transition-colors">
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link to="/seller/benefits" className="hover:text-white transition-colors">
                  Seller Benefits
                </Link>
              </li>
              <li>
                <Link to="/seller/guidelines" className="hover:text-white transition-colors">
                  Seller Guidelines
                </Link>
              </li>
            </ul>
          </nav>

          {/* Social */}
          <section>
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>

            <div className="flex gap-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="hover:text-white transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm">
          <p>&copy; {year} ScaleKarrt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
