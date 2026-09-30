"use client";

import { useState } from "react";
import { APIProvider, InfoWindow, Map, Marker } from "@vis.gl/react-google-maps";

import type { Alert, SensorNode } from "@/lib/types";

const CAMPUS_CENTER = { lat: 26.928709, lng: 80.8963305 };

export function SensorMap({
  nodes,
  alerts = [],
  size = "full",
}: {
  nodes: SensorNode[];
  alerts?: Alert[];
  size?: "compact" | "full";
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mappedNodes = nodes.filter(
    (node) => Number.isFinite(node.latitude) && Number.isFinite(node.longitude),
  );
  const selectedNode = mappedNodes.find((node) => node.id === selectedNodeId);
  const heightClass = size === "compact" ? "h-64 sm:h-72" : "h-[55vh] min-h-[360px]";

  if (!apiKey) {
    return (
      <div className={`flex ${heightClass} items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-6 text-center`}>
        <div>
          <span className="material-symbols-outlined text-3xl text-on-surface-variant" aria-hidden="true">map</span>
          <p className="mt-2 font-bold text-primary">Google Maps key is not configured</p>
          <p className="mt-1 text-sm text-on-surface-variant">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your local environment.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`${heightClass} overflow-hidden rounded-lg border border-outline-variant`}>
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={mappedNodes[0] ? { lat: mappedNodes[0].latitude!, lng: mappedNodes[0].longitude! } : CAMPUS_CENTER}
            defaultZoom={15}
            gestureHandling="cooperative"
            mapTypeControl={false}
            streetViewControl={false}
            style={{ width: "100%", height: "100%" }}
          >
            {mappedNodes.map((node) => (
              <Marker
                key={node.id}
                position={{ lat: node.latitude!, lng: node.longitude! }}
                title={`${node.code} · ${getHazardLabel(node)}`}
                onClick={() => setSelectedNodeId(node.id)}
              />
            ))}
            {selectedNode ? (
              <InfoWindow
                position={{ lat: selectedNode.latitude!, lng: selectedNode.longitude! }}
                onCloseClick={() => setSelectedNodeId(null)}
              >
                <NodeInfo node={selectedNode} alert={alerts.find((alert) => alert.node_id === selectedNode.id && alert.status !== "resolved")} />
              </InfoWindow>
            ) : null}
          </Map>
        </APIProvider>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-on-surface-variant" aria-label="Map details">
        <span className="inline-flex items-center gap-2"><span className="material-symbols-outlined text-base" aria-hidden="true">location_on</span>Select a sensor marker to view readings and fire indicators.</span>
        {mappedNodes.length === 0 ? <span>No sensor coordinates received yet.</span> : <span>{mappedNodes.length} of {nodes.length} sensors mapped</span>}
      </div>

      {nodes.length > mappedNodes.length ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {nodes.filter((node) => !mappedNodes.some((mappedNode) => mappedNode.id === node.id)).map((node) => (
            <li key={node.id} className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm">
              <span className="font-bold text-primary">{node.code}</span>
              <span className="text-on-surface-variant"> · {node.location} · Coordinates unavailable</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function NodeInfo({ node, alert }: { node: SensorNode; alert?: Alert }) {
  const hazard = getHazardLabel(node);
  const atRisk = hazard !== "No active fire indicators";

  return (
    <div className="max-w-64 p-1 text-on-surface">
      <p className="font-bold">{node.code} · {node.location}</p>
      <p className={`mt-1 text-sm font-bold ${atRisk ? "text-error" : "text-safety-green"}`}>{hazard}</p>
      {alert ? <p className="mt-1 text-xs">{alert.severity.toUpperCase()} ALERT · {alert.status.replaceAll("_", " ").toUpperCase()}</p> : null}
      <p className="mt-1 text-xs text-on-surface-variant">{node.temperature_c}°C · smoke {node.smoke_level} · {node.status}</p>
    </div>
  );
}

function getHazardLabel(node: SensorNode) {
  const hazards = [
    node.flame_detected ? "Flame detected" : null,
    node.smoke_level === "high" ? "Smoke high" : null,
    node.ir_detected ? "IR detected" : null,
    node.temperature_c >= 45 ? "High temperature" : null,
  ].filter(Boolean);

  return hazards.length ? hazards.join(" · ") : "No active fire indicators";
}