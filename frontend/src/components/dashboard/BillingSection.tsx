import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const BillingSection = () => {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing</h1>
        <p className="text-muted-foreground">Choose a plan that's right for your needs</p>
      </div>
      
      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Plan */}
        <motion.div
          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-xl border border-border/60 bg-card"
        >
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-green-400"></div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold">Basic</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">For individual developers</p>
            
            <div className="mt-5 flex items-baseline">
              <span className="text-3xl font-bold">$9</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
            
            <ul className="mt-6 space-y-3">
              {["5 API keys", "10,000 requests/month", "Basic support", "7-day log retention"].map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 w-full rounded-lg bg-green-100 py-2.5 text-sm font-medium text-green-700 hover:bg-green-200 transition-colors"
            >
              Get Started
            </motion.button>
          </div>
        </motion.div>
        
        {/* Pro Plan - Featured */}
        <motion.div
          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-xl border-2 border-green-500 bg-card"
        >
          {/* Popular badge */}
          <div className="absolute top-0 right-0">
            <div className="relative h-20 w-20 overflow-hidden">
              <div className="absolute top-0 right-0 h-10 w-10 -translate-y-1/2 translate-x-1/2 rotate-45 bg-green-500"></div>
              <div className="absolute bottom-0 right-0 rotate-45 transform text-[10px] font-bold text-white">
                <div className="absolute bottom-3.5 right-0 w-[65px] text-center">POPULAR</div>
              </div>
            </div>
          </div>
          
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-green-500"></div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold">Pro</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">For teams and businesses</p>
            
            <div className="mt-5 flex items-baseline">
              <span className="text-3xl font-bold">$29</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
            
            <ul className="mt-6 space-y-3">
              {[
                "Unlimited API keys", 
                "100,000 requests/month", 
                "Priority support", 
                "30-day log retention",
                "Advanced analytics",
                "Custom rate limits"
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 w-full rounded-lg bg-green-500 py-2.5 text-sm font-medium text-white hover:bg-green-600 transition-colors"
            >
              Upgrade Now
            </motion.button>
          </div>
        </motion.div>
        
        {/* Enterprise Plan */}
        <motion.div
          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-xl border border-border/60 bg-card"
        >
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-purple-500"></div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold">Enterprise</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">For large organizations</p>
            
            <div className="mt-5 flex items-baseline">
              <span className="text-3xl font-bold">Custom</span>
            </div>
            
            <ul className="mt-6 space-y-3">
              {[
                "Unlimited everything", 
                "24/7 dedicated support", 
                "SLA guarantees", 
                "90-day log retention",
                "Custom integrations",
                "Dedicated account manager",
                "On-premise deployment options"
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg className="h-5 w-5 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 w-full rounded-lg bg-purple-100 py-2.5 text-sm font-medium text-purple-700 hover:bg-purple-200 transition-colors"
            >
              Contact Sales
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      {/* Additional information */}
      <div className="mt-12 rounded-lg border border-border/60 p-6 bg-card/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium">Need help choosing a plan?</h3>
            <p className="text-muted-foreground mt-1">Our team is ready to assist you in finding the perfect solution for your needs.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg bg-background border border-border hover:border-green-500 transition-colors text-sm"
          >
            Schedule a Demo
          </motion.button>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              question: "How do I upgrade or downgrade my plan?",
              answer: "You can change your plan at any time from the billing section. Changes take effect at the start of your next billing cycle."
            },
            {
              question: "What happens if I exceed my monthly request limit?",
              answer: "If you exceed your monthly request limit, you'll be charged for additional requests at our standard overage rate."
            },
            {
              question: "Do you offer a free trial?",
              answer: "Yes, all plans come with a 14-day free trial. No credit card required to get started."
            }
          ].map((faq, index) => (
            <div key={index} className="rounded-lg border border-border/60 p-4">
              <h3 className="font-medium">{faq.question}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingSection; 