import assert from "node:assert/strict";
import { cleanText, email, handle, positiveAmount, uuid } from "../../src/lib/validation/core.ts";

function test(name:string,fn:()=>void){fn();console.log(`ok - ${name}`)}
test("normalizes safe identity fields", () => {
  assert.equal(email(" Person@Example.COM "), "person@example.com");
  assert.equal(handle(" sauti_ke "), "sauti_ke");
  assert.equal(cleanText("  hello  "), "hello");
});
test("rejects malformed identifiers and money", () => {
  assert.throws(() => uuid("not-an-id"));
  assert.throws(() => positiveAmount(-1));
  assert.throws(() => positiveAmount(10.001));
});
test("accepts bounded values", () => {
  assert.equal(uuid("123e4567-e89b-42d3-a456-426614174000"), "123e4567-e89b-42d3-a456-426614174000");
  assert.equal(positiveAmount("5000"), 5000);
});
