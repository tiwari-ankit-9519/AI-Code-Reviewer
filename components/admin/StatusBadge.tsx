export default function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = () => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "TRIALING":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "CANCELLED":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "PAST_DUE":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ");
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusStyles()}`}
    >
      {formatStatus(status)}
    </span>
  );
}
