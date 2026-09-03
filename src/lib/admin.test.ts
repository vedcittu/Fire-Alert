import test from "node:test";
import assert from "node:assert/strict";

import { buildAlertPayload } from "./admin.ts";

test("buildAlertPayload normalizes admin alert data for a node", () => {
  const payload = buildAlertPayload(
    {
      id: "node-123",
      code: "CHM-204-A",
      location: "Chemistry Lab - Fume Hood",
      building_id: "building-456",
    },
    {
      title: "  ",
      severity: "critical",
      location: "  ",
      message: "Smoke detected near the lab hood.",
    },
  );

  assert.equal(payload.title, "CHM-204-A critical alert");
  assert.equal(payload.location, "Chemistry Lab - Fume Hood");
  assert.equal(payload.node_id, "node-123");
  assert.equal(payload.building_id, "building-456");
  assert.equal(payload.status, "open");
  assert.equal(payload.severity, "critical");
});
