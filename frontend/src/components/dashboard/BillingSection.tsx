import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, HelpCircle, CreditCard, ChevronDown } from "lucide-react";

const BillingSection = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  // Plans data
  const plans = [
    {
      id: "basic",
      name: "Basic",
      description: "For individual developers",
      price: "$9",
      accent: "from-blue-400 to-blue-600",
      features: [
        "5 API keys", 
        "10,000 requests/month", 
        "Basic support", 
        "7-day log retention"
      ],
      buttonText: "Get Started",
      buttonStyle: "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/60"
    },
    {
      id: "pro",
      name: "Pro",
      description: "For teams and businesses",
      price: "$29",
      popular: true,
      accent: "from-emerald-400 to-emerald-600",
      features: [
        "Unlimited API keys", 
        "100,000 requests/month", 
        "Priority support", 
        "30-day log retention",
        "Advanced analytics",
        "Custom rate limits"
      ],
      buttonText: "Upgrade Now",
      buttonStyle: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/20"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large organizations",
      price: "Custom",
      accent: "from-violet-400 to-purple-600",
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

  // FAQ data
  const faqs = [
    {
      question: "How do I upgrade or downgrade my plan?",
      answer: "You can change your plan at any time from the billing section. Changes take effect at the start of your next billing cycle."
    },
    {
      question: "What happens if I exceed my monthly request limit?",
      answer: "If you exceed your monthly request limit, we'll notify you immediately. You can choose to upgrade your plan or pay for additional requests at our standard overage rate."
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes, all plans come with a 14-day free trial. No credit card required to get started."
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
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
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
      y: -8,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    }
  };

  const checkmarkVariants = {
    initial: { scale: 0.8, opacity: 0.8 },
    animate: { scale: 1, opacity: 1 }
  };

  const featureEntrance = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { 
        delay: i * 0.05,
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    })
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="mb-16 text-center">
        <h1 className="text-3xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 from-slate-700">Choose Your Plan</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Select the perfect plan that aligns with your requirements and scale as you grow
        </p>
      </motion.div>
      
      {/* Pricing Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            variants={planVariants}
            initial="initial"
            whileHover="hover"
            onHoverStart={() => setHoveredPlan(plan.id)}
            onHoverEnd={() => setHoveredPlan(null)}
            className={`relative rounded-2xl backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/40 bg-black/50 dark:bg-slate-900/50 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500 ${plan.popular ? 'ring-1 ring-emerald-500 dark:ring-emerald-400' : ''}`}
          >
            {/* Gradient top bar */}
            <div className={`h-1.5 w-full bg-gradient-to-r ${plan.accent}`}></div>
            
            {plan.popular && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute top-4 right-4"
              >
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Popular
                </span>
              </motion.div>
            )}
            
            <div className="p-8">
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 h-10">{plan.description}</p>
              
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-slate-500 dark:text-slate-400 text-sm ml-2">/month</span>}
              </div>
              
              <div className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <motion.div 
                    key={feature}
                    className="flex items-center"
                    custom={index}
                    variants={featureEntrance}
                    initial="hidden"
                    animate={hoveredPlan === plan.id ? "visible" : "hidden"}
                  >
                    <div className={`flex-shrink-0 mr-3 p-1 rounded-full bg-gradient-to-r ${plan.accent}`}>
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`mt-10 w-full rounded-lg py-3 text-sm font-medium transition-all ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Help Banner */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        className="mt-8 mb-20 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/40 bg-black/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm"
      >
        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-5">
            <motion.div 
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              className="bg-blue-50 dark:bg-blue-900/30 p-3.5 rounded-full"
            >
              <HelpCircle className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </motion.div>
            <div>
              <h3 className="text-lg font-semibold mb-1.5">Not sure which plan is right for you?</h3>
              <p className="text-slate-500 dark:text-slate-400">Schedule a free consultation with our team to find the perfect solution.</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md whitespace-nowrap"
          >
            Schedule a Demo
          </motion.button>
        </div>
      </motion.div>
      
      {/* FAQ Section */}
      <EnhancedFAQs />
      
      {/* Final CTA */}
      <motion.div 
        variants={itemVariants}
        className="mt-20 text-center"
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          All plans include our 14-day free trial. No credit card required.
        </p>
        <motion.div 
          className="mt-6 inline-flex"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 gap-2 py-6 px-6 text-base font-medium">
            <CreditCard className="h-5 w-5" />
            Get Started Now
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BillingSection;


const EnhancedFAQs = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Sign Up' button in the top right corner and fill out the registration form with your details."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. You can update your payment method in your account settings."
    },
    {
      question: "How do I reset my password?",
      answer: "Click on the 'Forgot Password' link on the login page. You'll receive an email with instructions to reset your password."
    }
  ];

  return (
    <motion.div 
      className="w-full max-w-3xl mx-auto px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <motion.h2 
        className="text-2xl font-semibold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Frequently Asked Questions
      </motion.h2>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="border border-slate-200/60 dark:border-slate-700/40 rounded-xl overflow-hidden bg-black/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm"
          >
            <motion.button
              onClick={() => toggleFaq(index)}
              className="w-full text-left p-5 flex justify-between items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
              whileHover={{ backgroundColor: "rgba(241, 245, 249, 0.5)" }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="font-medium">{faq.question}</span>
              <motion.div
                animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-slate-400 dark:text-slate-500"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.div>
            </motion.button>
            
            <AnimatePresence>
              {expandedFaq === index && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-2 text-slate-600 dark:text-slate-300 text-sm">
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