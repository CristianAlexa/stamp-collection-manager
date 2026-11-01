"use client";

import { useCallback, useEffect, useState } from "react";

import type { Stamp } from "@/types/stamp";
import type { StampsApiResponse } from "../types";

/**
 * A discriminated union describes every possible
 * state of our API request.
 */
type FetchState =
  | { status: "loading" }
  | { status: "success"; stamps: Stamp[] }
  | { status: "error"; message: string };

export function StampList() {
  const [state, setState] = useState<FetchState>({
    status: "loading",
  });

  // Increment this value when the user requests a retry.
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setRetryCount((current) => current + 1);
  }, []);

  useEffect(() => {
    // Cancel the request when this component unmounts
    // or when we start a replacement request.
    const controller = new AbortController();

    async function loadStamps() {
      try {
        const response = await fetch("/api/stamps", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const result = (await response.json()) as StampsApiResponse;

        if (!controller.signal.aborted) {
          setState({
            status: "success",
            stamps: result.data,
          });
        }
      } catch (error) {
        // Ignore cancelled requests.
        if (controller.signal.aborted) return;

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
        });
      }
    }

    void loadStamps();

    return () => controller.abort();
  }, [retryCount]);

  // State 1: Loading
  if (state.status === "loading") {
    return (
      <p role="status" className="text-app-muted">
        Loading stamps...
      </p>
    );
  }

  // State 2: Error
  if (state.status === "error") {
    return (
      <div role="alert" className="space-y-3">
        <p className="text-red-600 dark:text-red-400">
          Unable to load stamps: {state.message}
        </p>

        <button
          type="button"
          onClick={retry}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  // State 3: Successful request with no records
  if (state.stamps.length === 0) {
    return <p className="text-app-muted">No stamps found in the catalogue.</p>;
  }

  // State 4: Successful request with records
  return (
    <div className="space-y-4">
      <p className="text-sm text-app-muted">
        {state.stamps.length} stamps found
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {state.stamps.map((stamp) => (
          <li
            key={stamp.id}
            className="rounded-lg border border-app-border bg-app-surface p-4"
          >
            <h3 className="font-semibold text-app-foreground">{stamp.name}</h3>

            <p className="mt-1 text-sm text-app-muted">
              {stamp.country} · {stamp.year}
            </p>

            {stamp.description && (
              <p className="mt-3 text-sm text-app-muted">{stamp.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
