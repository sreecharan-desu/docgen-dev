import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { CheckCircle2, HelpCircle, CreditCard, ChevronDown, Sparkles, Shield, Clock, Zap } from "lucide-react";

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
        "7-day log retention"
      ],
      buttonText: "Get Started",
      buttonStyle: "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/60"
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
        "Custom rate limits"
      ],
      buttonText: "Upgrade Now",
      buttonStyle: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
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
        "On-premise deployment options"
      ],
      buttonText: "Contact Sales",
      buttonStyle: "bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-800/60"
    }
  ];

  // FAQ data with improved answers
  const faqs = [
    {
      question: "How do I upgrade or downgrade my plan?",
      answer: "You can change your plan anytime from your account settings. Changes take effect immediately, and we'll prorate your billing automatically. No technical interruptions to your service."
    },
    {
      question: "What happens if I exceed my monthly limit?",
      answer: "Your service continues uninterrupted. We'll notify you and offer options to upgrade or add capacity. Your critical operations will never be cut off mid-month."
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes! All plans include a 14-day full-feature trial with no credit card required. Start building immediately and decide later which plan suits your needs."
    },
    {
      question: "Is there a setup fee?",
      answer: "No hidden fees whatsoever. The price you see is all-inclusive, covering all features, updates, and Free support."
    }
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
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const planVariants = {
    initial: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -5,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    },
    selected: {
      scale: 1.03,
      y: -8,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    }
  };

  const staggerFeatures = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const featureItem = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
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
                top: `${Math.random() * 100}%`
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
          Choose the perfect plan for your needs and scale seamlessly as you grow your business with our enterprise-grade API platform
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
          <svg className="h-4 w-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="h-4 w-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="h-4 w-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="h-4 w-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="h-4 w-4 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </motion.div>
      </motion.div>

          <br />

      {/* Pricing Cards */}
      <motion.div
        ref={plansRef}
        variants={itemVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-20"
      >
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            variants={planVariants}
            initial="initial"
            animate={getPlanVariant(plan.id)}
            whileHover="hover"
            onClick={() => setSelectedPlan(plan.id)}
            onHoverStart={() => setHoveredPlan(plan.id)}
            onHoverEnd={() => setHoveredPlan(null)}
            className={`relative rounded-xl backdrop-blur-sm border transition-all duration-300 cursor-pointer
              ${plan.id === selectedPlan
                ? 'border-emerald-300 dark:border-emerald-500/50 shadow-xl shadow-emerald-500/10 rgba(30, 41, 59, 1) dark:bg-slate-800/90'
                : 'border-slate-200/60 dark:border-slate-700/40 shadow-sm hover:shadow-md rgba(30, 41, 59, 1)/60 dark:bg-slate-800/50'
              }
              ${plan.popular ? 'ring-1 ring-emerald-500/50 dark:ring-emerald-400/30' : ''}
            `}
          >
            {/* Popular badge */}
            {plan.popular && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute -top-3 rounded-full px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-medium shadow-lg shadow-emerald-500/20 left-1/2 transform -translate-x-1/2"
              >
                Most Popular
              </motion.div>
            )}

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{plan.description}</p>
                </div>

                <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.accent} bg-opacity-10`}>
                  <plan.icon className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Pricing */}
              <div className="mt-6 flex items-baseline">
                <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                {plan.period !== "quote" && (
                  <span className="text-slate-500 dark:text-slate-400 text-sm ml-2">/{plan.period}</span>
                )}
              </div>

              {/* Savings note */}
              {plan.savings && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{plan.savings}</p>
              )}

              {/* Divider */}
              <div className="h-px w-full bg-slate-100 dark:bg-slate-700/30 my-6"></div>

              {/* Features list */}
              <motion.div
                variants={staggerFeatures}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {plan.features.map((feature) => (
                  <motion.div
                    key={feature}
                    variants={featureItem}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`mt-8 w-full rounded-lg py-3 px-4 text-sm font-medium shadow-sm transition-all ${plan.buttonStyle} hover:shadow-md ${plan.id === selectedPlan ? 'ring-2 ring-emerald-500/50' : ''}`}
              >
                {plan.buttonText}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

     

      {/* Consultation Banner */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        className="mt-8 mb-16 rounded-xl overflow-hidden bg-gradient-to-r rgba(30, 41, 59, 1) dark:from-emerald-900/20 dark:to-teal-900/20 shadow-lg"
      >
        <div className="p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="rgba(30, 41, 59, 1) dark:bg-slate-800 p-3 rounded-full shadow-md"
            >
              <HelpCircle className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold mb-1.5">Not sure which plan is right for you?</h3>
              <p className="text-slate-600 dark:text-slate-400">Get personalized recommendations from our experts</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all whitespace-nowrap"
          >
            Schedule a Demo
          </motion.button>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <EnhancedFAQs />
      {/* Final CTA with urgency and guarantee */}
      <motion.div
        variants={itemVariants}
        className="mt-20 text-center"
      >
        <div className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 px-3 py-1 mb-4">
          <CreditCard className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            30-day money-back guarantee
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-6">Ready to supercharge your API experience?</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-8">
          Join thousands of developers who've already upgraded their workflow
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 rounded-lg text-base font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
        >
          Get Started Today
        </motion.button>

        <p className="text-sm text-slate-400 dark:text-slate-500 mt-4">
          No credit card required for free trial
        </p>
      </motion.div>
    </motion.div>
  );
};

// Enhanced FAQ component to complete the missing piece
const EnhancedFAQs = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // FAQ data
  const faqs = [
    {
      question: "How do I upgrade or downgrade my plan?",
      answer: "You can change your plan anytime from your account settings. Changes take effect immediately, and we'll prorate your billing automatically. No technical interruptions to your service."
    },
    {
      question: "What happens if I exceed my monthly limit?",
      answer: "Your service continues uninterrupted. We'll notify you and offer options to upgrade or add capacity. Your critical operations will never be cut off mid-month."
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes! All plans include a 14-day full-feature trial with no credit card required. Start building immediately and decide later which plan suits your needs."
    },
    {
      question: "Is there a setup fee?",
      answer: "No hidden fees whatsoever. The price you see is all-inclusive, covering all features, updates, and Free support."
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Have more questions? <a href="#" className="text-emerald-600 dark:text-emerald-400 hover:underline">Contact our support team</a>
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="border border-slate-200 dark:border-slate-700/40 rounded-lg overflow-hidden"
          >
            <button
              className="flex justify-between items-center w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              onClick={() => toggleFaq(index)}
            >
              <span className="font-medium">{faq.question}</span>
              <ChevronDown
                className={`h-5 w-5 text-slate-400 transition-transform ${expandedFaq === index ? "transform rotate-180" : ""
                  }`}
              />
            </button>

            <AnimatePresence>
              {expandedFaq === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 text-slate-600 dark:text-slate-300 text-sm bg-slate-50/50 dark:bg-slate-800/30">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default BillingSection;
