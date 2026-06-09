import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold-400 flex items-center justify-center">
                <span className="text-navy-900 font-bold text-sm">CCP</span>
              </div>
              <span className="font-serif text-lg font-bold text-white">
                CCP <span className="text-gold-400">Digest</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-neutral-400">
              Your trusted legal partner in corporate and commercial law. Providing expert legal solutions with integrity, excellence, and client-focused service.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-gold-400 hover:text-navy-900 transition-all" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-gold-400 hover:text-navy-900 transition-all" aria-label="Twitter">
                <Twitter size={16} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Practice Areas</h3>
            <ul className="space-y-2.5">
              {["Corporate & Commercial", "Banking & Finance", "Real Estate", "Intellectual Property", "Dispute Resolution", "Employment Law"].map((item) => (
                <li key={item}>
                  <Link to="/practice-areas" className="text-sm text-neutral-400 hover:text-gold-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Our Team", href: "/team" },
                { label: "Insights", href: "/blog" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="text-sm text-neutral-400 hover:text-gold-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-gold-400 shrink-0" />
                <span className="text-sm text-neutral-400">
                  3rd Floor, Jubilee House<br />
                  Kampala, Uganda
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold-400 shrink-0" />
                <a href="tel:+256700123456" className="text-sm text-neutral-400 hover:text-gold-400 transition-colors">
                  +256 700 123 456
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold-400 shrink-0" />
                <a href="mailto:info@ccpdigest.com" className="text-sm text-neutral-400 hover:text-gold-400 transition-colors">
                  info@ccpdigest.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} CCP Digest. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-neutral-500">
            <Link to="#" className="hover:text-gold-400 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-gold-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
