import { Box, Skeleton, Grid, Container } from "@mui/material";

export const BlogCardSkeleton = () => (
  <div className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50 flex flex-col h-full animate-pulse">
    <Skeleton variant="rectangular" height={240} className="w-full" />
    <div className="p-8 flex flex-col flex-1">
      <Skeleton variant="text" width="40%" height={20} className="mb-6" />
      <Skeleton variant="text" width="90%" height={40} className="mb-4" />
      <Skeleton variant="text" width="100%" height={24} className="mb-2" />
      <Skeleton variant="text" width="100%" height={24} className="mb-2" />
      <Skeleton variant="text" width="60%" height={24} className="mb-8" />
      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={80} height={20} />
        </div>
        <Skeleton variant="text" width={60} height={20} />
      </div>
    </div>
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50 flex flex-col h-full animate-pulse">
    <Skeleton variant="rectangular" height={240} className="w-full" />
    <div className="p-6 flex flex-col flex-1">
      <Skeleton variant="text" width="30%" height={20} className="mb-4" />
      <Skeleton variant="text" width="90%" height={32} className="mb-3" />
      <Skeleton variant="text" width="100%" height={20} className="mb-2" />
      <Skeleton variant="text" width="60%" height={20} className="mb-6" />
      <div className="mt-auto flex items-center justify-between">
        <Skeleton variant="text" width={100} height={36} />
        <Skeleton variant="circular" width={48} height={48} />
      </div>
    </div>
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
    <div className="flex flex-col lg:flex-row">
      <div className="lg:w-1/2 bg-slate-50 p-6 sm:p-10 flex items-center justify-center">
        <Skeleton variant="rectangular" className="w-full max-w-lg aspect-square rounded-3xl" />
      </div>
      <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
        <Skeleton variant="rounded" width={120} height={30} className="mb-6" />
        <Skeleton variant="text" width="80%" height={60} className="mb-4" />
        <Skeleton variant="text" width="40%" height={40} className="mb-8" />
        <div className="space-y-3 mb-10">
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="70%" height={24} />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton variant="rectangular" width="100%" height={56} className="rounded-2xl" />
          <Skeleton variant="rectangular" width="100%" height={56} className="rounded-2xl" />
        </div>
      </div>
    </div>
  </div>
);

export const BlogDetailSkeleton = () => (
  <Container maxWidth="md" className="pt-8 md:pt-16">
    <Skeleton variant="text" width={100} height={30} className="mb-10" />
    <div className="flex gap-2 mb-6">
      <Skeleton variant="rounded" width={60} height={28} />
      <Skeleton variant="rounded" width={80} height={28} />
    </div>
    <Skeleton variant="text" width="90%" height={80} className="mb-8" />
    <div className="flex items-center justify-between py-6 border-y border-slate-100 mb-12">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div>
          <Skeleton variant="text" width={120} height={24} />
          <Skeleton variant="text" width={180} height={18} />
        </div>
      </div>
      <Skeleton variant="circular" width={40} height={40} />
    </div>
    <Skeleton variant="rectangular" width="100%" height={400} className="rounded-[2.5rem] mb-12" />
    <div className="space-y-4">
      <Skeleton variant="text" width="100%" height={28} />
      <Skeleton variant="text" width="100%" height={28} />
      <Skeleton variant="text" width="95%" height={28} />
      <Skeleton variant="text" width="100%" height={28} />
      <Skeleton variant="text" width="60%" height={28} />
    </div>
  </Container>
);

export const ChatSkeleton = () => (
  <div className="space-y-4 p-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex flex-col max-w-[70%] ${i % 2 === 0 ? 'items-end' : 'items-start'}`}>
          <Skeleton variant="text" width={80} height={16} className="mb-1" />
          <Skeleton variant="rectangular" width={200 + Math.random() * 100} height={60} className="rounded-2xl" />
        </div>
      </div>
    ))}
  </div>
);

export const AdminThreadSkeleton = () => (
  <div className="space-y-1">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="p-4 flex items-center gap-4 border-b border-slate-50">
        <Skeleton variant="circular" width={48} height={48} shrink={0} />
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={40} height={16} />
          </div>
          <Skeleton variant="text" width="80%" height={18} />
        </div>
      </div>
    ))}
  </div>
);

export const AdminOverviewSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white p-5 rounded-3xl border border-slate-200">
          <Skeleton variant="circular" width={32} height={32} className="mb-4" />
          <Skeleton variant="text" width="60%" height={20} className="mb-2" />
          <Skeleton variant="text" width="80%" height={32} />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Skeleton variant="rectangular" height={400} className="rounded-3xl" />
      <Skeleton variant="rectangular" height={400} className="rounded-3xl" />
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-6">
        <Skeleton variant="rectangular" width={64} height={64} className="rounded-2xl" />
        <div className="flex-1">
          <Skeleton variant="text" width="40%" height={24} className="mb-2" />
          <Skeleton variant="text" width="60%" height={20} />
        </div>
        <Skeleton variant="text" width={80} height={24} />
      </div>
    ))}
  </div>
);
