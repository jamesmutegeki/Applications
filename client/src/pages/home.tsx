import Hero from "../components/sections/hero";
import AboutPreview from "../components/sections/about-preview";
import PracticeAreasGrid from "../components/sections/practice-areas-grid";
import TestimonialsSection from "../components/sections/testimonials-section";
import TeamSection from "../components/sections/team-section";
import BlogPreview from "../components/sections/blog-preview";
import CTASection from "../components/sections/cta-section";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutPreview />
      <PracticeAreasGrid />
      <TestimonialsSection />
      <TeamSection />
      <BlogPreview />
      <CTASection />
    </>
  );
}
