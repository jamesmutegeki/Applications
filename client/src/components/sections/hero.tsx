import { Link } from "react-router-dom";
import { ArrowRight, Scale, Shield, Award } from "lucide-react";
import Button from "../ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/80 to-navy-900/60" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in">
            <Scale size={14} className="text-gold-400" />
            <span className="text-sm text-neutral-300">Excellence in Corporate Law Since 2005</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in stagger-1">
            Your Trusted Partner in{" "}
            <span className="text-gold-400">Corporate & Commercial</span>{" "}
            Law
          </h1>

          <p className="text-lg lg:text-xl text-neutral-300 leading-relaxed mb-8 max-w-2xl animate-fade-in stagger-2">
            CCP Digest delivers strategic legal solutions for businesses, combining deep expertise with unwavering commitment to excellence across East Africa and beyond.
          </p>

          <div className="flex flex-wrap gap-4 animate-fade-in stagger-3">
            <Link to="/contact">
              <Button variant="secondary" size="lg">
                Schedule a Consultation
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/practice-areas">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                Explore Practice Areas
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 animate-fade-in stagger-4">
          {[
            { icon: Award, label: "20+ Years Experience", desc: "Trusted legal expertise" },
            { icon: Shield, label: "500+ Cases Won", desc: "Proven track record" },
            { icon: Scale, label: "98% Success Rate", desc: "Client satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-5 py-4 border border-white/10">
              <div className="w-10 h-10 rounded-lg bg-gold-400/20 flex items-center justify-center">
                <stat.icon size={20} className="text-gold-400" />
              </div>
              <div>
                <div className="text-white font-semibold">{stat.label}</div>
                <div className="text-sm text-neutral-400">{stat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
