import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import Button from "../ui/button";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Practice Areas",
    href: "/practice-areas",
    children: [
      { label: "Corporate & Commercial", href: "/practice-areas/corporate-commercial" },
      { label: "Banking & Finance", href: "/practice-areas/banking-finance" },
      { label: "Real Estate & Property", href: "/practice-areas/real-estate-property" },
      { label: "Intellectual Property", href: "/practice-areas/intellectual-property" },
    ],
  },
  { label: "Our Team", href: "/team" },
  { label: "Insights", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">CCP</span>
            </div>
            <span className="font-serif text-lg font-bold text-navy-800 dark:text-white">
              CCP <span className="text-gold-500">Digest</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => setDropdown(link.label)}
                onMouseLeave={() => setDropdown(null)}
              >
                <Link
                  to={link.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-1",
                    location.pathname === link.href
                      ? "text-navy-700 bg-navy-50"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-navy-700 hover:bg-navy-50"
                  )}
                >
                  {link.label}
                  {link.children && <ChevronDown size={14} />}
                </Link>
                {link.children && dropdown === link.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800 py-2 animate-fade-in">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-navy-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/contact">
              <Button size="md">Schedule Consultation</Button>
            </Link>
          </div>

          <button
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.href}>
                <Link
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-navy-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              </div>
            ))}
            <div className="pt-3">
              <Link to="/contact" onClick={() => setOpen(false)}>
                <Button className="w-full">Schedule Consultation</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
