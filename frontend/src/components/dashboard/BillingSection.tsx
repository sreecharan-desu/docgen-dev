import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  CheckCircle2,
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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const plansRef = useRef(null);
  const isInView = useInView(plansRef, { once: true, amount: 0.2 });

  // Plans data with psychological triggers embedded
  const plans = [
    {
      id: "free",
      name: "Free",
      description: "Perfect for solo creators",
      price: "$0",
      period: "monthly",
      savings: "",
      accent: "from-blue-500/20 to-blue-700/20",
      borderAccent: "border-blue-700/30",
      icon: Clock,
      features: [
        "5 API keys",
        "10,000 requests/month",
        "Community support",
        "7-day log retention",
      ],
      buttonText: "Get Started",
      buttonStyle:
        "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-700/50",
    },
    {
      id: "pro",
      name: "Pro",
      description: "Best value for teams",
      price: billingCycle === "monthly" ? "$29" : "$279",
      period: "monthly",
      savings: billingCycle === "annual" ? "You save $69" : "",
      popular: true,
      accent: "from-emerald-500/20 to-teal-700/20",
      borderAccent: "border-emerald-700/40",
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
      buttonStyle: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Ultimate flexibility & control",
      price: "Custom",
      period: "quote",
      savings: "",
      accent: "from-violet-500/20 to-purple-700/20",
      borderAccent: "border-violet-700/30",
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
        "bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 border border-violet-700/50",
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
        "Yes! All paid plans include a 14-day full-feature trial with no credit card required. Start building immediately and decide later which plan suits your needs.",
    },
    {
      question: "Is there a setup fee?",
      answer:
        "No hidden fees whatsoever. The price you see is all-inclusive, covering all features, updates, and basic support.",
    },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly");
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
    hidden: { y: 20, opacity: 0 },
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

  const featureVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const featureItem = {
    hidden: { opacity: 0, x: -10 },
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
    <div className="bg-[#0d1117] text-gray-100">
      <motion.div
        className="max-w-5xl mx-auto px-4 py-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header with enhanced visual elements */}
        <motion.div
          variants={itemVariants}
          className="mb-20 text-center max-w-3xl mx-auto relative z-10"
        >
          {/* Subtle background glow */}
          <motion.div
            className="absolute -z-10 inset-0 overflow-hidden opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 2 }}
          >
            <div className="absolute top-1/4 -left-10 w-64 h-64 rounded-full bg-gradient-to-r from-emerald-900 to-teal-900 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gradient-to-l from-violet-900 to-blue-900 blur-3xl"></div>
          </motion.div>

          {/* Trust badge with enhanced style and animation */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950/30 px-4 py-1.5 mb-6 ring-1 ring-emerald-700/30 shadow-lg shadow-emerald-900/10 backdrop-blur-sm"
          >
            <motion.div
              animate={{ rotate: [0, 15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </motion.div>
            <span className="text-xs font-medium text-emerald-300">
              Trusted by over 2,500+ businesses worldwide
            </span>
          </motion.div>

          {/* Main title with animated gradient */}
          <motion.h1
            className="text-4xl sm:text-5xl font-bold mb-6 relative w-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-300 to-teal-200">
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
            className="text-gray-400 max-w-lg mx-auto text-lg mb-8"
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
            className="inline-flex items-center justify-center p-1 bg-gray-800/50 rounded-full backdrop-blur-sm border border-gray-700/50 shadow-inner relative"
          >
            <button 
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly" 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle("annual")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "annual" 
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg" 
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Annual
            </button>
            {billingCycle === "annual" && (
              <div className="absolute right-0 transform translate-x-full ml-3 flex items-center">
                <span className="bg-emerald-900/30 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-medium">
                  Save 20%
                </span>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Pricing Plans */}
        <motion.div
          ref={plansRef}
          className="grid md:grid-cols-3 gap-6 relative z-10"
          variants={containerVariants}
        >
          {plans.map((plan) => {
            const isPopular = plan.popular;
            const isSelected = plan.id === selectedPlan;
            return (
              <motion.div
                key={plan.id}
                variants={planVariants}
                initial="initial"
                animate={isInView ? getPlanVariant(plan.id) : "initial"}
                whileHover="hover"
                onHoverStart={() => setHoveredPlan(plan.id)}
                onHoverEnd={() => setHoveredPlan(null)}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-2xl border ${plan.borderAccent} bg-gradient-to-b from-gray-900 to-[#0d1117] shadow-xl transition-all cursor-pointer ${
                  isSelected ? "ring-2 ring-offset-2 ring-offset-[#0d1117] ring-teal-500" : ""
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 px-3 py-1 bg-emerald-600 text-white text-xs font-bold uppercase rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div className="p-6">
                  <div className={`bg-gradient-to-r ${plan.accent} rounded-xl p-4 mb-4`}>
                    <div className="flex items-center gap-4">
                      <plan.icon className="h-6 w-6 text-white" />
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    </div>
                    <p className="text-gray-300 mt-2 text-sm">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline mt-4">
                    <div className="text-white text-4xl font-bold">{plan.price}</div>
                    <div className="text-gray-400 text-sm ml-2">
                      {plan.period === "monthly"
                        ? `/${billingCycle === "monthly" ? "mo" : "yr"}`
                        : ""}
                    </div>
                  </div>
                  
                  {plan.savings && (
                    <div className="text-emerald-400 text-xs mt-1">
                      {plan.savings}
                    </div>
                  )}

                  <motion.ul 
                    className="mt-6 space-y-3"
                    variants={featureVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                  >
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        variants={featureItem}
                        className="flex items-start gap-3 text-gray-300"
                      >
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>

                  <Button
                    className={`mt-8 w-full py-3 rounded-lg text-sm font-medium ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mt-20 max-w-3xl mx-auto"
          variants={containerVariants}
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-bold text-white text-center mb-8"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="border border-gray-800 rounded-lg bg-gray-900/40 overflow-hidden"
              >
                <button
                  className="flex justify-between items-center w-full text-white text-left p-4 hover:bg-gray-800/40 transition-colors"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-lg font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-gray-300 border-t border-gray-800">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          
          {/* CTA Section */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 text-center bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-800"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Ready to get started?</h3>
            <p className="text-gray-300 mb-6">Join thousands of businesses already using our platform</p>
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-2 rounded-lg font-medium">
              Sign up for free
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BillingSection;