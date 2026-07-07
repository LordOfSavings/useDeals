import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import * as api from "./api.js";
import { useDeals } from "./useDeals.js";
import type { ListingType } from "./useDeals.js";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Test 1: Query Routing
// ---------------------------------------------------------------------------
describe("Query Routing", () => {
  it("listingType='recent' should call dealsByDate", async () => {
    const spy = vi.spyOn(api, "dealsByDate");
    renderHook(() => useDeals({ listingType: "recent" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ search_by_time: expect.any(String) }),
    );
  });

  it("listingType='top' should call dealsByIsTopDealAndUpdatedAt", async () => {
    const spy = vi.spyOn(api, "dealsByIsTopDealAndUpdatedAt");
    renderHook(() => useDeals({ listingType: "top" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ isTopDeal: "true" }),
    );
  });

  it("listingType='lightning' should call dealsByIsLightningDealAndUpdatedAt", async () => {
    const spy = vi.spyOn(api, "dealsByIsLightningDealAndUpdatedAt");
    renderHook(() => useDeals({ listingType: "lightning" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ isLightningDeal: "true" }),
    );
  });
});

// ---------------------------------------------------------------------------
// Test 2: Sort / ListingType Reset
// ---------------------------------------------------------------------------
describe("Sort Reset", () => {
  it("switching sortDirection should clear data and re-fetch", async () => {
    const wrapper = createWrapper();
    const { result, rerender } = renderHook(
      ({ sortDirection }: { sortDirection: "ASC" | "DESC" }) =>
        useDeals({ listingType: "recent", sortDirection }),
      {
        wrapper,
        initialProps: { sortDirection: "ASC" as "ASC" | "DESC" },
      },
    );

    await waitFor(() => {
      expect(result.current.deals.length).toBeGreaterThan(0);
    });

    const ascDeals = [...result.current.deals];

    rerender({ sortDirection: "DESC" });

    await waitFor(() => {
      expect(result.current.deals.length).toBeGreaterThan(0);
    });

    expect(result.current.deals[0]?.id).not.toBe(ascDeals[0]?.id);
  });

  it("switching listingType should clear data and re-fetch", async () => {
    const wrapper = createWrapper();
    const { result, rerender } = renderHook(
      ({ listingType }: { listingType: ListingType }) =>
        useDeals({ listingType }),
      {
        wrapper,
        initialProps: { listingType: "recent" as ListingType },
      },
    );

    await waitFor(() => {
      expect(result.current.deals.length).toBeGreaterThan(0);
    });

    const recentDeals = [...result.current.deals];

    rerender({ listingType: "top" });

    await waitFor(() => {
      expect(result.current.deals.length).toBeGreaterThan(0);
    });

    expect(result.current.deals).not.toEqual(recentDeals);
  });
});

// ---------------------------------------------------------------------------
// Test 3 (Stretch A): Exhaust Full Result Set
// ---------------------------------------------------------------------------
describe("Full Loading (Stretch A)", () => {
  it("exhaustAll mode should load all 1000 deals (ASC)", async () => {
    const { result } = renderHook(
      () => useDeals({ listingType: "recent", exhaustAll: true }),
      { wrapper: createWrapper() },
    );

    await waitFor(
      () => {
        expect(result.current.isExhausted).toBe(true);
      },
      { timeout: 30000 },
    );

    expect(result.current.deals).toHaveLength(1000);

    const ids = result.current.deals.map((d) => d.id);
    expect(new Set(ids).size).toBe(1000);

    for (let i = 1; i < result.current.deals.length; i++) {
      expect(
        result.current.deals[i].createdAt >=
          result.current.deals[i - 1].createdAt,
      ).toBe(true);
    }
  });

  it("exhaustAll + DESC should sort in descending order", async () => {
    const { result } = renderHook(
      () =>
        useDeals({
          listingType: "top",
          sortDirection: "DESC",
          exhaustAll: true,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(
      () => {
        expect(result.current.isExhausted).toBe(true);
      },
      { timeout: 30000 },
    );

    expect(result.current.deals).toHaveLength(1000);

    for (let i = 1; i < result.current.deals.length; i++) {
      expect(
        result.current.deals[i].updatedAt <=
          result.current.deals[i - 1].updatedAt,
      ).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Test 4 (Stretch B): Consistent Page Sizes
// ---------------------------------------------------------------------------
describe("Consistent Page Sizes (Stretch B)", () => {
  it("each fetchNextPage increment should equal pageSize (except last page)", async () => {
    const TARGET_PAGE_SIZE = 20;
    const { result } = renderHook(
      () =>
        useDeals({
          listingType: "recent",
          pageSize: TARGET_PAGE_SIZE,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.deals.length).toBe(TARGET_PAGE_SIZE);
    });

    const increments: number[] = [result.current.deals.length];
    let prevLength = result.current.deals.length;

    while (result.current.hasNextPage) {
      await act(async () => {
        result.current.fetchNextPage();
      });

      await waitFor(() => {
        expect(result.current.deals.length).toBeGreaterThan(prevLength);
      });

      const increment = result.current.deals.length - prevLength;
      increments.push(increment);
      prevLength = result.current.deals.length;

      if (increments.length > 60) break;
    }

    for (let i = 0; i < increments.length - 1; i++) {
      expect(increments[i]).toBe(TARGET_PAGE_SIZE);
    }

    expect(increments[increments.length - 1]).toBeLessThanOrEqual(
      TARGET_PAGE_SIZE,
    );
    expect(increments[increments.length - 1]).toBeGreaterThan(0);
  });

  it("with exhaustAll should still return 1000 unique deals", async () => {
    const { result } = renderHook(
      () =>
        useDeals({
          listingType: "lightning",
          pageSize: 20,
          exhaustAll: true,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(
      () => {
        expect(result.current.isExhausted).toBe(true);
      },
      { timeout: 30000 },
    );

    expect(result.current.deals).toHaveLength(1000);

    const ids = result.current.deals.map((d) => d.id);
    expect(new Set(ids).size).toBe(1000);
  });
});
