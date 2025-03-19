import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Brain,
  Github,
  Zap,
  Database,
  Key,
  Globe,
  FileCode,
  MessageSquare,
  ArrowRight,
  Star,
  Sparkles,
} from "lucide-react";
import BillingSection from "@/components/dashboard/BillingSection";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const commandIndex = useRef(0);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Parallax effect for hero section
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Terminal command typing effect
  useEffect(() => {
    const commands = [
      "pip install docgen-cli",
      "docgen auth login --key=YOUR_API_KEY",
      "docgen generate --current-dir",
      "docgen analyze --repo https://github.com/user/project",
      "docgen export --format markdown --output ./docs",
    ];

    let typingTimer;
    let currentIndex = 0;
    let direction = 1; // 1 for typing, -1 for deleting

    const typeCommand = () => {
      const targetCommand = commands[commandIndex.current];

      if (direction === 1) {
        // Typing
        if (currentIndex <= targetCommand.length) {
          setCurrentCommand(targetCommand.substring(0, currentIndex));
          currentIndex++;
          typingTimer = setTimeout(typeCommand, Math.random() * 50 + 50);
        } else {
          // Pause at end of typing
          direction = -1;
          typingTimer = setTimeout(typeCommand, 2000);
        }
      } else {
        // Deleting
        if (currentIndex >= 0) {
          setCurrentCommand(targetCommand.substring(0, currentIndex));
          currentIndex--;
          typingTimer = setTimeout(typeCommand, Math.random() * 30 + 30);
        } else {
          // Move to next command after deleting
          direction = 1;
          commandIndex.current = (commandIndex.current + 1) % commands.length;
          typingTimer = setTimeout(typeCommand, 500);
        }
      }
    };

    typingTimer = setTimeout(typeCommand, 1000);

    return () => clearTimeout(typingTimer);
  }, []);

  useEffect(() => {
    setIsVisible(true);

    // Auto-rotate through features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth/login");
    }
  };

  const features = [
    {
      icon: <Brain className="text-primary" />,
      title: "AI-Powered Documentation",
      description: "Generate comprehensive docs using advanced AI models",
    },
    {
      icon: <Globe className="text-primary" />,
      title: "Multi-Language Support",
      description: "Works with all major programming languages",
    },
    {
      icon: <FileCode className="text-primary" />,
      title: "Smart Formatting",
      description: "Beautiful Markdown and docstring generation",
    },
    {
      icon: <Github className="text-primary" />,
      title: "Git Integration",
      description: "Seamless integration with your Git workflow",
    },
    {
      icon: <Zap className="text-primary" />,
      title: "Lightning Fast",
      description: "Process entire codebases in seconds",
    },
    {
      icon: <Key className="text-primary" />,
      title: "Enterprise Ready",
      description: "Secure API management and team controls",
    },
  ];

  const testimonialsData = [
    {
      name: "Alex Chen",
      role: "Lead Developer",
      company: "TechCorp",
      text: "DocGen has completely transformed our documentation process. What used to take days now takes minutes.",
      avatar: "A",
    },
    {
      name: "Sarah Johnson",
      role: "CTO",
      company: "StartupX",
      text: "The AI-powered suggestions have helped us improve not just our docs, but our actual code quality as well.",
      avatar: "S",
    },
    {
      name: "Michael Rodriguez",
      role: "Open Source Maintainer",
      company: "DevTools",
      text: "As an open source maintainer, DocGen has helped attract more contributors by making our codebase more accessible.",
      avatar: "M",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // Split text animation helper
  const SplitText = ({ text, className }) => {
    return (
      <motion.span
        variants={staggerVariants}
        initial="hidden"
        animate="visible"
        className={className}
      >
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    );
  };

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Base grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:14px_24px]" />

        {/* Radial gradient mask */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_-10%,#000_70%,transparent_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-70" />

        {/* Enhanced animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 -right-40 w-96 h-96 rounded-full blur-3xl bg-gradient-to-r from-primary/20 to-purple-500/10"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -top-20 left-1/3 w-72 h-72 rounded-full blur-3xl bg-gradient-to-r from-blue-500/15 to-primary/10"
          animate={{
            x: [-20, 40, -20],
            y: [10, 40, 10],
            scale: [1.1, 0.9, 1.1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/3 -left-20 w-80 h-80 rounded-full blur-3xl bg-gradient-to-r from-blue-500/10 to-violet-500/15"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-16 sm:pt-20">
        {/* Enhanced Hero Section */}
        <motion.div
          ref={heroRef}
          className="flex flex-col items-center justify-center min-h-[90vh] py-8 sm:py-16 relative"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {/* Subtle floating elements */}
          <motion.div
            className="absolute w-32 h-32 border border-primary/20 rounded-full"
            style={{
              left: `calc(30% + ${mousePosition.x * -20}px)`,
              top: `calc(20% + ${mousePosition.y * -20}px)`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute w-40 h-40 border border-purple-500/10 rounded-full"
            style={{
              right: `calc(25% + ${mousePosition.x * 20}px)`,
              bottom: `calc(30% + ${mousePosition.y * 20}px)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Code particles */}
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div
              key={index}
              className="absolute text-primary/20 text-xs sm:text-sm hidden sm:block"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0,
              }}
              animate={{
                y: [null, "-100vh"],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: Math.random() * 20 + 15,
                delay: Math.random() * 20,
                ease: "linear",
              }}
            >
              {
                ["<>", "/>", "{}", "()", "[]", "/**/"][
                  Math.floor(Math.random() * 6)
                ]
              }
            </motion.div>
          ))}

          <motion.div
            className="text-center max-w-3xl relative z-10"
            variants={itemVariants}
          >
            {/* Glowing badge */}
            <motion.div
              className="mx-auto mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <Sparkles className="mr-1 h-3 w-3" />
              New: AI-Powered Code Analysis
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight"
              variants={itemVariants}
            >
              <div className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                  Documentation that
                </span>
              </div>
              <br />
              <div className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-400 relative z-10">
                  writes itself
                </span>
                <motion.div
                  className="absolute -inset-1 rounded-lg blur-lg bg-primary/20"
                  animate={{
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-400 mb-8 max-w-xl mx-auto"
              variants={itemVariants}
            >
              Generate comprehensive documentation for any codebase in seconds
              with our advanced AI-powered analysis engine.
            </motion.p>

            {/* More appealing CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
              variants={itemVariants}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-blue-500 text-background hover:opacity-90 px-8 py-6 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(0,255,157,0.3)] relative overflow-hidden group"
                onClick={handleGetStarted}
              >
                <span className="relative z-10 flex items-center">
                  {user ? "Go to Dashboard" : "Start Documenting"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <motion.span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 hover:border-primary/50 text-gray-300 hover:text-white px-8 py-6 transition-all duration-300 backdrop-blur-sm"
              >
                <span className="flex items-center">
                  View Demo
                  <PlayIcon className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Enhanced Metrics Section with animated counters */}
        <motion.div
          className="py-16 border-t border-gray-800/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                value: "100k+",
                label: "Files Documented",
                icon: <FileCode className="h-6 w-6" />,
              },
              {
                value: "10k+",
                label: "Active Users",
                icon: <Database className="h-6 w-6" />,
              },
              {
                value: "50+",
                label: "Languages",
                icon: <Globe className="h-6 w-6" />,
              },
              {
                value: "4.9/5",
                label: "User Rating",
                icon: <Star className="h-6 w-6" />,
              },
            ].map((metric, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl hover:bg-gray-800/30 transition-all duration-500 border border-transparent hover:border-gray-700/50 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex flex-col items-center">
                  <div className="mb-3 text-primary/80 group-hover:text-primary transition-colors duration-200">
                    {metric.icon}
                  </div>
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 mb-2">
                    {metric.value}
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                    {metric.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div
          className="py-12 sm:py-20 border-t border-gray-800/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div className="text-center max-w-xl mx-auto mb-12">
            <motion.h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Everything you need
              </span>
            </motion.h2>
            <motion.p
              className="text-gray-400 max-w-lg mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              DocGen combines powerful AI with developer-friendly features to
              simplify your documentation workflow
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{
                  scale: 1.03,
                  y: -5,
                  boxShadow: "0 10px 30px -15px rgba(0, 255, 157, 0.15)",
                }}
                className={`relative rounded-xl border border-gray-800 transition-all duration-300 ${
                  activeFeature === index
                    ? "ring-2 ring-primary/50 bg-gray-900/50"
                    : "bg-gray-900/20 hover:bg-gray-900/40"
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                {/* Background highlight effect */}
                {activeFeature === index && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl"
                    layoutId="featureHighlight"
                    transition={{ type: "spring", stiffness: 100, damping: 30 }}
                  />
                )}

                <div className="p-6 relative z-10">
                  <div className="h-12 w-12 rounded-full bg-gray-800/50 flex items-center justify-center mb-4 border border-gray-700/50">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>

                {/* Corner accent */}
                <div className="absolute -top-px -right-px w-10 h-10 overflow-hidden">
                  <div
                    className={`absolute transform rotate-45 translate-x-4 -translate-y-1 w-5 h-12 ${
                      activeFeature === index
                        ? "bg-primary/30"
                        : "bg-gray-700/30"
                    } transition-colors duration-300`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* New testimonials section */}
        <motion.div
          className="py-16 border-t border-gray-800/50"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Loved by developers
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsData.map((testimonial, index) => (
              <motion.div
                key={index}
                className="rounded-xl bg-gray-900/20 border border-gray-800 p-6 hover:border-gray-700/70 transition-all duration-300 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                {/* Testimonial gradient accent */}
                <div className="absolute h-1 top-0 left-0 right-0 bg-gradient-to-r from-primary/80 to-blue-500/80 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                <div className="flex items-start mb-4">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium border border-primary/30">
                      {testimonial.avatar}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {testimonial.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="text-gray-300 italic">{testimonial.text}</p>

                <div className="absolute -bottom-4 -right-4 w-24 h-24 opacity-5 text-primary">
                  <MessageSquare className="w-full h-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Workflow feature section */}
        <motion.div
          className="py-16 border-t border-gray-800/50"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-3xl mx-auto text-center mb-12">
            <motion.h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Simple workflow, powerful results
              </span>
            </motion.h2>
            <motion.p
              className="text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              Get started in minutes and transform your codebase documentation
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-primary/30 via-blue-500/30 to-purple-500/30 hidden md:block" />

            {[
              {
                title: "Connect your code",
                description: "Link your GitHub repo or upload directly",
                icon: <Github className="h-6 w-6" />,
                number: "01",
              },
              {
                title: "AI Analysis",
                description: "Our AI parses and understands your codebase",
                icon: <Brain className="h-6 w-6" />,
                number: "02",
              },
              {
                title: "Generate & Export",
                description: "Get beautiful docs in your preferred format",
                icon: <FileCode className="h-6 w-6" />,
                number: "03",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative z-10 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 border border-gray-700 relative mb-6">
                  <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-background">
                    {step.number}
                  </div>
                  <div className="text-primary">{step.icon}</div>
                </div>
                <h3 className="text-xl font-medium mb-2 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-center">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <BillingSection />

        {/* CTA Section */}
        <motion.div
          className="py-16 border-t border-gray-800/50"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              className="text-3xl sm:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                Ready to streamline your documentation?
              </span>
            </motion.h2>
            <motion.p
              className="text-gray-400 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              Join thousands of developers who are saving time and improving
              their code quality with DocGen
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-blue-500 text-background hover:opacity-90 px-8 py-6 transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_25px_rgba(0,255,157,0.3)] relative overflow-hidden group"
                onClick={handleGetStarted}
              >
                <span className="relative z-10 flex items-center">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <motion.span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 hover:border-primary/50 text-gray-300 hover:text-white px-8 py-6 transition-all duration-300 backdrop-blur-sm"
              >
                View Pricing
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-800/50 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} DocGen. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

// Helper component for the Play icon
const PlayIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

export default Index;
