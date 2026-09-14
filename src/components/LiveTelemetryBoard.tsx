import type { SensorNode } from "@/lib/types";

function formatUpdatedAt(updatedAt?: string | null) {
  if (!updatedAt) return "Awaiting first reading";

  const diffMinutes = Math.max(0, Math.round((Date.now() - new Date(updatedAt).getTime()) / 60000));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  return `${diffHours} hr ago`;
}

function toneForStatus(status: SensorNode["status"]) {
  return status === "online"
    ? "bg-safety-green/10 text-safety-green border-safety-green/30"
    : "bg-error-container text-on-error-container border-error/20";
}

function toneForSmoke(level: string) {
  if (level === "high") return "bg-error-container text-error border-error/20";
  if (level === "moderate") return "bg-warning-yellow/15 text-warning-yellow border-warning-yellow/30";
  return "bg-surface-container text-safety-green border-safety-green/20";
}

function toneForTemp(temp: number) {
  if (temp >= 45) return "text-error";
  if (temp >= 35) return "text-warning-yellow";
  return "text-safety-green";
}

export function LiveTelemetryBoard({ nodes, title = "Live telemetry board" }: { nodes: SensorNode[]; title?: string }) {
  const onlineCount = nodes.filter((node) => node.status === "online").length;
  const warningCount = nodes.filter((node) => node.flame_detected || node.ir_detected || node.smoke_level === "high" || node.temperature_c >= 45).length;
  const avgTemp = nodes.length
    ? nodes.reduce((sum, node) => sum + node.temperature_c, 0) / nodes.length
    : 0;
  const avgHumidity = nodes.length
    ? nodes.reduce((sum, node) => sum + node.humidity_pct, 0) / nodes.length
    : 0;
  const tickerItems = nodes.length
    ? nodes.map((node) => `${node.code} • ${node.temperature_c.toFixed(1)}°C • ${node.smoke_level.toUpperCase()} • ${node.flame_detected ? "FLAME" : node.ir_detected ? "IR" : "CLEAR"}`)
    : [];

  return (
    <section className="live-board-shell rounded-[28px] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex flex-col gap-3 border-b border-outline-variant pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">Realtime data</p>
          <h2 className="mt-1 text-xl font-black tracking-[-0.04em] text-primary sm:text-2xl">{title}</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-container px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-on-primary">
          <span className="status-dot h-2.5 w-2.5 rounded-full bg-safety-green" />
          LIVE FEED
        </div>
      </div>

      {warningCount > 0 ? (
        <div className="alert-banner mb-4 flex items-center justify-between gap-3 rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container shadow-[0_12px_28px_rgba(220,38,38,0.12)]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">warning</span>
            <span className="font-bold uppercase tracking-[0.12em]">Alert broadcast</span>
          </div>
          <span className="font-data-mono text-xs font-bold">
            {warningCount} node(s) need attention
          </span>
        </div>
      ) : null}

      {tickerItems.length > 0 ? (
        <div className="live-ticker mb-4 overflow-hidden rounded-2xl border border-outline-variant bg-surface-container p-2">
          <div className="ticker-track flex min-w-max items-center gap-8 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
            {[...tickerItems, ...tickerItems].map((item, idx) => (
              <span key={`${item}-${idx}`} className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-safety-green" />
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <MetricTile label="Online nodes" value={String(onlineCount)} tone="primary" />
        <MetricTile label="Active warnings" value={String(warningCount)} tone="danger" />
        <MetricTile label="Avg temp" value={`${avgTemp.toFixed(1)}°C`} tone="warning" />
        <MetricTile label="Avg humidity" value={`${avgHumidity.toFixed(0)}%`} tone="neutral" />
      </div>

      {nodes.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          No live sensor data yet. The ingest endpoint is ready and will appear here as soon as telemetry arrives.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {nodes.map((node, index) => {
            const isWarning = node.flame_detected || node.ir_detected || node.smoke_level === "high" || node.temperature_c >= 45;

            return (
              <div
                key={node.id}
                className={`telemetry-card rounded-2xl border p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(15,23,42,0.08)] ${
                  isWarning ? "border-error/20 bg-error-container/10" : "border-outline-variant bg-surface-container"
                }`}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black tracking-[-0.04em] text-primary">{node.code}</p>
                    <p className="mt-1 text-sm text-on-surface-variant">{node.location}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${toneForStatus(node.status)}`}>
                    {node.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <ReadingRow
                    label="Temperature"
                    value={`${node.temperature_c.toFixed(1)}°C`}
                    accentClass={toneForTemp(node.temperature_c)}
                  />
                  <ReadingRow label="Humidity" value={`${node.humidity_pct.toFixed(0)}%`} accentClass="text-primary" />
                  <ReadingRow label="Smoke" value={node.smoke_level.toUpperCase()} accentClass={toneForSmoke(node.smoke_level)} />
                  <ReadingRow
                    label="Flame"
                    value={node.flame_detected ? "DETECTED" : "CLEAR"}
                    accentClass={node.flame_detected ? "text-error" : "text-safety-green"}
                  />
                  <ReadingRow
                    label="IR"
                    value={node.ir_detected ? "DETECTED" : "CLEAR"}
                    accentClass={node.ir_detected ? "text-warning-yellow" : "text-safety-green"}
                  />
                  <ReadingRow label="Load" value={`${node.load_pct ?? 0}%`} accentClass="text-on-surface" />
                  <ReadingRow label="Updated" value={formatUpdatedAt(node.updated_at)} accentClass="text-on-surface-variant" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MetricTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "danger" | "warning" | "neutral";
}) {
  const tones = {
    primary: "border-primary/20 bg-primary/5 text-primary",
    danger: "border-error/20 bg-error-container text-on-error-container",
    warning: "border-warning-yellow/30 bg-warning-yellow/10 text-warning-yellow",
    neutral: "border-outline-variant bg-surface-container text-on-surface-variant",
  };

  return (
    <div className={`metric-tile rounded-2xl border p-3 shadow-[0_10px_22px_rgba(15,23,42,0.03)] ${tones[tone]}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-[-0.06em]">{value}</p>
    </div>
  );
}

function ReadingRow({ label, value, accentClass }: { label: string; value: string; accentClass: string }) {
  return (
    <div className="reading-row rounded-xl border border-outline-variant bg-surface-container p-2.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">{label}</p>
      <p className={`mt-2 text-base font-black tracking-[-0.04em] ${accentClass}`}>{value}</p>
    </div>
  );
}
