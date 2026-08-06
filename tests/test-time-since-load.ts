import assert from "node:assert/strict";
import {
  getMsSincePathLoad,
  markPathLoad,
  resetPathLoadMarksForTests,
  roundMsSinceLoad,
  withMsSinceLoad,
} from "../lib/time-since-load";

console.log("time-since-load");

assert.equal(roundMsSinceLoad(0), 0);
assert.equal(roundMsSinceLoad(249), 0);
assert.equal(roundMsSinceLoad(250), 500);
assert.equal(roundMsSinceLoad(749), 500);
assert.equal(roundMsSinceLoad(750), 1000);

resetPathLoadMarksForTests();

const originalNow = performance.now.bind(performance);
let fakeNow = 1000;
performance.now = () => fakeNow;

markPathLoad("/");
fakeNow = 3200;
assert.equal(getMsSincePathLoad("/"), 2000);

fakeNow = 4100;
assert.deepEqual(
  withMsSinceLoad("funnel_landing_cta", { placement: "hero_primary" }, "/"),
  { placement: "hero_primary", ms_since_load: 3000 }
);

markPathLoad("/analyze");
fakeNow = 5100;
assert.deepEqual(withMsSinceLoad("funnel_csv_loaded", { sample: false }, "/analyze"), {
  sample: false,
  ms_since_load: 1000,
});

assert.deepEqual(
  withMsSinceLoad("funnel_landing_cta", { placement: "x", ms_since_load: 999 }, "/"),
  { placement: "x", ms_since_load: 999 }
);

performance.now = originalNow;
resetPathLoadMarksForTests();

console.log("  ✓ roundMsSinceLoad + path marks + withMsSinceLoad");
