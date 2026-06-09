export interface PracticeArea {
  id: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
  color: string;
}

export interface Attorney {
  id: string;
  name: string;
  title: string;
  image: string;
  specialization: string;
  bio: string;
  email: string;
  phone: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  date: string;
  author: string;
  slug: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  quote: string;
  image: string;
}

export interface NavLink {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}
