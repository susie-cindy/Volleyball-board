import { cn } from "@/lib/utils";
import { colors, getDisplayModeFromSlot, zoneColors } from "@/lib/courtViewUtils";

const COURT_W = 620;
const COURT_H = 620;
const COURT_INSET = 40;

const arrowStroke = {
  normal: { color: "#2563eb", dash: "0", width: 4 },
  attack: { color: "#dc2626", dash: "0", width: 5 },
  dotted: { color: "#7c3aed", dash: "10 8", width: 4 },
};

function formatTempoLabel(tempo) {
  if (tempo === "open") return "オープン";
  if (tempo === "semi") return "セミ";
  if (tempo === "quick") return "クイック";
  return "";
}

function renderArrow(arrow) {
  const style = arrowStroke[arrow.type] || arrowStroke.normal;
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
            x={labelX - 34}
            y={labelY - 16}
            width="68"
            height="24"
            rx="12"
            fill="#ffffff"
            opacity="0.92"
          />
          <text
            x={labelX}
            y={labelY + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={style.color}
            fontSize="13"
            fontWeight="700"
          >
            {formatTempoLabel(arrow.tempo)}
          </text>
        </g>
      )}
    </g>
  );
}

export default function CourtView({
  courtRef,
  courtPlayers = [],
  coordinates = {},
  slotAssignments = {},
  visibleArrows = [],
  zones = [],
  arrowDraftStart = null,
  zoneDraftPoints = [],
  selectedZoneColor = "zone1",
  showFullDisplayNotice = false,
  onPointerMove,
  onPointerUp,
  onPointerLeave,
  onCourtClick,
  onPlayerPointerDown,
  onPlayerClick,
  compactPlayers = false,
  className,
}) {
  const isInteractive = Boolean(onPlayerPointerDown || onPlayerClick);

  return (
    <div
      ref={courtRef}
      className={cn(
        "relative mx-auto w-full overflow-hidden rounded-3xl border-4 border-slate-800 bg-emerald-100 shadow-inner",
        className,
      )}
      style={{
        maxWidth: COURT_W,
        aspectRatio: `${COURT_W} / ${COURT_H}`,
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
      onClick={onCourtClick}
    >
      <svg viewBox={`0 0 ${COURT_W} ${COURT_H}`} className="absolute inset-0 h-full w-full">
        <rect x="0" y="0" width={COURT_W} height={COURT_H} fill="#7FBF9A" />

        <rect
          x={COURT_INSET}
          y={COURT_INSET}
          width={COURT_W - COURT_INSET * 2}
          height={COURT_H - COURT_INSET * 2}
          fill="#DCC48E"
          stroke="#ffffff"
          strokeWidth="6"
        />

        <line
          x1={COURT_INSET}
          y1={COURT_INSET}
          x2={COURT_W - COURT_INSET}
          y2={COURT_INSET}
          stroke="#ffffff"
          strokeWidth="8"
        />

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
          <circle cx={arrowDraftStart.x} cy={arrowDraftStart.y} r="10" fill="#111827" opacity="0.7" />
        )}

        {zones.map((zone) => {
          const color = zoneColors[zone.colorKey] || zoneColors.zone1;
          return (
            <polygon
              key={zone.id}
              points={(zone.points || []).map((p) => `${p.x},${p.y}`).join(" ")}
              fill={color.fill}
              stroke={color.stroke}
              strokeWidth="2"
            />
          );
        })}

        {zoneDraftPoints.length >= 2 && (
          <polyline
            points={zoneDraftPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={(zoneColors[selectedZoneColor] || zoneColors.zone1).stroke}
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
            fill={(zoneColors[selectedZoneColor] || zoneColors.zone1).stroke}
          />
        ))}
      </svg>

      {courtPlayers.map((player) => {
        const point = coordinates[player.id] || { x: 100, y: 100 };
        const displayMode = getDisplayModeFromSlot(player, slotAssignments);
        const PlayerElement = isInteractive ? "button" : "div";

        return (
          <PlayerElement
            key={player.id}
            type={isInteractive ? "button" : undefined}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(point.x / COURT_W) * 100}%`,
              top: `${(point.y / COURT_H) * 100}%`,
            }}
            onPointerDown={
              onPlayerPointerDown
                ? (event) => onPlayerPointerDown(event, player.id)
                : undefined
            }
            onClick={
              onPlayerClick
                ? (event) => onPlayerClick(event, player.id)
                : undefined
            }
          >
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-full border-[3px] shadow-lg transition",
                compactPlayers ? "h-12 w-12" : "h-20 w-20",
                colors[displayMode],
              )}
            >
              <div
                className={cn(
                  "font-black leading-none",
                  compactPlayers ? "text-lg" : "text-3xl",
                )}
              >
                {player.shortName || "未"}
              </div>
            </div>
            {!compactPlayers && (
              <div className="mt-1 rounded-xl bg-white/90 px-2 py-1 text-center text-xs font-medium shadow-sm">
                #{player.number || "-"} / {player.position || "-"}
              </div>
            )}
          </PlayerElement>
        );
      })}

      {showFullDisplayNotice && (
        <div className="absolute right-4 top-4 rounded-xl bg-white/90 px-3 py-2 text-sm font-medium text-slate-600 shadow">
          全面表示は次段階で実装予定
        </div>
      )}
    </div>
  );
}
