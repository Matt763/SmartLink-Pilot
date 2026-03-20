const CHARSET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = CHARSET.length;

export function encodeBase62(num: number): string {
  if (num === 0) return CHARSET[0];
  let res = "";
  while (num > 0) {
    res = CHARSET[num % BASE] + res;
    num = Math.floor(num / BASE);
  }
  return res;
}

export function generateShortCode(): string {
  // Generate a random 6-character short code for fast collisions-free URLs
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARSET[Math.floor(Math.random() * BASE)];
  }
  return code;
}
