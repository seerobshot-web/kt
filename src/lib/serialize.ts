// Square's SDK returns monetary amounts as BigInt, which JSON.stringify cannot
// handle natively. Convert BigInt -> Number (safe for cent amounts) before
// sending any Square object back to the browser.
export function serializeBigInt<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_key, val) => (typeof val === 'bigint' ? Number(val) : val)));
}
