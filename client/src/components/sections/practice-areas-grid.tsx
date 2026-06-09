import { Link } from "react-router-dom";
import {
  Building2, Landmark, Building, Lightbulb,
  Scale, GitMerge, Users, Receipt, ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { practiceAreas } from "../../data/practice-areas";

const iconMap: Record<string, LucideIcon> = {
  Building2, Landmark, Building, Lightbulb,
  Scale, GitMerge, Users, Receipt,
};

export default function PracticeAreasGrid() {
  return (
    <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <span className="text-sm font-medium text-gold-600 dark:text-gold-400 uppercase tracking-wider">What We Do</span>
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-navy-800 dark:text-white mt-3 mb-4">
            Our Practice Areas
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Comprehensive legal services tailored to meet the complex needs of businesses across multiple sectors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {practiceAreas.map((area, i) => {
            const Icon = iconMap[area.icon] || Scale;
            return (
              <Link
                key={area.id}
                to={`/practice-areas/${area.slug}`}
                className="group bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg hover:border-navy-300 dark:hover:border-navy-600 transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${area.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-semibold text-navy-800 dark:text-white mb-2 group-hover:text-navy-600 dark:group-hover:text-gold-400 transition-colors">
                  {area.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                  {area.description}
                </p>
                <span className="text-sm font-medium text-navy-700 dark:text-gold-400 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn More <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
