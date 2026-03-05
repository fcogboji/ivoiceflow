/**
 * Recursively convert BigInt to number so JSON.stringify works (e.g. in API responses).
 * Use before NextResponse.json(data) when data comes from Prisma with BigInt fields.
 */
export function serializeBigInts<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === "bigint") {
    return Number(value) as T;
  }
  if (Array.isArray(value)) {
    return value.map(serializeBigInts) as T;
  }
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = serializeBigInts(v);
    }
    return out as T;
  }
  return value;
}
