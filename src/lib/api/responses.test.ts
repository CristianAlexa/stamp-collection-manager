
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  apiSuccess,
  apiList,
  apiError,
  apiNoContent,
} from "./responses";

test("returns a successful single resource response", async () => {
  const stamp = {
    id: "stamp-001",
    name: "Penny Black",
  };

  const response = apiSuccess(stamp);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    data: stamp,
  });
});

test("returns status 201 for a created resource", async () => {
  const stamp = {
    id: "stamp-002",
  };

  const response = apiSuccess(stamp, 201);

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    data: stamp,
  });
});

test("returns a list and its correct count", async () => {
  const stamps = [
    { id: "stamp-001" },
    { id: "stamp-002" },
  ];

  const response = apiList(stamps);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    data: stamps,
    count: 2,
  });
});

test("returns an empty list with a count of zero", async () => {
  const response = apiList([]);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    data: [],
    count: 0,
  });
});

test("returns a standardised error response", async () => {
  const response = apiError(
    "STAMP_NOT_FOUND",
    "The requested stamp does not exist.",
    404,
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: {
      code: "STAMP_NOT_FOUND",
      message: "The requested stamp does not exist.",
    },
  });
});

test("returns status 204 without a response body", async () => {
  const response = apiNoContent();

  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");
});
