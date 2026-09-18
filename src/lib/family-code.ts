import { randomInt } from "crypto";

// Sem caracteres ambíguos (0/O, 1/I, etc).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateFamilyCode(length = 6): string {
  return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join(
    "",
  );
}
