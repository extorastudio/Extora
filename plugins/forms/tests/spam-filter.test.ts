import { describe, it, expect } from "vitest";
interface SpamRule { field: string; pattern: string; action: "block"|"flag"; }
const rules: SpamRule[] = [{field:"_honeypot",pattern:"filled",action:"block"},{field:"body",pattern:"http://|https://",action:"flag"}];
function checkSpam(data: Record<string,unknown>): { isSpam: boolean; flags: string[] } { const flags: string[] = [];
  for(const r of rules) { const val = String(data[r.field]??""); if(new RegExp(r.pattern).test(val)) { if(r.action==="block") return {isSpam:true,flags:["blocked"]}; flags.push(r.pattern); } }
  return { isSpam: false, flags }; }
describe("Spam Filter", () => {
  it("should block honeypot", () => { expect(checkSpam({_honeypot:"filled"}).isSpam).toBe(true); });
  it("should flag URLs", () => { const r = checkSpam({body:"check http://spam.com"}); expect(r.flags.length).toBeGreaterThan(0); });
  it("should pass clean submission", () => { expect(checkSpam({name:"Alice",body:"Hello"}).isSpam).toBe(false); });
});
