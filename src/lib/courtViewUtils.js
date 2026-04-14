const colors = {
  front: "bg-orange-400 border-orange-500 text-white",
  back: "bg-sky-300 border-sky-400 text-slate-900",
  libero: "bg-pink-300 border-pink-400 text-slate-900",
  bench: "bg-white border-slate-300 text-slate-900",
};

const zoneColors = {
  zone1: { fill: "rgba(59, 130, 246, 0.20)", stroke: "#3b82f6", label: "青" },
  zone2: { fill: "rgba(239, 68, 68, 0.20)", stroke: "#ef4444", label: "赤" },
  zone3: { fill: "rgba(34, 197, 94, 0.20)", stroke: "#22c55e", label: "緑" },
  zone4: { fill: "rgba(234, 179, 8, 0.20)", stroke: "#eab308", label: "黄" },
};

function getDisplayModeFromSlot(player, slotAssignments) {
  if (player.position === "Li") return "libero";

  const slotKey = slotAssignments?.[player.id];
  if (slotKey === "LF" || slotKey === "CF" || slotKey === "RF") return "front";
  return "back";
}

export { colors, getDisplayModeFromSlot, zoneColors };
