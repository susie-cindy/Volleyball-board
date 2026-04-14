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

function buildRotation1BasicPattern(matchSetup = {}) {
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

function applyLiberoToPattern(pattern, matchSetup = {}, patternKey = "basic") {
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

function buildBasicDisplayPattern(data, rotationKey) {
  const basePattern = buildDerivedBasicPattern(
    buildRotation1BasicPattern(data?.matchSetup || {}),
    rotationKey,
  );

  return applyLiberoToPattern(basePattern, data?.matchSetup || {}, "basic");
}

function getDisplayPattern(data, rotationKey, patternKey) {
  if (!data) return null;
  if (patternKey === "basic") {
    return buildBasicDisplayPattern(data, rotationKey);
  }

  return data.rotations?.[rotationKey]?.[patternKey] || null;
}

function getDisplayPlayers(data, pattern) {
  const players = Array.isArray(pattern?.players) ? pattern.players : [];
  const ownTeamMaster = Array.isArray(data?.ownTeamMaster)
    ? data.ownTeamMaster
    : [];

  return players.map((player) => {
    const master = ownTeamMaster.find((m) => m.id === player.id);
    if (!master) return player;

    return {
      ...player,
      name: master.name,
      shortName: master.shortName,
      number: master.number,
      position: master.position,
    };
  });
}

function getCourtPlayersForPattern(data, pattern) {
  const displayPlayers = getDisplayPlayers(data, pattern);
  const courtPlayerIds = new Set(
    displayPlayers.filter((player) => player?.court).map((player) => player.id),
  );
  const ownTeamMaster = Array.isArray(data?.ownTeamMaster)
    ? data.ownTeamMaster
    : [];

  if (ownTeamMaster.length > 0) {
    return ownTeamMaster.filter((player) => courtPlayerIds.has(player.id));
  }

  return displayPlayers.filter((player) => player?.court);
}

export {
  getCourtPlayersForPattern,
  getDisplayPattern,
  getDisplayPlayers,
};
