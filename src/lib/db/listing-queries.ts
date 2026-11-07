/**
 * Pure PostgREST request builders for user-owned listing records.
 * The database RLS policies remain the authoritative isolation boundary.
 */
export interface SafeListingDraft {
  name: string;
  location: string;
  price?: number | null;
}

const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;

export function requireValidUserId(id: string): string {
  if (!UUID.test(id)) throw new Error("INVALID_USER_ID");
  return id;
}

export function buildOwnedListingsUrl(backendUrl: string, userId: string): URL {
  const owner = requireValidUserId(userId);
  const endpoint = new URL("/rest/v1/codematt_listings", backendUrl);
  endpoint.searchParams.set("select", "id,name,location,price,created_at");
  endpoint.searchParams.set("user_id", "eq." + owner);
  endpoint.searchParams.set("order", "created_at.desc");
  endpoint.searchParams.set("limit", "50");
  return endpoint;
}

export function buildOwnedListingInsert(userId: string, draft: SafeListingDraft) {
  const owner = requireValidUserId(userId);
  return {
    name: draft.name,
    location: draft.location,
    price: draft.price ?? null,
    user_id: owner,
  };
}
