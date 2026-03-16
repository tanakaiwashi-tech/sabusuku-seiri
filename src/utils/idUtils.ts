/**
 * UUID を生成する。
 * ブラウザ（Chrome 92+）・RN Hermes 0.71+（=RN 0.83）でグローバルの
 * crypto.randomUUID() が利用可能なため expo-crypto 不要。
 */
export function generateId(): string {
  return crypto.randomUUID();
}
