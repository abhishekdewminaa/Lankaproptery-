import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-white/5 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-white/10 h-full flex flex-col">
    <div className="relative h-[220px] bg-gray-200 dark:bg-white/5 overflow-hidden animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] animate-[shimmer_1.5s_infinite]" />
    </div>
    <div className="p-5 flex flex-col gap-3 flex-grow">
      <div className="h-5 w-4/5 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
      <div className="h-4 w-1/2 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between">
        <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-10 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
        <div className="h-10 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

export const SkeletonList = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array(count).fill(0).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
