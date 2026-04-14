import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import CourtView from "@/components/CourtView";
import {
  getCourtPlayersForPattern,
  getDisplayPattern,
} from "@/lib/formationDisplay";
import { supabase } from "./lib/supabase";

const rotations = [1, 2, 3, 4, 5, 6];
const patternNumbers = ["①", "②", "③", "④", "⑤", "⑥"];
const patternLabels = [
  "①基本",
  "②レセプション",
  "③自チームサーブ",
  "④ディグ（レフト）",
  "⑤ディグ（センター）",
  "⑥ディグ（ライト）",
];
const patternKeys = [
  "basic",
  "receive",
  "serveBase",
  "defenseLeft",
  "defenseCenter",
  "defenseRight",
];

const formatUpdatedAt = (updatedAt) => {
  if (!updatedAt) return "";

  const d = new Date(updatedAt);
  if (Number.isNaN(d.getTime())) return "";

  return (
    `${(d.getMonth() + 1).toString().padStart(2, "0")}/` +
    `${d.getDate().toString().padStart(2, "0")} ` +
    `${d.getHours().toString().padStart(2, "0")}:` +
    `${d.getMinutes().toString().padStart(2, "0")}`
  );
};

const getFormationTitle = (formation) =>
  formation?.name || formation?.title || "無題";

const fetchFormationDetail = async (formationId) => {
  const { data: row, error } = await supabase
    .from("formations")
    .select("data")
    .eq("id", formationId)
    .single();

  if (error) throw error;

  return row?.data || null;
};

const arrowGroupsForPattern = (pattern, overlayMode) => {
  if (pattern !== "receive") return ["general"];
  if (overlayMode === "attackOnly") return ["receiveAttack"];
  if (overlayMode === "shiftOnly") return ["receiveShift"];
  if (overlayMode === "both") return ["receiveAttack", "receiveShift"];
  return [];
};

export default function ViewerPage() {
  const [formationList, setFormationList] = useState([]);
  const [selectedFormationId, setSelectedFormationId] = useState("");
  const [formationDetail, setFormationDetail] = useState(null);
  const [selectedRotation, setSelectedRotation] = useState(1);
  const [selectedPattern, setSelectedPattern] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadFormationList = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("formations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const list = data || [];
      setFormationList(list);

      const firstId = list[0]?.id || "";
      setSelectedFormationId(firstId);
      setSelectedRotation(1);
      setSelectedPattern(1);

      if (firstId) {
        const detail = await fetchFormationDetail(firstId);
        setFormationDetail(detail);
        if (!detail) {
          setError("フォーメーションデータが見つかりませんでした");
        }
      } else {
        setFormationDetail(null);
      }
    } catch (error) {
      console.error("viewer一覧取得エラー", error);
      setError("フォーメーション一覧の取得に失敗しました");
      setFormationList([]);
      setSelectedFormationId("");
      setFormationDetail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFormationList();
  }, [loadFormationList]);

  const handleFormationChange = async (event) => {
    const formationId = event.target.value;
    setSelectedFormationId(formationId);
    setSelectedRotation(1);
    setSelectedPattern(1);
    setError("");

    if (!formationId) {
      setFormationDetail(null);
      return;
    }

    setLoading(true);
    try {
      const detail = await fetchFormationDetail(formationId);
      setFormationDetail(detail);
      if (!detail) {
        setError("フォーメーションデータが見つかりませんでした");
      }
    } catch (error) {
      console.error("viewer詳細取得エラー", error);
      setError("フォーメーション詳細の取得に失敗しました");
      setFormationDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const hasFormations = formationList.length > 0;
  const selectedRotationKey = `R${selectedRotation}`;
  const selectedPatternKey = patternKeys[selectedPattern - 1] || "basic";
  const selectedPatternLabel =
    patternLabels[selectedPattern - 1] || patternLabels[0];
  const isBasic = selectedPattern === 1;
  const currentPattern = getDisplayPattern(
    formationDetail,
    selectedRotationKey,
    selectedPatternKey,
  );

  const courtPlayers = useMemo(() => {
    return getCourtPlayersForPattern(formationDetail, currentPattern);
  }, [currentPattern, formationDetail]);

  const visibleArrows = useMemo(() => {
    if (!currentPattern?.arrows) return [];

    const visibleArrowGroups = arrowGroupsForPattern(
      selectedPatternKey,
      formationDetail?.receiveOverlayMode || "both",
    );

    return visibleArrowGroups.flatMap((group) =>
      (currentPattern.arrows[group] || []).map((arrow) => ({
        ...arrow,
        group,
      })),
    );
  }, [currentPattern, formationDetail, selectedPatternKey]);

  const canDisplayCourt = Boolean(currentPattern && courtPlayers.length > 0);

  return (
    <main className="min-h-full bg-slate-100 text-slate-950">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col gap-2 px-3 py-2 sm:max-w-lg">
        <header>
          <h1 className="text-base font-bold leading-tight">
            勝北中2026フォーメーション
          </h1>
        </header>

        <section className="space-y-1">
          <label
            htmlFor="formationSelect"
            className="text-xs font-medium text-slate-700"
          >
            フォーメーション
          </label>
          <select
            id="formationSelect"
            value={selectedFormationId}
            onChange={handleFormationChange}
            disabled={loading || !hasFormations}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          >
            <option value="">
              {hasFormations
                ? "フォーメーションを選択"
                : "保存済みフォーメーションがありません"}
            </option>
            {formationList.map((item) => {
              const formatted = formatUpdatedAt(item.updated_at);
              const title = getFormationTitle(item);

              return (
                <option key={item.id} value={item.id}>
                  {formatted ? `${title}（${formatted}）` : title}
                </option>
              );
            })}
          </select>

          {loading && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              読み込み中...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && !hasFormations && (
            <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              保存済みフォーメーションがありません
            </div>
          )}
        </section>

        <section className="space-y-1">
          <div className="text-xs font-medium text-slate-700">ローテーション</div>
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
            {rotations.map((rotation) => (
              <Button
                key={rotation}
                type="button"
                variant={selectedRotation === rotation ? "default" : "outline"}
                className="h-10 flex-shrink-0 rounded-md"
                onClick={() => setSelectedRotation(rotation)}
              >
                R{rotation}
              </Button>
            ))}
          </div>
        </section>

        <section className="space-y-1">
          <div className="text-xs font-medium text-slate-700">配置パターン</div>
          <div className="grid grid-cols-6 gap-2">
            {patternNumbers.map((number, index) => {
              const pattern = index + 1;

              return (
                <Button
                  key={number}
                  type="button"
                  variant={selectedPattern === pattern ? "default" : "outline"}
                  className="h-10 rounded-md px-0 text-base"
                  onClick={() => setSelectedPattern(pattern)}
                >
                  {number}
                </Button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-700">
            <span>コート</span>
            {canDisplayCourt && (
              <span className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-sm font-bold text-slate-900 shadow-sm">
                R{selectedRotation} / {selectedPatternLabel}
              </span>
            )}
          </div>
          {canDisplayCourt ? (
            <CourtView
              courtPlayers={courtPlayers}
              coordinates={currentPattern.coordinates || {}}
              slotAssignments={currentPattern.slotAssignments || {}}
              visibleArrows={visibleArrows}
              zones={currentPattern.zones || []}
              compactPlayers={!isBasic}
              className="rounded-md border-emerald-700"
            />
          ) : (
            <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-md border border-emerald-700 bg-emerald-100 shadow-sm">
              <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
                <p className="rounded-md bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                  {formationDetail
                    ? "表示できるフォーメーションデータがありません"
                    : "フォーメーションを選択してください"}
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
