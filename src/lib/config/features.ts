import "server-only";

const enabled = (name: string) => process.env[name] === "true";

export const runtime = {
  environment: process.env.SAUTI_ENV ?? "development",
  demoListening: enabled("ENABLE_DEMO_LISTENING"),
  financeSimulation: enabled("ENABLE_FINANCE_SIMULATION"),
  mockPayouts: enabled("ENABLE_MOCK_PAYOUTS"),
} as const;

export function requireFeature(feature: keyof Omit<typeof runtime, "environment">) {
  if (!runtime[feature]) throw new Error("This operation is disabled in this environment.");
}
