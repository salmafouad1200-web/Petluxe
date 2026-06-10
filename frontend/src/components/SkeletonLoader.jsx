import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 3 }) => {
  const skeletons = Array(count).fill(0);

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletons.map((_, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-slate-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
            <div className="h-10 bg-slate-200 rounded-xl animate-pulse mt-2 w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {skeletons.map((_, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded animate-pulse w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
