export default function LeadStatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status) {
      case "NEW":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "CONTACTED":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "QUALIFIED":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "CONVERTED":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "LOST":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusStyles()}`}
    >
      {status}
    </span>
  );
}
