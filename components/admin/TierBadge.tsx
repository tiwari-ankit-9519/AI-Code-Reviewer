export default function TierBadge({ tier }: { tier: string }) {
  const getTierStyles = () => {
    switch (tier) {
      case "STARTER":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "HERO":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "LEGEND":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getTierStyles()}`}
    >
      {tier}
    </span>
  );
}
