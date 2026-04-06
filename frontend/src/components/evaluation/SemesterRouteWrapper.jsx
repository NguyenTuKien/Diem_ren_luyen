import React from 'react';
import { useCurrentSemester } from '../../hooks/useCurrentSemester';

export default function SemesterRouteWrapper({ children }) {
  const { semesterId, loading, error } = useCurrentSemester();

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 bg-background dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Đang tải thông tin Học kỳ hiện tại...</p>
      </div>
    );
  }

  if (error || !semesterId) {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 bg-background dark:bg-slate-900 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <p className="text-lg font-bold text-slate-800 dark:text-slate-100">Lỗi tải dữ liệu</p>
        <p className="text-sm text-slate-500 max-w-sm">{error || 'Không tìm thấy Học kỳ khả dụng.'}</p>
      </div>
    );
  }

  // Clone component con và truyền semesterId vào
  return React.cloneElement(children, { semesterId });
}
