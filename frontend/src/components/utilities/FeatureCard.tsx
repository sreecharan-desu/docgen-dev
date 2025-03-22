import { ReactNode } from "react";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="glass-card p-4 sm:p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-white/10">
      <div className="text-primary mb-3 sm:mb-4 text-xl sm:text-2xl">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm sm:text-base">{description}</p>
    </div>
  );
};
