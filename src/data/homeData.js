/**
 * Home Page Mock Data
 * Images sourced from Unsplash (https://unsplash.com)
 * License: Free to use under Unsplash License
 */

export const heroData = {
  badge: {
    icon: "pulse",
    text: "Quality Language Education"
  },
  title: "Unlock Your Future",
  titleHighlight: "Without Limits.",
  subtitle: "Empowering refugees and displaced communities with world-class English education. Start your journey from zero to fluent in your newfound language.",
  buttons: [
    { text: "Begin Your Journey", variant: "primary", icon: "ArrowRight" },
    { text: "How it works", variant: "secondary", icon: "PlayCircle" }
  ],
  stats: [
    { value: "10,000+", label: "Active Learners" },
    { value: "45+", label: "Countries" },
    { value: "24/7", label: "Support" }
  ],
  image: {
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=800&fit=crop",
    alt: "Students learning together",
    credit: "Photo by Brooke Cagle on Unsplash"
  }
}

export const featuresData = {
  sectionBadge: "OUR FEATURES",
  title: "Designed for Your Success",
  subtitle: "We understand the unique challenges of learning a new language while building a new life. Our platform is built specifically for you.",
  features: [
    {
      icon: "BookOpen",
      iconColor: "bg-blue-100 text-brand-blue",
      title: "Mother-Tongue Support",
      description: "Learn in your comfort zone with multilingual support. Arabic, Dari, Ukrainian and more: feel free to broadcast again."
    },
    {
      icon: "MessageSquare",
      iconColor: "bg-brand-blue/10 text-brand-blue",
      title: "Practical Conversation",
      description: "Master real-world English through interactive role-plays, everyday grocery shopping, doctor appointments, and job interviews."
    },
    {
      icon: "Award",
      iconColor: "bg-purple-100 text-purple-600",
      title: "Certified Milestones",
      description: "Earn recognized certificates as you progress, helping you build a competitive resume."
    }
  ]
}

export const pathToMasteryData = {
  sectionBadge: "THE PROCESS",
  title: "Your Path to Mastery",
  steps: [
    {
      icon: "ClipboardList",
      iconColor: "bg-brand-blue",
      title: "Custom Assessment",
      description: "Identify your current level and set personal goals based on your life situation."
    },
    {
      icon: "Calendar",
      iconColor: "bg-brand-blue",
      title: "Daily Immersive Learning",
      description: "Engage in effective daily lessons designed to fit your busy schedule."
    },
    {
      icon: "Users",
      iconColor: "bg-blue-500",
      title: "Community Fluency",
      description: "Join peer groups and live sessions to practice with real people in a safe space."
    }
  ]
}

export const impactData = {
  sectionBadge: "OUR IMPACT",
  title: "Join a global movement of learners",
  subtitle: "Over 10 million lessons completed this year alone.",
  stats: [
    { value: "94%", label: "Job Success Rate" },
    { value: "12M+", label: "Words Learned" }
  ],
  backgroundImage: {
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=400&fit=crop",
    alt: "Global community learning",
    credit: "Photo by Marvin Meyer on Unsplash"
  }
}

export const testimonialsData = [
  {
    id: 1,
    quote: "When I arrived, I felt invisible because I couldn't speak. Wordigo gave me my voice back. Starting lessons in Arabic made me feel safe and respected.",
    author: "Omar Al-Sayed",
    role: "ADVANCED LEARNER • SYRIAN COMMUNITY",
    rating: 5,
    avatar: {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      alt: "Omar Al-Sayed",
      credit: "Photo by Joseph Gonzalez on Unsplash"
    }
  },
  {
    id: 2,
    quote: "I came to this country with nothing but hope. Wordigo helped me find my confidence. Now I can speak with my children's teachers and help them with homework.",
    author: "Maria Santos",
    role: "INTERMEDIATE LEARNER • VENEZUELAN COMMUNITY",
    rating: 5,
    avatar: {
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      alt: "Maria Santos",
      credit: "Photo by Michael Dam on Unsplash"
    }
  },
  {
    id: 3,
    quote: "The job interview practice was incredibly helpful. I got my first job in my new country within 3 months of starting the program. Thank you Wordigo!",
    author: "Ahmed Hassan",
    role: "BEGINNER LEARNER • SOMALI COMMUNITY",
    rating: 5,
    avatar: {
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      alt: "Ahmed Hassan",
      credit: "Photo by Kalvisuals on Unsplash"
    }
  }
]

export const ctaData = {
  title: "Ready to start your next chapter?",
  description: "Join our community for free today. No credit card required, just a commitment to your future.",
  button: {
    text: "Join for Free",
    icon: "ArrowRight"
  },
  backgroundImage: {
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=400&fit=crop",
    alt: "Students celebrating success",
    credit: "Photo by Priscilla Du Preez on Unsplash"
  }
}

export const footerData = {
  brand: {
    description: "A free global learning platform dedicated to high-quality language education and empowering displaced communities through technology and human connection."
  },
  sections: [
    {
      title: "LEARN",
      links: [
        { label: "Courses", href: "/courses" },
        { label: "Curriculum", href: "/curriculum" },
        { label: "Our Impact", href: "/impact" },
        { label: "Get Involved", href: "/get-involved" }
      ]
    },
    {
      title: "SUPPORT",
      links: [
        { label: "Browse Courses", href: "/courses" },
        { label: "Get Started", href: "/courses" },
        { label: "Community", href: "/impact" },
        { label: "Resources", href: "/curriculum" }
      ]
    },
    {
      title: "WORDIGO",
      links: [
        { label: "Our Mission", href: "/impact" },
        { label: "Our Approach", href: "/curriculum" }
      ]
    }
  ],
  legal: {
    note: "Hello, learner welcome :) Please note in multiple Parts of the world the use of this content outside our platform is restricted.",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" }
    ]
  },
  social: [
    { icon: "Twitter", href: "https://twitter.com" },
    { icon: "Facebook", href: "https://facebook.com" },
    { icon: "Instagram", href: "https://instagram.com" }
  ],
  copyright: "© 2025 Wordigo Global Platform. All rights reserved."
}