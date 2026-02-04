/**
 * Utilities for auto-generating equipment names and room codes
 */

// Standard room name to code mappings
const ROOM_CODE_MAP: Record<string, string> = {
  // Residential
  kitchen: 'KIT',
  'living room': 'LR',
  'dining room': 'DR',
  bedroom: 'BR',
  'master bedroom': 'MBR',
  bathroom: 'BA',
  garage: 'GAR',
  basement: 'BASE',
  attic: 'ATT',
  laundry: 'LAU',
  hallway: 'HALL',
  hall: 'HALL',
  entry: 'ENT',
  entryway: 'ENT',
  utility: 'UTIL',
  'utility room': 'UTIL',
  pantry: 'PAN',
  den: 'DEN',
  study: 'STUDY',
  office: 'OFF',
  closet: 'CLST',
  porch: 'PORCH',
  deck: 'DECK',
  patio: 'PATIO',
  yard: 'YARD',
  // Commercial
  conference: 'CONF',
  'conference room': 'CONF',
  reception: 'RECEP',
  restroom: 'REST',
  storage: 'STOR',
  mechanical: 'MECH',
  'mechanical room': 'MECH',
  electrical: 'ELEC',
  'electrical room': 'ELEC',
  server: 'SERV',
  'server room': 'SERV',
  corridor: 'CORR',
  lobby: 'LOBBY',
};

/**
 * Generate a room code from a room name
 * @param roomName - The full room name (e.g., "Kitchen", "Living Room")
 * @returns A short room code (e.g., "KIT", "LR")
 */
export function generateRoomCode(roomName: string): string {
  if (!roomName) return '';

  const normalized = roomName.toLowerCase().trim();

  // Check for exact match in mapping
  if (ROOM_CODE_MAP[normalized]) {
    return ROOM_CODE_MAP[normalized];
  }

  // Check for numbered rooms (e.g., "Bedroom 1" → "BR1")
  const numberMatch = normalized.match(/^(.+?)\s+(\d+)$/);
  if (numberMatch) {
    const [, baseName, number] = numberMatch;
    const baseCode = ROOM_CODE_MAP[baseName.trim()];
    if (baseCode) {
      return `${baseCode}${number}`;
    }
  }

  // Check for partial matches (e.g., "kitchen area" → "KIT")
  for (const [key, code] of Object.entries(ROOM_CODE_MAP)) {
    if (normalized.includes(key)) {
      return code;
    }
  }

  // Fallback: create abbreviation from words
  const words = normalized.split(/\s+/);
  if (words.length === 1) {
    // Single word: take first 3-4 characters
    return normalized.substring(0, Math.min(4, normalized.length)).toUpperCase();
  } else {
    // Multiple words: take first letter of each word (max 4)
    return words
      .slice(0, 4)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  }
}

/**
 * Generate a label for a junction box
 * @param roomCode - The room code (e.g., "KIT", "LR")
 * @param roomName - The full room name (e.g., "Kitchen")
 * @param sequenceNumber - The sequence number for this room (1, 2, 3...)
 * @returns A formatted label (e.g., "KIT-JB1", "Kitchen JB1")
 */
export function generateJunctionBoxLabel(
  roomCode: string | null | undefined,
  roomName: string | null | undefined,
  sequenceNumber: number
): string {
  if (roomCode) {
    return `${roomCode}-JB${sequenceNumber}`;
  } else if (roomName) {
    return `${roomName} JB${sequenceNumber}`;
  } else {
    return `JB${sequenceNumber}`;
  }
}

/**
 * Generate a label for a socket
 * @param roomCode - The room code (e.g., "KIT", "LR")
 * @param roomName - The full room name (e.g., "Kitchen")
 * @param sequenceNumber - The sequence number for this room (1, 2, 3...)
 * @returns A formatted label (e.g., "KIT-S1", "Kitchen Socket 1")
 */
export function generateSocketLabel(
  roomCode: string | null | undefined,
  roomName: string | null | undefined,
  sequenceNumber: number
): string {
  if (roomCode) {
    return `${roomCode}-S${sequenceNumber}`;
  } else if (roomName) {
    return `${roomName} Socket ${sequenceNumber}`;
  } else {
    return `Socket ${sequenceNumber}`;
  }
}

/**
 * Validate if a room code is reasonable (2-5 uppercase letters/numbers)
 */
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{2,5}$/.test(code);
}
