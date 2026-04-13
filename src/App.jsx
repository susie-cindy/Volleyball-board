import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Save,
  Upload,
  PencilLine,
  Move,
  Undo2,
  Trash2,
  RefreshCcw,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";

const COURT_W = 620;
const COURT_H = 620;
const COURT_INSET = 40;

const rotationOptions = [
  { key: "R1", label: "ローテ1" },
  { key: "R2", label: "ローテ2" },
  { key: "R3", label: "ローテ3" },
  { key: "R4", label: "ローテ4" },
  { key: "R5", label: "ローテ5" },
  { key: "R6", label: "ローテ6" },
];

const patternOptions = [
  { key: "basic", label: "①基本" },
  { key: "receive", label: "②レセ" },
  { key: "serveBase", label: "③味方サーブ" },
  { key: "defenseLeft", label: "④相手L" },
  { key: "defenseCenter", label: "⑤相手C" },
  { key: "defenseRight", label: "⑥相手R" },
];

const positions = ["S", "L", "C", "R", "Li"];
const STORAGE_KEY = "volleyball-tactics-board-data-v1";

const colors = {
  front: "bg-orange-400 border-orange-500 text-white",
  back: "bg-sky-300 border-sky-400 text-slate-900",
  libero: "bg-pink-300 border-pink-400 text-slate-900",
  bench: "bg-white border-slate-300 text-slate-900",
};

const arrowStroke = {
  normal: { color: "#2563eb", dash: "0", width: 4 },
  attack: { color: "#dc2626", dash: "0", width: 5 },
  dotted: { color: "#7c3aed", dash: "10 8", width: 4 },
};

const receiveOverlayModes = [
  { key: "attackOnly", label: "攻撃矢印" },
  { key: "shiftOnly", label: "チェンジ矢印" },
  { key: "both", label: "両方" },
  { key: "none", label: "矢印なし" },
];

const initialPlayers = [
  {
    id: "p1",
    name: "鈴木",
    shortName: "鈴",
    number: "1",
    position: "S",
    mode: "back",
    court: true,
  },
  {
    id: "p2",
    name: "田中",
    shortName: "田",
    number: "2",
    position: "L",
    mode: "front",
    court: true,
  },
  {
    id: "p3",
    name: "山本",
    shortName: "山",
    number: "3",
    position: "C",
    mode: "front",
    court: true,
  },
  {
    id: "p4",
    name: "高橋",
    shortName: "高",
    number: "4",
    position: "R",
    mode: "front",
    court: true,
  },
  {
    id: "p5",
    name: "中村",
    shortName: "中",
    number: "5",
    position: "L",
    mode: "back",
    court: true,
  },
  {
    id: "p6",
    name: "小林",
    shortName: "小",
    number: "6",
    position: "C",
    mode: "back",
    court: true,
  },
  {
    id: "p7",
    name: "伊藤",
    shortName: "伊",
    number: "7",
    position: "C",
    mode: "back",
    court: false,
  },
  {
    id: "p8",
    name: "渡辺",
    shortName: "渡",
    number: "8",
    position: "R",
    mode: "back",
    court: false,
  },
  {
    id: "p9",
    name: "加藤",
    shortName: "加",
    number: "9",
    position: "L",
    mode: "back",
    court: false,
  },
  {
    id: "p10",
    name: "",
    shortName: "",
    number: "10",
    position: "L",
    mode: "back",
    court: false,
  },
  {
    id: "p11",
    name: "",
    shortName: "",
    number: "11",
    position: "C",
    mode: "back",
    court: false,
  },
  {
    id: "p12",
    name: "",
    shortName: "",
    number: "12",
    position: "Li",
    mode: "back",
    court: false,
  },
];

