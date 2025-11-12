'use client';

export default function RecentHotelCardSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
        <div className="flex gap-2">
          <div className="h-3 w-20 rounded bg-gray-100" />
          <div className="h-3 w-24 rounded bg-gray-100" />
        </div>
        <div className="h-4 w-24 rounded bg-gray-200" />
      </div>
    </div>
  );
}

