import { deepStrictEqual } from "node:assert/strict";
import { test } from "node:test";
import { filterStamps } from "./filter-stamps";
import { stamps } from "./stamp-data";

const noFilters = { query: "", country: "", year: undefined };

test("returns all stamps when filters are empty", () => {
  deepStrictEqual(filterStamps(stamps, noFilters), stamps);
});

test("returns only stamps from the requested year", () => {
  const sample = stamps.find((stamp) =>
    stamps.some((other) => other.year !== stamp.year),
  );

  if (!sample) {
    throw new Error(
      "This test needs catalogue stamps from two different years.",
    );
  }

  const expected = stamps.filter((stamp) => stamp.year === sample.year);

  deepStrictEqual(
    filterStamps(stamps, { ...noFilters, year: sample.year }),
    expected,
  );
});

test("returns an empty list when the query matches nothing", () => {
  const result = filterStamps(stamps, {
    ...noFilters,
    query: "__no_such_stamp__",
  });

  deepStrictEqual(result, []);
});

test("finds stamps by catalogue reference", () => {
  const catalogueStamps = [
    {
      id: "test-001",
      name: "Test stamp",
      country: "Great Britain",
      year: 1900,
      catalogueReferences: ["SG-GB-48A"],
    },
  ];

  const result = filterStamps(catalogueStamps, {
    query: "sg-gb-48a",
  });

  deepStrictEqual(result, catalogueStamps);
});