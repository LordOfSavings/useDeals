import React, { useState } from "react";
import { useDeals, type ListingType } from "./useDeals.js";
import type { ModelSortDirection, Deal } from "./types.js";

const LISTING_OPTIONS: { value: ListingType; label: string; icon: string }[] = [
  { value: "recent", label: "Recent", icon: "🕐" },
  { value: "top", label: "Top Deals", icon: "🔥" },
  { value: "lightning", label: "Lightning", icon: "⚡" },
];

function DealCard({ deal, index }: { deal: Deal; index: number }) {
  const discount =
    deal.prev_price > 0
      ? Math.round(((deal.prev_price - deal.price) / deal.prev_price) * 100)
      : 0;

  return (
    <div
      className="animate-fade-in group bg-white rounded-xl border border-gray-100 p-4 flex gap-4 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 hover:-translate-y-0.5"
      style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
    >
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
        {deal.is_lightning_deal ? "⚡" : deal.is_top_deal ? "🔥" : "🏷️"}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm md:text-base font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">
          {deal.title}
        </h3>
        <p className="text-[10px] text-gray-400 font-mono mb-1.5 truncate">
          {deal.id}
        </p>
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-lg md:text-xl font-bold text-red-500">
            ${deal.price.toFixed(2)}
          </span>
          {deal.prev_price > deal.price && (
            <span className="text-xs md:text-sm line-through text-gray-400">
              ${deal.prev_price.toFixed(2)}
            </span>
          )}
          {discount > 0 && (
            <span className="text-xs font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded">
              -{discount}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
          {deal.forum_type && (
            <span className="bg-gray-100 px-2 py-0.5 rounded">
              {deal.forum_type}
            </span>
          )}
          {deal.dealer_type && (
            <span className="bg-gray-100 px-2 py-0.5 rounded">
              {deal.dealer_type}
            </span>
          )}
          {deal.has_coupon && deal.coupon && (
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
              🎟️ {deal.coupon}
            </span>
          )}
          {deal.has_promotional_code && deal.promotional_code && (
            <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-medium">
              📋 {deal.promotional_code}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
          <span>👍 {deal.vote}</span>
          <span>👎 {deal.down_vote}</span>
          {deal.free_shipping && (
            <span className="text-emerald-600 font-medium">🚚 Free Ship</span>
          )}
          <span className="ml-auto" title={`Created: ${deal.createdAt}\nUpdated: ${deal.updatedAt}`}>
            📅 {new Date(deal.createdAt).toLocaleDateString()} · ✏️ {new Date(deal.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-lg ${color}`}>
      <span className="text-lg md:text-xl font-bold">{value}</span>
      <span className="text-[10px] md:text-xs uppercase tracking-wide opacity-70">
        {label}
      </span>
    </div>
  );
}

export default function App() {
  const [listingType, setListingType] = useState<ListingType>("recent");
  const [sortDirection, setSortDirection] = useState<ModelSortDirection>("ASC");
  const [exhaustAll, setExhaustAll] = useState(false);
  const [pageSize, setPageSize] = useState(20);

  const {
    deals,
    isLoading,
    isFetchingMore,
    hasNextPage,
    fetchNextPage,
    isExhausted,
    error,
  } = useDeals({ listingType, sortDirection, pageSize, exhaustAll });

  const uniqueIds = new Set(deals.map((d) => d.id)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <header className="text-center mb-8 animate-slide-down">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            useDeals Demo
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            TanStack Query + Infinite Pagination + Consistent Page Buffering
          </p>
        </header>

        {/* Test Cases Demonstrated */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 animate-fade-in">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Test Cases Demonstrated
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3">
              <span className="font-semibold text-indigo-600">1. Query Routing</span>
              <p className="text-gray-500 mt-0.5">
                Switch listing type — each calls a different API function
              </p>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3">
              <span className="font-semibold text-indigo-600">2. Sort Reset</span>
              <p className="text-gray-500 mt-0.5">
                Change sort direction or listing type — data resets from scratch
              </p>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3">
              <span className="font-semibold text-indigo-600">3. Exhaust All (Stretch A)</span>
              <p className="text-gray-500 mt-0.5">
                Toggle "Load all 1000" — auto-paginates until all data loaded
              </p>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3">
              <span className="font-semibold text-indigo-600">4. Consistent Pages (Stretch B)</span>
              <p className="text-gray-500 mt-0.5">
                Click "Load Next" — always get exactly pageSize items per batch
              </p>
            </div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Test 1: Query Routing */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Query Routing
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LISTING_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setListingType(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                      listingType === opt.value
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Test 2: Sort Reset */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Sort Direction
              </label>
              <div className="flex gap-1.5">
                {(["ASC", "DESC"] as const).map((dir) => (
                  <button
                    key={dir}
                    onClick={() => setSortDirection(dir)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                      sortDirection === dir
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {dir === "ASC" ? "ASC" : "DESC"}
                  </button>
                ))}
              </div>
            </div>

            {/* Stretch B: Consistent Page Size */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all"
              >
                {[10, 20, 30, 50].map((s) => (
                  <option key={s} value={s}>
                    {s} per page
                  </option>
                ))}
              </select>
            </div>

            {/* Stretch A: Exhaust All */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Exhaust All
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-gray-50 rounded-lg px-3 py-1.5 hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={exhaustAll}
                  onChange={(e) => setExhaustAll(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-gray-600">
                  Load all 1000
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-fade-in">
          <StatBadge
            label="Loaded"
            value={deals.length}
            color="bg-indigo-50 text-indigo-700"
          />
          <StatBadge
            label="Unique IDs"
            value={uniqueIds}
            color="bg-emerald-50 text-emerald-700"
          />
          <StatBadge
            label="Page Size"
            value={pageSize}
            color="bg-amber-50 text-amber-700"
          />
          <StatBadge
            label="Status"
            value={
              isLoading
                ? "Loading"
                : isExhausted
                  ? "Done"
                  : isFetchingMore
                    ? "Fetching"
                    : "Ready"
            }
            color={
              isExhausted
                ? "bg-emerald-50 text-emerald-700"
                : isLoading || isFetchingMore
                  ? "bg-sky-50 text-sky-700"
                  : "bg-gray-50 text-gray-700"
            }
          />
        </div>

        {/* Loading indicator */}
        {(isLoading || isFetchingMore) && (
          <div className="flex items-center justify-center gap-2 py-3 mb-4 animate-slide-down">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-dot" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-dot" style={{ animationDelay: "300ms" }} />
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-dot" style={{ animationDelay: "600ms" }} />
            </div>
            <span className="text-sm text-gray-500">
              {isLoading ? "Loading deals..." : "Fetching more..."}
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 animate-slide-down">
            <span className="font-medium">Error:</span> {error.message}
          </div>
        )}

        {/* Deal List */}
        <div className="space-y-3">
          {deals.map((deal, i) => (
            <DealCard key={deal.id} deal={deal} index={i} />
          ))}
        </div>

        {/* Load More */}
        {!isLoading && hasNextPage && !exhaustAll && (
          <div className="text-center py-8 animate-fade-in">
            <button
              onClick={fetchNextPage}
              disabled={isFetchingMore}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              {isFetchingMore ? "Loading..." : `Load Next ${pageSize}`}
            </button>
          </div>
        )}

        {/* Exhausted */}
        {isExhausted && deals.length > 0 && (
          <div className="text-center py-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full px-5 py-2 text-sm font-medium">
              <span>✓</span>
              All {deals.length} deals loaded ({uniqueIds} unique)
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