const initialOwnTeamMaster = [
  {
    id: "p1",
    name: "鈴木",
    shortName: "鈴",
    number: "1",
    position: "S",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
  {
    id: "p2",
    name: "田中",
    shortName: "田",
    number: "2",
    position: "L",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
  {
    id: "p3",
    name: "山本",
    shortName: "山",
    number: "3",
    position: "C",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
  {
    id: "p4",
    name: "高橋",
    shortName: "高",
    number: "4",
    position: "R",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
  {
    id: "p5",
    name: "中村",
    shortName: "中",
    number: "5",
    position: "L",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
  {
    id: "p6",
    name: "小林",
    shortName: "小",
    number: "6",
    position: "C",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
  {
    id: "p7",
    name: "伊藤",
    shortName: "伊",
    number: "7",
    position: "C",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
  {
    id: "p8",
    name: "渡辺",
    shortName: "渡",
    number: "8",
    position: "R",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
  {
    id: "p9",
    name: "加藤",
    shortName: "加",
    number: "9",
    position: "L",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
  {
    id: "p10",
    name: "",
    shortName: "",
    number: "10",
    position: "L",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
  {
    id: "p11",
    name: "",
    shortName: "",
    number: "11",
    position: "C",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
  {
    id: "p12",
    name: "",
    shortName: "",
    number: "12",
    position: "Li",
    grade: "",
    height: "",
    reach: "",
    spikeReach: "",
  },
];

function getDisplayModeFromSlot(player, slotAssignments) {
  if (player.position === "Li") return "libero";

  const slotKey = slotAssignments?.[player.id];
  if (slotKey === "LF" || slotKey === "CF" || slotKey === "RF") return "front";
  return "back";
}

const baseCourtLayout = {
  p4: { x: 130, y: 200 }, // 左前
  p3: { x: 310, y: 200 }, // 中前
  p2: { x: 490, y: 200 }, // 右前
  p5: { x: 130, y: 450 }, // 左後
  p6: { x: 310, y: 450 }, // 中後
  p1: { x: 490, y: 450 }, // 右後
};

const basicSlotCoordinates = {
  LF: { x: 130, y: 200 },
  CF: { x: 310, y: 200 },
  RF: { x: 490, y: 200 },
  LB: { x: 130, y: 450 },
  CB: { x: 310, y: 450 },
  RB: { x: 490, y: 450 },
};

const rotationCycle = ["LF", "CF", "RF", "RB", "CB", "LB"];

const serveOrderToSlot = {
  1: "RB",
  2: "RF",
  3: "CF",
  4: "LF",
  5: "LB",
  6: "CB",
};

const zoneColors = {
  zone1: { fill: "rgba(59, 130, 246, 0.20)", stroke: "#3b82f6", label: "青" },
  zone2: { fill: "rgba(239, 68, 68, 0.20)", stroke: "#ef4444", label: "赤" },
  zone3: { fill: "rgba(34, 197, 94, 0.20)", stroke: "#22c55e", label: "緑" },
  zone4: { fill: "rgba(234, 179, 8, 0.20)", stroke: "#eab308", label: "黄" },
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadInitialData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = makeInitialData();

    if (!saved) return initial;

    const parsed = JSON.parse(saved);

    const savedMaster = parsed.ownTeamMaster || [];
    const mergedOwnTeamMaster = initial.ownTeamMaster.map((initialPlayer) => {
      const savedPlayer = savedMaster.find((p) => p.id === initialPlayer.id);
      return savedPlayer ? { ...initialPlayer, ...savedPlayer } : initialPlayer;
    });

    return {
      ...initial,
      ...parsed,
      ownTeamMaster: mergedOwnTeamMaster,
    };
  } catch (error) {
    console.error("ローカル保存データの読込に失敗しました", error);
    return makeInitialData();
  }
}

function makePatternState() {
  return {
    players: clone(initialPlayers),
    coordinates: clone(baseCourtLayout),
    slotAssignments: {
      p4: "LF",
      p3: "CF",
      p2: "RF",
      p5: "LB",
      p6: "CB",
      p1: "RB",
    },
    arrows: {
      general: [],
      receiveAttack: [],
      receiveShift: [],
    },
    zones: [],
    note: "",
  };
}

function buildRotation1BasicPattern(matchSetup = makeInitialData().matchSetup) {
  const starterIds = Object.values(matchSetup.starters || {}).filter(Boolean);

  const nextPlayers = initialPlayers.map((p) => ({
    ...p,
    court: starterIds.includes(p.id),
  }));

  const nextCoordinates = {};
  const nextSlotAssignments = {};

  Object.entries(matchSetup.starters || {}).forEach(
    ([serveOrder, playerId]) => {
      const slotKey = serveOrderToSlot[serveOrder];
      const coord = basicSlotCoordinates[slotKey];
      if (!coord || !playerId) return;

      nextCoordinates[playerId] = { ...coord };
      nextSlotAssignments[playerId] = slotKey;
    },
  );

  return {
    players: nextPlayers,
    coordinates: nextCoordinates,
    slotAssignments: nextSlotAssignments,
    arrows: {
      general: [],
      receiveAttack: [],
      receiveShift: [],
    },
    note: "",
  };
}

function applyLiberoToPattern(pattern, matchSetup, patternKey = "basic") {
  const liberoPlayerId = matchSetup.liberoPlayerId;
  const liberoTargets = matchSetup.liberoTargets || [];

  if (!liberoPlayerId || liberoTargets.length === 0) {
    return pattern;
  }

  const next = clone(pattern);
  const frontSlots = ["LF", "CF", "RF"];

  const targetPlayerIdOnBack = liberoTargets.find((targetId) => {
    const slotKey = next.slotAssignments?.[targetId];
    return slotKey && !frontSlots.includes(slotKey);
  });

  if (!targetPlayerIdOnBack) {
    return next;
  }

  const targetSlotKey = next.slotAssignments?.[targetPlayerIdOnBack];

  // ③味方サーブでは、サーブ順（後衛右/RB）にいる対象選手はリベロに置換しない
  if (patternKey === "serveBase" && targetSlotKey === "RB") {
    return next;
  }

  const targetPlayer = next.players.find((p) => p.id === targetPlayerIdOnBack);
  const liberoPlayer = next.players.find((p) => p.id === liberoPlayerId);

  if (!targetPlayer || !liberoPlayer) {
    return next;
  }

  liberoPlayer.court = true;
  targetPlayer.court = false;

  next.coordinates[liberoPlayer.id] = { ...next.coordinates[targetPlayer.id] };
  delete next.coordinates[targetPlayer.id];

  next.slotAssignments[liberoPlayer.id] = next.slotAssignments[targetPlayer.id];
  delete next.slotAssignments[targetPlayer.id];

  return next;
}

function makeInitialData() {
  const rotations = {};
  rotationOptions.forEach((r) => {
    rotations[r.key] = {
      memo: "",
    };

    patternOptions.forEach((p) => {
      rotations[r.key][p.key] = makePatternState();
    });
  });

  return {
    teamName: "〇〇中",
    ownTeamMaster: clone(initialOwnTeamMaster),
    matchSetup: {
      starters: {
        1: "p1",
        2: "p2",
        3: "p3",
        4: "p4",
        5: "p5",
        6: "p6",
      },
      liberoPlayerId: "p12",
      liberoTargets: ["p3", "p6"],
    },
    displayMode: "half",
    selectedRotation: "R1",
    selectedPattern: "basic",
    receiveOverlayMode: "both",
    rotations,
  };
}

function getPointFromEvent(event, element) {
  const rect = element.getBoundingClientRect();
  return {
    x: Math.max(36, Math.min(COURT_W - 36, event.clientX - rect.left)),
    y: Math.max(36, Math.min(COURT_H - 36, event.clientY - rect.top)),
  };
}

function formatTempoLabel(tempo) {
  if (tempo === "open") return "オープン";
  if (tempo === "semi") return "セミ";
  if (tempo === "quick") return "クイック";
  return "";
}

function getRotationIndex(rotationKey) {
  const map = {
    R1: 0,
    R2: 1,
    R3: 2,
    R4: 3,
    R5: 4,
    R6: 5,
  };
  return map[rotationKey] ?? 0;
}

function arrowGroupsForPattern(pattern, overlayMode) {
  if (pattern !== "receive") return ["general"];
  if (overlayMode === "attackOnly") return ["receiveAttack"];
  if (overlayMode === "shiftOnly") return ["receiveShift"];
  if (overlayMode === "both") return ["receiveAttack", "receiveShift"];
  return [];
}

function getEditingGroup(pattern, activeReceiveArrowSet) {
  if (pattern !== "receive") return "general";
  return activeReceiveArrowSet;
}

function PlayerChip({ player, selected, onClick, displayMode = "bench" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border p-3 text-left transition hover:shadow-sm",
        selected
          ? "border-slate-900 ring-2 ring-slate-300"
          : "border-slate-200",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg font-bold",
              colors[displayMode],
            )}
          >
            {player.shortName || "未"}
          </div>
          <div>
            <div className="font-medium text-slate-900">
              {player.name || "未登録選手"}
            </div>
            <div className="text-xs text-slate-500">
              #{player.number || "-"} / {player.position || "-"}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function buildDerivedBasicPattern(masterPattern, rotationKey) {
  const rotationIndex = getRotationIndex(rotationKey);

  const nextPlayers = masterPattern.players.map((p) => ({
    ...p,
    court: false,
  }));
  const nextCoordinates = {};
  const nextSlotAssignments = {};

  const slotToPlayerId = {};
  Object.entries(masterPattern.slotAssignments || {}).forEach(
    ([playerId, slotKey]) => {
      slotToPlayerId[slotKey] = playerId;
    },
  );

  const rotatedSlotToPlayerId = {};

  rotationCycle.forEach((slotKey, index) => {
    const newIndex = (index + rotationIndex) % rotationCycle.length;
    const newSlotKey = rotationCycle[newIndex];
    rotatedSlotToPlayerId[newSlotKey] = slotToPlayerId[slotKey];
  });

  Object.entries(rotatedSlotToPlayerId).forEach(([slotKey, playerId]) => {
    const target = nextPlayers.find((p) => p.id === playerId);
    if (!target) return;

    target.court = true;
    nextCoordinates[target.id] = { ...basicSlotCoordinates[slotKey] };
    nextSlotAssignments[target.id] = slotKey;
  });

  return {
    players: nextPlayers,
    coordinates: nextCoordinates,
    slotAssignments: nextSlotAssignments,
    arrows: {
      general: [],
      receiveAttack: [],
      receiveShift: [],
    },
    note: "",
  };
}

function buildPatternBaseFromMatchSetup(matchSetup, rotationKey, patternKey) {
  const basePattern = buildDerivedBasicPattern(
    buildRotation1BasicPattern(matchSetup),
    rotationKey,
  );

  return applyLiberoToPattern(basePattern, matchSetup, patternKey);
}

function syncPatternWithMatchSetup(currentPattern, matchSetup, rotationKey, patternKey) {
  const nextBasePattern = buildPatternBaseFromMatchSetup(
    matchSetup,
    rotationKey,
    patternKey,
  );

  const nextCoordinates = {};
  Object.entries(nextBasePattern.slotAssignments || {}).forEach(
    ([nextPlayerId, slotKey]) => {
      const currentPlayerId = Object.entries(currentPattern.slotAssignments || {}).find(
        ([, currentSlotKey]) => currentSlotKey === slotKey,
      )?.[0];

      nextCoordinates[nextPlayerId] = clone(
        (currentPlayerId && currentPattern.coordinates?.[currentPlayerId]) ||
          nextBasePattern.coordinates?.[nextPlayerId] ||
          basicSlotCoordinates[slotKey],
      );
    },
  );

  return {
    ...currentPattern,
    players: nextBasePattern.players.map((player) => ({ ...player })),
    coordinates: nextCoordinates,
    slotAssignments: clone(nextBasePattern.slotAssignments || {}),
  };
}

export default function VolleyballTacticsBoardApp() {
  const fileInputRef = useRef(null);
  const courtRef = useRef(null);

  const [data, setData] = useState(() => loadInitialData());
  const [selectedPlayerId, setSelectedPlayerId] = useState("p1");
  const [interactionMode, setInteractionMode] = useState("move");
  const [arrowType, setArrowType] = useState("normal");
  const [attackTempo, setAttackTempo] = useState("open");
  const [activeReceiveArrowSet, setActiveReceiveArrowSet] =
    useState("receiveAttack");
  const [draggingPlayerId, setDraggingPlayerId] = useState(null);
  const [selectedBenchId, setSelectedBenchId] = useState(null);
  const [arrowDraftStart, setArrowDraftStart] = useState(null);

  const [selectedZoneColor, setSelectedZoneColor] = useState("zone1");
  const [zoneDraftPoints, setZoneDraftPoints] = useState([]);

  const [basicDraftPattern, setBasicDraftPattern] = useState(() =>
    applyLiberoToPattern(
      buildDerivedBasicPattern(
        buildRotation1BasicPattern(makeInitialData().matchSetup),
        "R1",
      ),
      makeInitialData().matchSetup,
    ),
  );

  const isBasicPattern = data.selectedPattern === "basic";

  // ①基本はローテ/パターン切替時にテンプレ配置へ戻したいので、
  // 一時ドラフト状態を useEffect で再生成している。
  // React/ESLint 的には setState in effect の警告が出るが、現状の仕様優先で許容。
  useEffect(() => {
    if (isBasicPattern) {
      const basePattern = buildDerivedBasicPattern(
        buildRotation1BasicPattern(data.matchSetup),
        data.selectedRotation,
      );

      setBasicDraftPattern(
        applyLiberoToPattern(basePattern, data.matchSetup, "basic"),
      );

      setSelectedBenchId(null);
      setArrowDraftStart(null);
    }
  }, [isBasicPattern, data.selectedRotation, data.matchSetup]);

  const currentPattern =
    data.selectedPattern === "basic"
      ? basicDraftPattern
      : data.rotations[data.selectedRotation][data.selectedPattern];
  const currentRotation = data.rotations[data.selectedRotation];
  const currentRotationMemo = currentRotation?.memo || "";

  const players = currentPattern.players;
  const coordinates = currentPattern.coordinates;
  const slotAssignments = currentPattern.slotAssignments || {};

  const zones = currentPattern.zones || [];

  const displayPlayers = players.map((player) => {
    const master = data.ownTeamMaster.find((m) => m.id === player.id);
    if (!master) return player;

    return {
      ...player,
      name: master.name,
      shortName: master.shortName,
      number: master.number,
      position: master.position,
    };
  });

  const matchSetup = data.matchSetup;
  const liberoTargets = matchSetup.liberoTargets || [];

  const selectedPlayer =
    displayPlayers.find((p) => p.id === selectedPlayerId) ||
    displayPlayers.find((p) => p.court) ||
    null;

  const selectedMasterPlayer =
    data.ownTeamMaster.find((p) => p.id === selectedPlayerId) || null;

  const courtPlayerIds = new Set(
    displayPlayers.filter((p) => p.court).map((p) => p.id),
  );

  const courtPlayers = data.ownTeamMaster.filter((p) =>
    courtPlayerIds.has(p.id),
  );

  const liberoBenchPlayers = data.ownTeamMaster.filter(
    (p) => !courtPlayerIds.has(p.id) && liberoTargets.includes(p.id),
  );

  const benchPlayers = data.ownTeamMaster.filter(
    (p) => !courtPlayerIds.has(p.id) && !liberoTargets.includes(p.id),
  );

  console.log("ownTeamMaster length", data.ownTeamMaster?.length);
  console.log("courtPlayers length", courtPlayers?.length);
  console.log("liberoBenchPlayers length", liberoBenchPlayers?.length);
  console.log("benchPlayers length", benchPlayers?.length);

  useEffect(() => {
    if (
      selectedPlayerId &&
      displayPlayers.some((p) => p.id === selectedPlayerId)
    ) {
      return;
    }

    const firstCourtPlayer = displayPlayers.find((p) => p.court);
    if (firstCourtPlayer) {
      setSelectedPlayerId(firstCourtPlayer.id);
    }
  }, [displayPlayers, selectedPlayerId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("ローカル保存データの保存に失敗しました", error);
    }
  }, [data]);

  const visibleArrowGroups = arrowGroupsForPattern(
    data.selectedPattern,
    data.receiveOverlayMode,
  );
  const visibleArrows = visibleArrowGroups.flatMap((group) =>
    (currentPattern.arrows[group] || []).map((arrow) => ({ ...arrow, group })),
  );

  const displayedTitle = useMemo(() => {
    const r = rotationOptions.find(
      (x) => x.key === data.selectedRotation,
    )?.label;
    const p = patternOptions.find((x) => x.key === data.selectedPattern)?.label;
    return `${r} - ${p}`;
  }, [data.selectedPattern, data.selectedRotation]);

  const updateCurrentPattern = (updater) => {
    setData((prev) => {
      const next = clone(prev);
      const target =
        next.rotations[next.selectedRotation][next.selectedPattern];
      updater(target, next);
      return next;
    });
  };

  const updateCurrentRotationMemo = (memo) => {
    setData((prev) => ({
      ...prev,
      rotations: {
        ...prev.rotations,
        [prev.selectedRotation]: {
          ...prev.rotations[prev.selectedRotation],
          memo,
        },
      },
    }));
  };

  const updateBasicDraftPattern = (updater) => {
    setBasicDraftPattern((prev) => {
      const next = clone(prev);
      updater(next);
      return next;
    });
  };

  const applyBasicLayoutToCurrentPattern = () => {
    const basePattern = buildDerivedBasicPattern(
      buildRotation1BasicPattern(data.matchSetup),
      data.selectedRotation,
    );

    const patternWithLibero = applyLiberoToPattern(
      basePattern,
      data.matchSetup,
      data.selectedPattern,
    );

    updateCurrentPattern((target) => {
      target.players = patternWithLibero.players.map((p) => ({ ...p }));
      target.coordinates = clone(patternWithLibero.coordinates);
      target.slotAssignments = clone(patternWithLibero.slotAssignments || {});
    });
  };

  const updateSelectedMasterPlayer = (patch) => {
    setData((prev) => {
      const next = clone(prev);
      const masterPlayer = next.ownTeamMaster.find(
        (p) => p.id === selectedPlayerId,
      );
      if (!masterPlayer) return prev;

      Object.assign(masterPlayer, patch);
      return next;
    });
  };

  const updateMatchSetup = (updater) => {
    setData((prev) => {
      const next = clone(prev);
      const previousStarters = { ...(next.matchSetup.starters || {}) };
      updater(next.matchSetup);

      const nextStarters = next.matchSetup.starters || {};
      const nextLiberoTargets = [...(next.matchSetup.liberoTargets || [])];

      Object.entries(nextStarters).forEach(([serveOrder, nextPlayerId]) => {
        const previousPlayerId = previousStarters[serveOrder];
        if (!previousPlayerId || previousPlayerId === nextPlayerId) return;

        nextLiberoTargets.forEach((targetPlayerId, index) => {
          if (targetPlayerId === previousPlayerId) {
            nextLiberoTargets[index] = nextPlayerId;
          }
        });
      });

      next.matchSetup.liberoTargets = nextLiberoTargets;

      rotationOptions.forEach((rotation) => {
        patternOptions.forEach((pattern) => {
          if (pattern.key === "basic") return;

          next.rotations[rotation.key][pattern.key] = syncPatternWithMatchSetup(
            next.rotations[rotation.key][pattern.key],
            next.matchSetup,
            rotation.key,
            pattern.key,
          );
        });
      });

      return next;
    });
  };

  const handlePointerDownPlayer = (event, playerId) => {
    setSelectedPlayerId(playerId);

    if (interactionMode !== "move") return;

    setDraggingPlayerId(playerId);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMoveCourt = (event) => {
    if (!draggingPlayerId || !courtRef.current) return;
    const point = getPointFromEvent(event, courtRef.current);

    if (data.selectedPattern === "basic") {
      updateBasicDraftPattern((target) => {
        target.coordinates[draggingPlayerId] = point;
      });
      return;
    }

    updateCurrentPattern((target) => {
      target.coordinates[draggingPlayerId] = point;
    });
  };

  const handlePointerUpCourt = () => {
    setDraggingPlayerId(null);
  };

  const addZonePoint = (point) => {
    if (zones.length >= 4) return;
    setZoneDraftPoints((prev) => [...prev, point]);
  };

  const completeZoneDraft = () => {
    if (zoneDraftPoints.length < 3) return;
    if (zones.length >= 4) return;

    const newZone = {
      id: `zone-${Date.now()}`,
      colorKey: selectedZoneColor,
      points: clone(zoneDraftPoints),
    };

    updateCurrentPattern((target) => {
      if (!target.zones) target.zones = [];
      target.zones.push(newZone);
    });

    setZoneDraftPoints([]);
  };

  const undoZonePoint = () => {
    setZoneDraftPoints((prev) => prev.slice(0, -1));
  };

  const clearZoneDraft = () => {
    setZoneDraftPoints([]);
  };

  const removeLastZone = () => {
    updateCurrentPattern((target) => {
      if (!target.zones || target.zones.length === 0) return;
      target.zones.pop();
    });
  };

  const handleCourtClick = (event) => {
    if (isBasicPattern) return;
    if (!courtRef.current) return;

    const point = getPointFromEvent(event, courtRef.current);

    if (interactionMode === "zone") {
      addZonePoint(point);
      return;
    }

    if (interactionMode !== "arrow") return;

    if (!arrowDraftStart) {
      setArrowDraftStart(point);
      return;
    }

    const newArrow = {
      id: `arrow-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: arrowType,
      start: arrowDraftStart,
      end: point,
      tempo: arrowType === "attack" ? attackTempo : null,
    };

    const group = getEditingGroup(data.selectedPattern, activeReceiveArrowSet);
    updateCurrentPattern((target) => {
      if (!target.arrows[group]) target.arrows[group] = [];
      target.arrows[group].push(newArrow);
    });

    setArrowDraftStart(null);
  };

  const resetCurrentPattern = () => {
    updateCurrentPattern((target) => {
      const fresh = makePatternState();
      target.players = fresh.players;
      target.coordinates = fresh.coordinates;
      target.arrows = fresh.arrows;
      target.note = "";
    });
    setSelectedBenchId(null);
    setArrowDraftStart(null);
  };

  const handleSelectBench = (benchId) => {
    if (isBasicPattern) return;
    setSelectedBenchId((prev) => (prev === benchId ? null : benchId));
  };

  const handleTapCourtPlayerForSub = (courtPlayerId) => {
    if (data.selectedPattern === "basic") {
      setSelectedPlayerId(courtPlayerId);
      return;
    }

    updateCurrentPattern((target) => {
      const bench = target.players.find((p) => p.id === selectedBenchId);
      const court = target.players.find((p) => p.id === courtPlayerId);
      if (!bench || !court) return;
      if (bench.court || !court.court) return;

      bench.court = true;
      court.court = false;

      const courtPos = target.coordinates[court.id] || { x: 300, y: 200 };
      target.coordinates[bench.id] = courtPos;
      delete target.coordinates[court.id];
    });

    setSelectedPlayerId(selectedBenchId);
    setSelectedBenchId(null);
  };

  const removeLastArrow = () => {
    const group = getEditingGroup(data.selectedPattern, activeReceiveArrowSet);
    updateCurrentPattern((target) => {
      const list = target.arrows[group] || [];
      list.pop();
    });
    setArrowDraftStart(null);
  };

  const clearCurrentArrowGroup = () => {
    const group = getEditingGroup(data.selectedPattern, activeReceiveArrowSet);
    updateCurrentPattern((target) => {
      target.arrows[group] = [];
    });
    setArrowDraftStart(null);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `volleyball-board-${data.teamName || "team"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const initial = makeInitialData();

      const savedMaster = Array.isArray(parsed.ownTeamMaster)
        ? parsed.ownTeamMaster
        : [];

      const mergedOwnTeamMaster = initial.ownTeamMaster.map((initialPlayer) => {
        const savedPlayer = savedMaster.find((p) => p.id === initialPlayer.id);
        return savedPlayer
          ? { ...initialPlayer, ...savedPlayer }
          : initialPlayer;
      });

      const mergedData = {
        ...initial,
        ...parsed,
        ownTeamMaster: mergedOwnTeamMaster,
        matchSetup: {
          ...initial.matchSetup,
          ...(parsed.matchSetup || {}),
          starters: {
            ...initial.matchSetup.starters,
            ...(parsed.matchSetup?.starters || {}),
          },
        },
      };

      setData(mergedData);

      const selectedId =
        mergedData.ownTeamMaster.find((p) => p.id === selectedPlayerId)?.id ||
        mergedData.ownTeamMaster[0]?.id ||
        "p1";

      setSelectedPlayerId(selectedId);
      setSelectedBenchId(null);
      setArrowDraftStart(null);
    } catch (error) {
      console.error("JSON読込に失敗しました", error);
      alert("JSONファイルの読み込みに失敗しました");
    } finally {
      event.target.value = "";
    }
  };
  const renderArrow = (arrow) => {
    const style = arrowStroke[arrow.type];
    const dx = arrow.end.x - arrow.start.x;
    const dy = arrow.end.y - arrow.start.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / len;
    const uy = dy / len;
    const headLen = 16;
    const headW = 8;
    const hx = arrow.end.x - ux * headLen;
    const hy = arrow.end.y - uy * headLen;
    const leftX = hx - uy * headW;
    const leftY = hy + ux * headW;
    const rightX = hx + uy * headW;
    const rightY = hy - ux * headW;
    const labelX = (arrow.start.x + arrow.end.x) / 2;
    const labelY = (arrow.start.y + arrow.end.y) / 2 - 12;

    return (
      <g key={arrow.id}>
        <line
          x1={arrow.start.x}
          y1={arrow.start.y}
          x2={arrow.end.x}
          y2={arrow.end.y}
          stroke={style.color}
          strokeWidth={style.width}
          strokeDasharray={style.dash}
          strokeLinecap="round"
        />
        <polygon
          points={`${arrow.end.x},${arrow.end.y} ${leftX},${leftY} ${rightX},${rightY}`}
          fill={style.color}
        />
        {arrow.type === "attack" && arrow.tempo && (
          <g>
            <rect
              x={labelX - 28}
              y={labelY - 12}
              width="56"
              height="22"
              rx="11"
              fill="white"
              opacity="0.92"
            />
            <text
              x={labelX}
              y={labelY + 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#991b1b"
            >
              {formatTempoLabel(arrow.tempo)}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto grid max-w-400 gap-4 xl:grid-cols-[280px_minmax(760px,1fr)_320px]">
        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5" />
              選手一覧
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium text-slate-600">
                コート内
              </div>
              <div className="space-y-2">
                {courtPlayers.map((player) => {
                  const displayMode = getDisplayModeFromSlot(
                    player,
                    slotAssignments,
                  );

                  return (
                    <PlayerChip
                      key={player.id}
                      player={player}
                      selected={selectedPlayerId === player.id}
                      displayMode={displayMode}
                      onClick={() => setSelectedPlayerId(player.id)}
                    />
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-blue-700">
                <span>リベロ交代選手</span>
              </div>
              <div className="space-y-2">
                {liberoBenchPlayers.length > 0 ? (
                  liberoBenchPlayers.map((player) => (
                    <div
                      key={player.id}
                      className={cn(
                        selectedBenchId === player.id &&
                          "rounded-2xl ring-2 ring-slate-400",
                      )}
                    >
                      <PlayerChip
                        player={player}
                        selected={selectedPlayerId === player.id}
                        displayMode="bench"
                        onClick={() => {
                          setSelectedPlayerId(player.id);
                          handleSelectBench(player.id);
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400">対象選手なし</div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-600">
                <span>控え</span>
                {selectedBenchId && (
                  <Badge variant="outline">交代先を選択中</Badge>
                )}
              </div>
              <div className="space-y-2">
                {benchPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={cn(
                      selectedBenchId === player.id &&
                        "rounded-2xl ring-2 ring-slate-400",
                    )}
                  >
                    <PlayerChip
                      player={player}
                      selected={selectedPlayerId === player.id}
                      displayMode="bench"
                      onClick={() => {
                        setSelectedPlayerId(player.id);
                        handleSelectBench(player.id);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-3xl shadow-sm">
            <CardContent className="space-y-4 p-4 md:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={data.displayMode === "half" ? "default" : "outline"}
                  onClick={() =>
                    setData((prev) => ({ ...prev, displayMode: "half" }))
                  }
                >
                  半面
                </Button>
                <Button
                  variant={data.displayMode === "full" ? "default" : "outline"}
                  onClick={() =>
                    setData((prev) => ({ ...prev, displayMode: "full" }))
                  }
                >
                  全面（仮）
                </Button>

                <div className="ml-auto flex flex-wrap gap-2">
                  <Button variant="outline" onClick={resetCurrentPattern}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    現在パターン初期化
                  </Button>
                  <Button variant="outline" onClick={exportJson}>
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    読込
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={importJson}
                  />
                </div>
              </div>

              <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
                <div>
                  <div className="mb-2 text-sm font-medium text-slate-600">
                    ローテーション
                  </div>
                  <Tabs
                    value={data.selectedRotation}
                    onValueChange={(value) =>
                      setData((prev) => ({ ...prev, selectedRotation: value }))
                    }
                  >
                    <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
                      {rotationOptions.map((item) => (
                        <TabsTrigger
                          key={item.key}
                          value={item.key}
                          className="rounded-2xl border bg-white px-4 py-2 data-[state=active]:border-slate-900 data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                        >
                          {item.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>

                <div>
                  <Label htmlFor="teamName">チーム名</Label>
                  <Input
                    id="teamName"
                    value={data.teamName}
                    onChange={(e) =>
                      setData((prev) => ({ ...prev, teamName: e.target.value }))
                    }
                    className="mt-2 w-55 bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-slate-600">
                  配置パターン
                </div>
                <Tabs
                  value={data.selectedPattern}
                  onValueChange={(value) => {
                    setData((prev) => ({ ...prev, selectedPattern: value }));
                    setArrowDraftStart(null);
                  }}
                >
                  <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
                    {patternOptions.map((item) => (
                      <TabsTrigger
                        key={item.key}
                        value={item.key}
                        className="rounded-2xl border bg-white px-4 py-2 data-[state=active]:border-slate-900 data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                      >
                        {item.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {displayedTitle}
                    </div>

                    <div className="text-sm text-slate-500">
                      {interactionMode === "move"
                        ? "移動モード：選手をドラッグ"
                        : "矢印モード：始点→終点の順にタップ"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!isBasicPattern && (
                      <Button
                        variant="outline"
                        onClick={applyBasicLayoutToCurrentPattern}
                      >
                        基本配置を反映
                      </Button>
                    )}

                    <Button
                      variant={
                        interactionMode === "move" ? "default" : "outline"
                      }
                      onClick={() => {
                        setInteractionMode("move");
                        setArrowDraftStart(null);
                      }}
                    >
                      <Move className="mr-2 h-4 w-4" />
                      移動
                    </Button>
                    <Button
                      variant={
                        interactionMode === "arrow" ? "default" : "outline"
                      }
                      onClick={() => setInteractionMode("arrow")}
                    >
                      <PencilLine className="mr-2 h-4 w-4" />
                      矢印
                    </Button>
                    <Button
                      variant={
                        interactionMode === "zone" ? "default" : "outline"
                      }
                      onClick={() => {
                        setInteractionMode("zone");
                        setArrowDraftStart(null);
                      }}
                    >
                      守備範囲
                    </Button>
                  </div>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Select value={arrowType} onValueChange={setArrowType}>
                    <SelectTrigger className="w-45 bg-white">
                      <SelectValue placeholder="矢印種類" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">通常矢印</SelectItem>
                      <SelectItem value="attack">攻撃助走矢印</SelectItem>
                      <SelectItem value="dotted">点線矢印</SelectItem>
                    </SelectContent>
                  </Select>

                  {arrowType === "attack" && (
                    <Select value={attackTempo} onValueChange={setAttackTempo}>
                      <SelectTrigger className="w-45 bg-white">
                        <SelectValue placeholder="テンポ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">オープン</SelectItem>
                        <SelectItem value="semi">セミ</SelectItem>
                        <SelectItem value="quick">クイック</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <Button variant="outline" onClick={removeLastArrow}>
                    <Undo2 className="mr-2 h-4 w-4" />
                    直前削除
                  </Button>

                  <Button variant="outline" onClick={clearCurrentArrowGroup}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    現在の矢印全削除
                  </Button>

                  {data.selectedPattern === "receive" && (
                    <Badge variant="outline">
                      保存先：
                      {activeReceiveArrowSet === "receiveAttack"
                        ? "②-1 攻撃"
                        : "②-2 チェンジ"}
                    </Badge>
                  )}

                  {arrowDraftStart && <Badge>終点をタップ</Badge>}
                </div>

                {interactionMode === "zone" && (
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 text-sm font-medium text-slate-600">
                      守備範囲
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      {Object.entries(zoneColors).map(([key, color]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedZoneColor(key)}
                          className={cn(
                            "rounded-xl border px-3 py-2 text-sm font-medium",
                            selectedZoneColor === key
                              ? "ring-2 ring-slate-400"
                              : "",
                          )}
                          style={{
                            backgroundColor: color.fill,
                            borderColor: color.stroke,
                            color: color.stroke,
                          }}
                        >
                          {color.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={completeZoneDraft}>
                        守備範囲を確定
                      </Button>
                      <Button variant="outline" onClick={undoZonePoint}>
                        1点戻す
                      </Button>
                      <Button variant="outline" onClick={clearZoneDraft}>
                        下書き取消
                      </Button>
                      <Button variant="outline" onClick={removeLastZone}>
                        最後の範囲削除
                      </Button>
                    </div>

                    <div className="mt-2 text-xs text-slate-500">
                      点をクリックして追加。3点以上で確定できます。最大4つまで。
                    </div>
                  </div>
                )}

                <div
                  ref={courtRef}
                  className="relative select-none overflow-hidden rounded-none border-4 border-emerald-700 bg-emerald-100"
                  style={{
                    width: "100%",
                    maxWidth: COURT_W,
                    aspectRatio: `${COURT_W} / ${COURT_H}`,
                  }}
                  onPointerMove={handlePointerMoveCourt}
                  onPointerUp={handlePointerUpCourt}
                  onPointerLeave={handlePointerUpCourt}
                  onClick={handleCourtClick}
                >
                  <svg
                    viewBox={`0 0 ${COURT_W} ${COURT_H}`}
                    className="absolute inset-0 h-full w-full"
                  >
                    <rect
                      x="0"
                      y="0"
                      width={COURT_W}
                      height={COURT_H}
                      fill="#7FBF9A"
                    />

                    <rect
                      x={COURT_INSET}
                      y={COURT_INSET}
                      width={COURT_W - COURT_INSET * 2}
                      height={COURT_H - COURT_INSET * 2}
                      fill="#DCC48E"
                      stroke="#ffffff"
                      strokeWidth="6"
                    />

                    {/* 半面表示のネット線（上辺） */}
                    <line
                      x1={COURT_INSET}
                      y1={COURT_INSET}
                      x2={COURT_W - COURT_INSET}
                      y2={COURT_INSET}
                      stroke="#ffffff"
                      strokeWidth="8"
                    />

                    {/* 半面表示のアタックライン（ネットから3m） */}
                    <line
                      x1={COURT_INSET}
                      y1={COURT_INSET + (COURT_H - COURT_INSET * 2) / 3}
                      x2={COURT_W - COURT_INSET}
                      y2={COURT_INSET + (COURT_H - COURT_INSET * 2) / 3}
                      stroke="#ffffff"
                      strokeWidth="5"
                      opacity="0.9"
                    />

                    {visibleArrows.map(renderArrow)}

                    {arrowDraftStart && (
                      <circle
                        cx={arrowDraftStart.x}
                        cy={arrowDraftStart.y}
                        r="10"
                        fill="#111827"
                        opacity="0.7"
                      />
                    )}

                    {zones.map((zone) => {
                      const color = zoneColors[zone.colorKey];
                      return (
                        <polygon
                          key={zone.id}
                          points={zone.points
                            .map((p) => `${p.x},${p.y}`)
                            .join(" ")}
                          fill={color.fill}
                          stroke={color.stroke}
                          strokeWidth="2"
                        />
                      );
                    })}

                    {zoneDraftPoints.length >= 2 && (
                      <polyline
                        points={zoneDraftPoints
                          .map((p) => `${p.x},${p.y}`)
                          .join(" ")}
                        fill="none"
                        stroke={zoneColors[selectedZoneColor].stroke}
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                    )}

                    {zoneDraftPoints.map((p, index) => (
                      <circle
                        key={`draft-point-${index}`}
                        cx={p.x}
                        cy={p.y}
                        r="5"
                        fill={zoneColors[selectedZoneColor].stroke}
                      />
                    ))}
                  </svg>

                  {courtPlayers.map((player) => {
                    const point = coordinates[player.id] || { x: 100, y: 100 };
                    const displayMode = getDisplayModeFromSlot(
                      player,
                      slotAssignments,
                    );

                    return (
                      <button
                        key={player.id}
                        type="button"
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${(point.x / COURT_W) * 100}%`,
                          top: `${(point.y / COURT_H) * 100}%`,
                        }}
                        onPointerDown={(e) =>
                          handlePointerDownPlayer(e, player.id)
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlayerId(player.id);
                          handleTapCourtPlayerForSub(player.id);
                        }}
                      >
                        <div
                          className={cn(
                            "flex h-20 w-20 flex-col items-center justify-center rounded-full border-[3px] shadow-lg transition",
                            colors[displayMode],
                          )}
                        >
                          <div className="text-3xl font-black leading-none">
                            {player.shortName}
                          </div>
                        </div>
                        <div className="mt-1 rounded-xl bg-white/90 px-2 py-1 text-center text-xs font-medium shadow-sm">
                          #{player.number} / {player.position}
                        </div>
                      </button>
                    );
                  })}


                  {data.displayMode === "full" && (
                    <div className="absolute right-4 top-4 rounded-xl bg-white/90 px-3 py-2 text-sm font-medium text-slate-600 shadow">
                      全面表示は次段階で実装予定
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 text-sm font-semibold text-slate-700">
                    {data.selectedRotation} メモ
                  </div>
                  <textarea
                    value={currentRotationMemo}
                    onChange={(e) => updateCurrentRotationMemo(e.target.value)}
                    placeholder="このローテのポイントや注意点をメモ"
                    className="min-h-55 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none"
                  />
                </div>

                {data.selectedPattern === "receive" && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
                      <span>②レセ 矢印表示</span>
                      <Badge variant="secondary">
                        編集先：
                        {activeReceiveArrowSet === "receiveAttack"
                          ? "攻撃矢印"
                          : "チェンジ矢印"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {receiveOverlayModes.map((mode) => (
                        <Button
                          key={mode.key}
                          variant={
                            data.receiveOverlayMode === mode.key
                              ? "default"
                              : "outline"
                          }
                          onClick={() =>
                            setData((prev) => ({
                              ...prev,
                              receiveOverlayMode: mode.key,
                            }))
                          }
                        >
                          {mode.label}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant={
                          activeReceiveArrowSet === "receiveAttack"
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setActiveReceiveArrowSet("receiveAttack")
                        }
                      >
                        攻撃矢印を編集
                      </Button>
                      <Button
                        variant={
                          activeReceiveArrowSet === "receiveShift"
                            ? "default"
                            : "outline"
                        }
                        onClick={() => setActiveReceiveArrowSet("receiveShift")}
                      >
                        チェンジ矢印を編集
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl shadow-sm">
          <CardHeader>
            <CardTitle>選手編集</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full border-[3px] text-3xl font-black",
                    colors[selectedPlayer?.mode || "back"],
                  )}
                >
                  {selectedMasterPlayer?.shortName ||
                    selectedPlayer?.shortName ||
                    "-"}
                </div>
                <div>
                  <div className="text-lg font-semibold">
                    {selectedMasterPlayer?.name ||
                      selectedPlayer?.name ||
                      "選手未選択"}
                  </div>
                  <div className="text-sm text-slate-500">
                    #
                    {selectedMasterPlayer?.number ||
                      selectedPlayer?.number ||
                      "-"}{" "}
                    /{" "}
                    {selectedMasterPlayer?.position ||
                      selectedPlayer?.position ||
                      "-"}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div>
                  <Label>名前</Label>
                  <Input
                    value={selectedMasterPlayer?.name || ""}
                    onChange={(e) =>
                      updateSelectedMasterPlayer({ name: e.target.value })
                    }
                    className="mt-1 bg-white"
                  />
                </div>

                <div>
                  <Label>略称</Label>
                  <Input
                    value={selectedMasterPlayer?.shortName || ""}
                    onChange={(e) =>
                      updateSelectedMasterPlayer({
                        shortName: e.target.value.slice(0, 2),
                      })
                    }
                    className="mt-1 bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="min-w-0">
                    <Label>背番号</Label>
                    <Input
                      value={selectedMasterPlayer?.number || ""}
                      onChange={(e) =>
                        updateSelectedMasterPlayer({ number: e.target.value })
                      }
                      className="mt-1 bg-white"
                    />
                  </div>

                  <div className="min-w-0">
                    <Label>ポジション</Label>
                    <Select
                      value={selectedMasterPlayer?.position || "S"}
                      onValueChange={(value) =>
                        updateSelectedMasterPlayer({
                          position: value,
                          mode:
                            value === "Li"
                              ? "libero"
                              : selectedMasterPlayer?.mode === "libero"
                                ? "back"
                                : selectedMasterPlayer?.mode,
                        })
                      }
                    >
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos} value={pos}>
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-0">
                    <Label>学年</Label>
                    <Input
                      value={selectedMasterPlayer?.grade || ""}
                      onChange={(e) =>
                        updateSelectedMasterPlayer({ grade: e.target.value })
                      }
                      className="mt-1 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>身長</Label>
                    <Input
                      inputMode="numeric"
                      value={selectedMasterPlayer?.height || ""}
                      onChange={(e) =>
                        updateSelectedMasterPlayer({ height: e.target.value })
                      }
                      className="mt-1 h-12 bg-white px-3 text-base leading-none"
                    />
                  </div>

                  <div>
                    <Label>指高</Label>
                    <Input
                      inputMode="numeric"
                      value={selectedMasterPlayer?.reach || ""}
                      onChange={(e) =>
                        updateSelectedMasterPlayer({ reach: e.target.value })
                      }
                      className="mt-1 h-12 bg-white px-3 text-base leading-none"
                    />
                  </div>

                  <div>
                    <Label>最達</Label>
                    <Input
                      inputMode="numeric"
                      value={selectedMasterPlayer?.spikeReach || ""}
                      onChange={(e) =>
                        updateSelectedMasterPlayer({
                          spikeReach: e.target.value,
                        })
                      }
                      className="mt-1 h-12 bg-white px-3 text-base leading-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="font-semibold text-slate-800">試合設定</div>

              {[1, 2, 3, 4, 5, 6].map((serveOrder) => {
                const currentKey = String(serveOrder);
                const currentValue = matchSetup.starters[currentKey] || "";

                const usedPlayerIds = Object.entries(matchSetup.starters)
                  .filter(([key, value]) => key !== currentKey && value)
                  .map(([, value]) => value);

                const availablePlayers = data.ownTeamMaster.filter(
                  (player) =>
                    !usedPlayerIds.includes(player.id) ||
                    player.id === currentValue,
                );

                return (
                  <div key={serveOrder} className="mt-3">
                    <Label>サーブ順 {serveOrder}</Label>
                    <Select
                      value={currentValue}
                      onValueChange={(value) =>
                        updateMatchSetup((setup) => {
                          setup.starters[currentKey] = value;
                        })
                      }
                    >
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="選手を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            #{player.number || "-"} {player.name || player.id} (
                            {player.position || "-"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}

              <div className="mt-5 border-t border-slate-200 pt-4">
                <div className="font-semibold text-slate-800">リベロ設定</div>

                <div className="mt-3">
                  <Label>リベロ選手</Label>
                  <Select
                    value={matchSetup.liberoPlayerId || ""}
                    onValueChange={(value) =>
                      updateMatchSetup((setup) => {
                        setup.liberoPlayerId = value;
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="リベロを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.ownTeamMaster.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          #{player.number || "-"} {player.name || player.id} (
                          {player.position || "-"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-3">
                  <Label>交代対象①</Label>
                  <Select
                    value={matchSetup.liberoTargets?.[0] || ""}
                    onValueChange={(value) =>
                      updateMatchSetup((setup) => {
                        const nextTargets = [
                          ...(setup.liberoTargets || ["", ""]),
                        ];
                        nextTargets[0] = value;
                        setup.liberoTargets = nextTargets;
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="交代対象①を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.ownTeamMaster.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          #{player.number || "-"} {player.name || player.id} (
                          {player.position || "-"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-3">
                  <Label>交代対象②</Label>
                  <Select
                    value={matchSetup.liberoTargets?.[1] || ""}
                    onValueChange={(value) =>
                      updateMatchSetup((setup) => {
                        const nextTargets = [
                          ...(setup.liberoTargets || ["", ""]),
                        ];
                        nextTargets[1] = value;
                        setup.liberoTargets = nextTargets;
                      })
                    }
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="交代対象②を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.ownTeamMaster.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          #{player.number || "-"} {player.name || player.id} (
                          {player.position || "-"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                ※ まずはサーブ順とリベロ設定を登録
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
