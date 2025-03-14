import { Terminal } from "@/components/Terminal";
import { FeatureCard } from "@/components/FeatureCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Brain, Github, Zap, Database, Key, BarChart, 
  Globe, FileCode, RefreshCw, MessageSquare, ArrowRight, Star
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate through features
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth/login');
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

  const commands = [
    "pip install docgen-cli",
    "docgen auth login --key=YOUR_API_KEY",
    "docgen generate --current-dir",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-background text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-1/4 -right-20 w-64 h-64 rounded-full blur-3xl bg-gradient-to-r from-primary/20 to-purple-500/10"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 -left-20 w-72 h-72 rounded-full blur-3xl bg-gradient-to-r from-blue-500/10 to-primary/20"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-[120px] sm:pt-[80px]">
        {/* Hero Section */}
        <motion.div 
          className="flex flex-col items-center justify-center min-h-[90vh] py-8 sm:py-16"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants}
        >
          <motion.div className="text-center max-w-3xl relative" variants={itemVariants}>
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 tracking-tight"
              variants={itemVariants}
            >
              Documentation that writes itself with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">AI</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-400 mb-8"
              variants={itemVariants}
            >
              Generate comprehensive documentation for any codebase in seconds.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
              variants={itemVariants}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary/80 text-background hover:opacity-90 px-8 transition-all duration-300 transform hover:scale-105"
                onClick={handleGetStarted}
              >
                {user ? 'Go to Dashboard' : 'Start Documenting'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 border-gray-700 hover:border-primary transition-all duration-300 transform hover:scale-105"
              >
                <Github className="w-5 h-5" />
                <Star className="w-4 h-4 text-yellow-400" />
                Star on GitHub
              </Button>
            </motion.div>
            <motion.div 
              className="max-w-2xl mx-auto"
              variants={itemVariants}
            >
              <Terminal commands={commands} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Metrics Section */}
        <motion.div 
          className="py-16 border-t border-gray-800"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "100k+", label: "Files Documented" },
              { value: "10k+", label: "Active Users" },
              { value: "50+", label: "Languages" },
              { value: "4.9/5", label: "User Rating" },
            ].map((metric, index) => (
              <motion.div 
                key={index} 
                className="text-center p-4 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 mb-2">{metric.value}</div>
                <div className="text-gray-400">{metric.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="py-12 sm:py-20 border-t border-gray-800"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Everything you need
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 30px -15px rgba(0, 255, 157, 0.15)" }}
                className={`transition-all duration-300 ${activeFeature === index ? 'ring-2 ring-primary/50' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div 
          className="py-12 sm:py-20 border-t border-gray-800"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-3xl mx-auto text-center px-4 relative">
            {/* Decorative elements */}
            <div className="absolute -top-10 -left-10 w-20 h-20 border border-primary/20 rounded-full blur-sm" />
            <div className="absolute -bottom-10 -right-10 w-20 h-20 border border-primary/20 rounded-full blur-sm" />
            
            <motion.h2 
              className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Ready to transform your documentation?
            </motion.h2>
            <motion.p 
              className="text-gray-400 mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              Join thousands of developers who are already using DocGen.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary/80 text-background hover:opacity-90 w-full sm:w-auto px-6 sm:px-12 transition-all duration-300 transform hover:scale-105"
                onClick={handleGetStarted}
              >
                {user ? 'Open Dashboard' : 'Get Started Free'} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;