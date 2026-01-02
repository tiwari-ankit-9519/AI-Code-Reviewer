interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-black text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}
