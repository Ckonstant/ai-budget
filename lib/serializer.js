/**
 * Serializes data from Prisma to be safely passed between server and client components
 * Handles Decimal, Date, BigInt and other non-serializable types
 */
export function serializeData(data) {
  // Handle null or undefined
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle Date objects
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item));
  }
  
  // Handle Decimal objects (from Prisma)
  if (typeof data === 'object' && 
      data !== null && 
      data.constructor && 
      (data.constructor.name === 'Decimal' || typeof data.toNumber === 'function')) {
    return Number(data);
  }
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const serialized = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeData(value);
    }
    return serialized;
  }
  
  // Return primitives as-is
  return data;
}