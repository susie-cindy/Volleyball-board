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
import CourtView from "@/components/CourtView";
import { colors, getDisplayModeFromSlot, zoneColors } from "@/lib/courtViewUtils";
import {
  getCourtPlayersForPattern,
  getDisplayPattern,
  getDisplayPlayers,
} from "@/lib/formationDisplay";
import { cn } from "@/lib/utils";
import {
  PencilLine,
  Move,
  Undo2,
  Trash2,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "./lib/supabase";

const COURT_W = 620;
const COURT_H = 620;

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
  const courtRef = useRef(null);

  const [data, setData] = useState(() => loadInitialData());
  const [cloudTitle, setCloudTitle] = useState("");
  const [cloudFormations, setCloudFormations] = useState([]);
  const [selectedCloudFormationId, setSelectedCloudFormationId] = useState("");
  const [isCloudLoading, setIsCloudLoading] = useState(false);
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

  // 交代管理を選手ベースに変更: keyは交代選手のID, valueは元の選手のID
  const [substitutions, setSubstitutions] = useState({});

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
    getDisplayPattern(data, data.selectedRotation, data.selectedPattern) ||
    basicDraftPattern;
  const currentRotation = data.rotations[data.selectedRotation];
  const currentRotationMemo = currentRotation?.memo || "";

  const coordinates = currentPattern.coordinates;
  const slotAssignments = currentPattern.slotAssignments || {};

  const zones = currentPattern.zones || [];

  const displayPlayers = getDisplayPlayers(data, currentPattern);

  const matchSetup = data.matchSetup;
  const liberoTargets = matchSetup.liberoTargets || [];

  const selectedPlayer =
    displayPlayers.find((p) => p.id === selectedPlayerId) ||
    displayPlayers.find((p) => p.court) ||
    null;

  const selectedMasterPlayer =
    data.ownTeamMaster.find((p) => p.id === selectedPlayerId) || null;

  const courtPlayers = getCourtPlayersForPattern(data, currentPattern);
  const courtPlayerIds = new Set(courtPlayers.map((p) => p.id));

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

    // 選手ベースで交代記録: 交代選手ID -> 元の選手ID
    setSubstitutions((prev) => ({
      ...prev,
      [selectedBenchId]: courtPlayerId,
    }));

    setSelectedPlayerId(selectedBenchId);
    setSelectedBenchId(null);
  };

  // 「元に戻す」機能: 選手ベースで判定・実行
  const handleUndoSubstitution = () => {
    const originalId = substitutions[selectedPlayerId];
    if (!originalId) return;

    updateCurrentPattern((target) => {
      const substitutePlayer = target.players.find((p) => p.id === selectedPlayerId);
      const originalPlayer = target.players.find((p) => p.id === originalId);
      if (!substitutePlayer || !originalPlayer) return;

      // 現在の位置で元の選手に戻す
      substitutePlayer.court = false;
      originalPlayer.court = true;

      target.coordinates[originalId] = { ...target.coordinates[selectedPlayerId] };
      delete target.coordinates[selectedPlayerId];

      target.slotAssignments[originalId] = target.slotAssignments[selectedPlayerId];
      delete target.slotAssignments[selectedPlayerId];
    });

    setSubstitutions((prev) => {
      const next = { ...prev };
      delete next[selectedPlayerId];
      return next;
    });

    setSelectedPlayerId(originalId);
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

  const saveToSupabase = async () => {
    const title = cloudTitle.trim();
    if (!title) {
      alert("保存名を入力してください");
      return;
    }

    try {
      const { data: existing, error: selectError } = await supabase
        .from("formations")
        .select("id")
        .eq("title", title)
        .limit(1);

      if (selectError) throw selectError;

      if (existing && existing.length > 0) {
        const { error: updateError } = await supabase
          .from("formations")
          .update({
            data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing[0].id);

        if (updateError) throw updateError;

        alert("クラウド保存を更新しました");
      } else {
        const { error: insertError } = await supabase.from("formations").insert([
          {
            title,
            data,
            updated_at: new Date().toISOString(),
          },
        ]);

        if (insertError) throw insertError;

        alert("クラウド保存しました");
      }
    } catch (error) {
      console.error("Supabase保存エラー", error);
      alert("クラウド保存に失敗しました");
    }
  };

  const loadCloudFormations = async () => {
    setIsCloudLoading(true);
    try {
      const { data, error } = await supabase
        .from("formations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      setCloudFormations(data || []);
    } catch (error) {
      console.error("クラウド一覧取得エラー", error);
      alert("クラウド一覧の取得に失敗しました");
    } finally {
      setIsCloudLoading(false);
    }
  };

  const loadFromSupabase = async () => {
    if (!selectedCloudFormationId) {
      alert("読み込むフォーメーションを選択してください");
      return;
    }

    try {
      const { data: row, error } = await supabase
        .from("formations")
        .select("data")
        .eq("id", selectedCloudFormationId)
        .single();

      if (error) throw error;

      const parsed = row?.data;
      if (!parsed) {
        alert("データが見つかりませんでした");
        return;
      }

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
        mergedOwnTeamMaster.find((p) => p.id === selectedPlayerId)?.id ||
        mergedOwnTeamMaster[0]?.id ||
        "p1";

      setSelectedPlayerId(selectedId);
      setSelectedBenchId(null);
      setArrowDraftStart(null);

      alert("クラウドから読み込みました");
    } catch (error) {
      console.error("クラウド読込エラー", error);
      alert("クラウド読込に失敗しました");
    }
  };

  const deleteFromSupabase = async () => {
    if (!selectedCloudFormationId) {
      alert("削除するフォーメーションを選択してください");
      return;
    }

    if (!confirm("削除してもよろしいですか？")) return;

    try {
      const { error } = await supabase
        .from("formations")
        .delete()
        .eq("id", selectedCloudFormationId);

      if (error) throw error;

      alert("削除しました");

      await loadCloudFormations();
      setSelectedCloudFormationId("");
    } catch (error) {
      console.error("削除エラー", error);
      alert("削除に失敗しました");
    }
  };

  const renameSupabase = async () => {
    const title = cloudTitle.trim();
    if (!selectedCloudFormationId) {
      alert("対象を選択してください");
      return;
    }

    if (!title) {
      alert("新しい名前を入力してください");
      return;
    }

    try {
      const { error } = await supabase
        .from("formations")
        .update({
          title,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedCloudFormationId);

      if (error) throw error;

      alert("名前を変更しました");

      await loadCloudFormations();
    } catch (error) {
      console.error("名前変更エラー", error);
      alert("名前変更に失敗しました");
    }
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
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Input
                  value={cloudTitle}
                  onChange={(e) => setCloudTitle(e.target.value)}
                  placeholder="クラウド保存名"
                  className="h-10 w-[180px] bg-white"
                />
                <Button variant="outline" onClick={saveToSupabase}>
                  クラウド保存
                </Button>
                <Button variant="outline" onClick={renameSupabase}>
                  名前変更
                </Button>
                <Button
                  variant="outline"
                  onClick={loadCloudFormations}
                  disabled={isCloudLoading}
                >
                  {isCloudLoading ? "取得中..." : "クラウド一覧取得"}
                </Button>
                <select
                  value={selectedCloudFormationId}
                  onChange={(e) => setSelectedCloudFormationId(e.target.value)}
                  className="h-10 w-[210px] rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="">クラウド保存を選択</option>
                  {cloudFormations.map((item) => {
                    const d = new Date(item.updated_at);
                    const formatted =
                      `${(d.getMonth() + 1).toString().padStart(2, "0")}/` +
                      `${d.getDate().toString().padStart(2, "0")} ` +
                      `${d.getHours().toString().padStart(2, "0")}:` +
                      `${d.getMinutes().toString().padStart(2, "0")}`;

                    return (
                      <option key={item.id} value={item.id}>
                        {item.title}（{formatted}）
                      </option>
                    );
                  })}
                </select>
                <Button variant="outline" onClick={loadFromSupabase}>
                  クラウド読込
                </Button>
                <Button variant="outline" onClick={deleteFromSupabase}>
                  削除
                </Button>
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

                <CourtView
                  courtRef={courtRef}
                  courtPlayers={courtPlayers}
                  coordinates={coordinates}
                  slotAssignments={slotAssignments}
                  visibleArrows={visibleArrows}
                  zones={zones}
                  arrowDraftStart={arrowDraftStart}
                  zoneDraftPoints={zoneDraftPoints}
                  selectedZoneColor={selectedZoneColor}
                  showFullDisplayNotice={data.displayMode === "full"}
                  className="select-none rounded-none border-emerald-700"
                  onPointerMove={handlePointerMoveCourt}
                  onPointerUp={handlePointerUpCourt}
                  onPointerLeave={handlePointerUpCourt}
                  onCourtClick={handleCourtClick}
                  onPlayerPointerDown={handlePointerDownPlayer}
                  onPlayerClick={(event, playerId) => {
                    event.stopPropagation();
                    setSelectedPlayerId(playerId);
                    handleTapCourtPlayerForSub(playerId);
                  }}
                />

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

            {/* 「元に戻す」ボタンを追加: 選手が交代選手の場合に有効 */}
            {!isBasicPattern && substitutions[selectedPlayerId] && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Button variant="outline" onClick={handleUndoSubstitution}>
                  元に戻す
                </Button>
              </div>
            )}

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
