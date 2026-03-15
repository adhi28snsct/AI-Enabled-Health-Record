// src/utils/riskUtils.js

export const getRiskBadge = (risk) => {
  switch (risk) {
    case "critical":
      return "bg-red-100 text-red-700";
    case "high":
      return "bg-orange-100 text-orange-700";
    case "moderate":
      return "bg-yellow-100 text-yellow-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export const getRiskColor = (risk) => {
  switch (risk) {
    case "critical":
      return "text-red-600";
    case "high":
      return "text-orange-600";
    case "moderate":
      return "text-yellow-600";
    case "low":
      return "text-green-600";
    default:
      return "text-gray-500";
  }
};