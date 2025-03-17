import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  CheckCircle2,
  HelpCircle,
  CreditCard,
  ChevronDown,
  Sparkles,
  Shield,
  Clock,
  Zap,
} from "lucide-react";

const BillingSection = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const plansRef = useRef(null);
  const isInView = useInView(plansRef, { once: true, amount: 0.2 });

  // Plans data with psychological triggers embedded
  const plans = [
    {
      id: "Free",
      name: "Free",
      description: "Perfect for solo creators",
      price: "$0",
      period: "monthly",
      savings: "",
      accent: "from-blue-400 to-blue-600",
      icon: Clock,
      features: [
        "5 API keys",
        "10,000 requests/month",
        "Free support",
        "7-day log retention",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      buttonText: "Get Started",
      buttonStyle:
        "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/60",
    },
    {
      id: "pro",
      name: "Pro",
      description: "Best value for teams",
      price: "$29",
      period: "monthly",
      savings: "Save 20% with annual billing",
      popular: true,
      accent: "from-emerald-400 to-emerald-600",
      icon: Zap,
      features: [
        "Unlimited API keys",
        "100,000 requests/month",
        "Priority support",
        "30-day log retention",
        "Advanced analytics",
        "Custom rate limits",
      ],
      buttonText: "Upgrade Now",
      buttonStyle: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Ultimate flexibility & control",
      price: "Custom",
      period: "quote",
      savings: "",
      accent: "from-violet-400 to-purple-600",
      icon: Shield,
      features: [
        "Unlimited everything",
        "24/7 dedicated support",
        "SLA guarantees",
        "90-day log retention",
        "Custom integrations",
        "Dedicated account manager",
        "On-premise deployment options",
      ],
      buttonText: "Contact Sales",
      buttonStyle:
        "bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-800/60",
    },
  ];

  // FAQ data with improved answers
  const faqs = [
    {
      question: "How do I upgrade or downgrade my plan?",
      answer:
        "You can change your plan anytime from your account settings. Changes take effect immediately, and we'll prorate your billing automatically. No technical interruptions to your service.",
    },
    {
      question: "What happens if I exceed my monthly limit?",
      answer:
        "Your service continues uninterrupted. We'll notify you and offer options to upgrade or add capacity. Your critical operations will never be cut off mid-month.",
    },
    {
      question: "Do you offer a free trial?",
      answer:
        "Yes! All plans include a 14-day full-feature trial with no credit card required. Start building immediately and decide later which plan suits your needs.",
    },
    {
      question: "Is there a setup fee?",
      answer:
        "No hidden fees whatsoever. The price you see is all-inclusive, covering all features, updates, and Free support.",
    },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  const planVariants = {
    initial: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -5,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
    selected: {
      scale: 1.03,
      y: -8,
      transition: { type: "spring", stiffness: 400, damping: 20 },
    },
  };

  const staggerFeatures = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const featureItem = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };

  // Determine if a plan is selected
  const getPlanVariant = (planId: string) => {
    if (planId === selectedPlan) return "selected";
    if (planId === hoveredPlan) return "hover";
    return "initial";
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header with enhanced visual elements */}
      <motion.div
        variants={itemVariants}
        className="mb-16 text-center max-w-3xl mx-auto relative z-10"
      >
        {/* Animated background shapes */}
        <motion.div
          className="absolute -z-10 inset-0 overflow-hidden opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute top-1/4 -left-10 w-64 h-64 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-l from-violet-600 to-blue-600 blur-3xl"></div>
        </motion.div>

        {/* Floating particles */}
        <div className="absolute inset-0 -z-10">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full bg-emerald-400`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Trust badge with enhanced style and animation */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-900/30 to-teal-900/30 px-4 py-1.5 mb-6 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-900/10 backdrop-blur-sm"
        >
          <motion.div
            animate={{ rotate: [0, 15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </motion.div>
          <span className="text-xs font-medium text-emerald-300">
            Trusted by over 2,500+ busineFreesses worldwide
          </span>
        </motion.div>

        {/* Main title with animated gradient */}
        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-6 relative w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-emerald-200 animate-text">
            Simple, Transparent Pricing
          </span>
          <motion.div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "4rem" }}
            transition={{ delay: 1, duration: 0.8 }}
          />
        </motion.h1>

        {/* Subheading with improved styling */}
        <motion.p
          className="text-slate-300 max-w-lg mx-auto text-lg mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Choose the perfect plan for your needs and scale seamlessly as you
          grow your business with our enterprise-grade API platform
        </motion.p>

        {/* Billing toggle with enhanced styling */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="inline-flex items-center justify-center p-1 bg-slate-700/50 rounded-full backdrop-blur-sm border border-slate-600/50 shadow-inner"
        >
          <button className="px-5 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
            Monthly
          </button>
          <button className="px-5 py-2 rounded-full text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Annual
          </button>
          <div className="absolute right-0 transform translate-x-full ml-3 flex items-center">
            <span className="bg-emerald-900/30 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-medium">
              Save 20%
            </span>
          </div>
        </motion.div>

        {/* Testimonial snippet */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-sm text-slate-400"
        >
          <svg
            className="h-4 w-4 text-amber-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg
            className="h-4 w-4 text-amber-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg
            className="h-4 w-4 text-amber-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.248 3.84a1 1 0 00.95.69h4.038c.969 0 1.372 1.24.588 1.81l-3.262 2.37a1 1 0 00-.364 1.118l1.248 3.84c.3.92-.755 1.687-1.54 1.118l-3.262-2.37a1 1 0 00-1.176 0l-3.262 2.37c-.785.57-1.84-.198-1.54-1.118l1.248-3.84a1 1 0 00-.364-1.118L2.225 9.267c-.785-.57-.38-1.81.588-1.81h4.038a1 1 0 00.95-.69l1.248-3.84z" />
          </svg>
        </motion.div>
      </motion.div>

      <br />

      {/* Pricing Plans */}
      <motion.div
        ref={plansRef}
        className="grid md:grid-cols-3 gap-6"
        variants={containerVariants}
      >
        {plans.map((plan, index) => {
          const isPopular = plan.popular;
          return (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              initial="initial"
              animate={isInView ? getPlanVariant(plan.id) : "initial"}
              whileHover="hover"
              onHoverStart={() => setHoveredPlan(plan.id)}
              onHoverEnd={() => setHoveredPlan(null)}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-6 rounded-2xl border border-slate-700 bg-gradient-to-b ${plan.accent} shadow-lg transition-all cursor-pointer`}
            >
              {isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 px-3 py-1 bg-emerald-600 text-white text-xs font-bold uppercase rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <plan.icon className="h-8 w-8 text-white" />
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              </div>

              <p className="text-slate-200 mb-4">{plan.description}</p>

              <div className="text-white text-4xl font-bold">{plan.price}</div>
              <div className="text-slate-400 text-sm">
                {plan.period === "monthly"
                  ? "/month"
                  : "Custom pricing available"}
              </div>
              {plan.savings && (
                <div className="text-emerald-300 text-xs mt-1">
                  {plan.savings}
                </div>
              )}

              <ul className="mt-6 space-y-2">
                {plan.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    variants={featureItem}
                    className="flex items-center gap-2 text-white"
                  >
                    {feature != "" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <></>
                    )}
                    {feature}
                  </motion.li>
                ))}
              </ul>

              <Button
                className={`mt-6 w-full py-3 rounded-lg ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </Button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        className="mt-16 max-w-3xl mx-auto"
        variants={containerVariants}
      >
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border border-slate-700 p-4 rounded-lg bg-slate-800/40"
            >
              <button
                className="flex justify-between items-center w-full text-white text-lg font-medium"
                onClick={() => toggleFaq(index)}
              >
                {faq.question}
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${expandedFaq === index ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {expandedFaq === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-slate-300 mt-2"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BillingSection;
