import { deepStrictEqual } from "node:assert/strict";
import { test } from "node:test";

import { getEffectiveStampColour } from "./stamp-colour";

test("inherits the parent stamp colour", () => {
  deepStrictEqual(
    getEffectiveStampColour("Rose Red", null),
    "Rose Red",
  );
});

test("prefers the variant colour when available", () => {
  deepStrictEqual(
    getEffectiveStampColour("Rose Red", "Deep Carmine"),
    "Deep Carmine",
  );
});

test("returns null when no colour is available", () => {
  deepStrictEqual(
    getEffectiveStampColour(null, null),
    null,
  );
});

test("ignores an empty variant colour", () => {
  deepStrictEqual(
    getEffectiveStampColour("Black", "   "),
    "Black",
  );
});

test("supports a variant colour without a parent colour", () => {
  deepStrictEqual(
    getEffectiveStampColour(null, "Blue"),
    "Blue",
  );
});

test("trims unnecessary whitespace from colour values", () => {
  deepStrictEqual(
    getEffectiveStampColour(" Rose Red "),
    "Rose Red",
  );
});

// Additional regression tests.

test("supports undefined catalogue colour values", () => {
  deepStrictEqual(
    getEffectiveStampColour(undefined, undefined),
    null,
  );
});

test("ignores whitespace-only parent and variant colours", () => {
  deepStrictEqual(
    getEffectiveStampColour("   ", "   "),
    null,
  );
});

test("preserves a multicoloured catalogue description", () => {
  deepStrictEqual(
    getEffectiveStampColour("Black and Rose Red"),
    "Black and Rose Red",
  );
});