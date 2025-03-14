import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, HelpCircle, CreditCard } from "lucide-react";

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
      accent: "from-blue-400 to-blue-500",
      features: [
        "5 API keys", 
        "10,000 requests/month", 
        "Basic support", 
        "7-day log retention"
      ],
      buttonText: "Get Started",
      buttonStyle: "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
    },
    {
      id: "pro",
      name: "Pro",
      description: "For teams and businesses",
      price: "$29",
      popular: true,
      accent: "from-emerald-400 to-emerald-500",
      features: [
        "Unlimited API keys", 
        "100,000 requests/month", 
        "Priority support", 
        "30-day log retention",
        "Advanced analytics",
        "Custom rate limits"
      ],
      buttonText: "Upgrade Now",
      buttonStyle: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large organizations",
      price: "Custom",
      accent: "from-violet-400 to-purple-500",
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
      buttonStyle: "bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/30"
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
        staggerChildren: 0.1
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
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      y: -5,
      transition: { type: "spring", stiffness: 400, damping: 20 }
    }
  };

  const checkmarkVariants = {
    initial: { scale: 0.8, opacity: 0.8 },
    animate: { scale: 1, opacity: 1 }
  };

  return (
    <motion.div
      className="max-w-5xl mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="mb-12 text-center">
        <h1 className="text-3xl font-medium mb-3">Choose Your Plan</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Select the perfect plan that aligns with your requirements and scale as you grow
        </p>
      </motion.div>
      
      {/* Pricing Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            variants={planVariants}
            initial="initial"
            whileHover="hover"
            onHoverStart={() => setHoveredPlan(plan.id)}
            onHoverEnd={() => setHoveredPlan(null)}
            className={`relative rounded-xl border border-slate-200/40 dark:border-slate-800/40 rgb(13 17 23 / var(--tw-bg-opacity)) dark:bg-slate-900/60 overflow-hidden backdrop-blur-sm ${plan.popular ? 'ring-1 ring-emerald-500' : ''}`}
          >
            {/* Gradient top bar */}
            <div className={`h-1 w-full bg-gradient-to-r ${plan.accent}`}></div>
            
            {plan.popular && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Popular
                </span>
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-medium">{plan.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{plan.description}</p>
              
              <div className="mt-5 flex items-baseline">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">/month</span>}
              </div>
              
              <div className="mt-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <motion.div 
                    key={feature}
                    className="flex items-center"
                    initial="initial"
                    animate={hoveredPlan === plan.id ? "animate" : "initial"}
                    variants={checkmarkVariants}
                    custom={index}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className={`mr-2 p-0.5 rounded-full bg-gradient-to-r ${plan.accent}`}>
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`mt-8 w-full rounded-lg py-2.5 text-sm font-medium transition-all ${plan.buttonStyle}`}
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
        className="mt-8 mb-16 rounded-xl border border-slate-200/40 dark:border-slate-800/40 rgb(13 17 23 / var(--tw-bg-opacity)) dark:bg-slate-900/60 backdrop-blur-sm overflow-hidden"
      >
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full">
              <HelpCircle className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1">Not sure which plan is right for you?</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Schedule a free consultation with our team to find the perfect solution.</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all whitespace-nowrap"
          >
            Schedule a Demo
          </motion.button>
        </div>
      </motion.div>
      
      {/* FAQ Section */}
      
      <FaQs/>
      
      {/* Final CTA */}
      <motion.div 
        variants={itemVariants}
        className="mt-16 text-center"
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          All plans include our 14-day free trial. No credit card required.
        </p>
        <motion.div 
          className="mt-6 inline-flex"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 gap-2">
            <CreditCard className="h-4 w-4" />
            Get Started Now
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BillingSection;



const FaQs = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const toggleFaq = (index) => {
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
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggleFaq(index)}
              className="w-full text-left p-4 flex justify-between items-center rgb(13 17 23 / var(--tw-bg-opacity)) hover:bg-gray-500 transition-colors"
            >
              <span className="font-medium">{faq.question}</span>
              <span className="text-gray-500">
                {expandedFaq === index ? "−" : "+"}
              </span>
            </button>
            
            {expandedFaq === index && (
              <div className="p-4 rgb(13 17 23 / var(--tw-bg-opacity))">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

