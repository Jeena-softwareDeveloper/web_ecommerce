import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Inbox 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable and Highly Responsive Table Component (Upgraded with Framer Motion)
 * 
 * Props:
 * - columns: Array of objects { key: string, label: string, sortable?: boolean, render?: (row, value) => React.ReactNode }
 * - data: Array of objects (table rows)
 * - isLoading: boolean (shows skeleton loader)
 * - emptyStateText: string (optional, text to show when no records found)
 * - actions: Array of objects { icon: React.ReactNode, label: string, onClick: (row) => void, colorClass?: string }
 * - pagination: Object { currentPage, totalItems, pageSize, onPageChange } (optional)
 * - onRowClick: Function (row) => void (optional)
 * - searchPlaceholder: string (optional)
 */
const ResponsiveTable = ({
  columns,
  data = [],
  isLoading = false,
  emptyStateText = "No records found",
  actions = [],
  pagination,
  onRowClick,
  searchPlaceholder = "Search records...",
  hideSearch = false,
  isRowExpandable,
  expandableRowRenderer,
  onRowExpand,
  maxHeight = "calc(100vh - 300px)",
  hideNoColumn = false // Adding option to hide sequential row numbers if desired
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRowExpand = async (row) => {
    const id = row._id || row.id;
    if (!expandedRows[id] && onRowExpand) {
      await onRowExpand(row);
    }
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 1. Handle Search filtering locally if no remote search is active
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    
    return data.filter(row => {
      return Object.keys(row).some(key => {
        const val = row[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [data, searchTerm]);

  // 2. Handle Sort logic locally
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Trigger Sort callback
  const handleSort = (key, sortable) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 3. Smart Status Badge Formatter helper
  const renderStatusBadge = (status) => {
    if (!status || typeof status !== 'string') return status;
    
    const normalized = status.toLowerCase().trim();
    
    // Status colors definition mapping
    const statusMap = {
      // Active / Success states
      active: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
      completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
      success: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
      paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
      delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
      live: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', dot: 'bg-emerald-500' },
      
      // Pending / Warning states
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' },
      processing: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' },
      confirming: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' },
      warning: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', dot: 'bg-amber-500' },
      
      // Failed / Error states
      failed: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500' },
      cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500' },
      inactive: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500' },
      out_of_stock: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500' },
      rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', dot: 'bg-rose-500' },

      // Shipped / Transit states
      shipped: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100', dot: 'bg-sky-500' },
      dispatched: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100', dot: 'bg-sky-500' },
      transit: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100', dot: 'bg-sky-500' }
    };

    const color = statusMap[normalized] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${color.bg} ${color.text} border ${color.border} shrink-0`}>
        <span className={`w-1.5 h-1.5 rounded-full ${color.dot} animate-pulse shrink-0`}></span>
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  // Render cell helper
  const renderCell = (row, col) => {
    const rawVal = row[col.key];
    if (col.render) {
      return col.render(row, rawVal);
    }
    
    // Auto-badge common status column keys
    if (col.key === 'status' || col.key === 'paymentStatus' || col.key === 'orderStatus') {
      return renderStatusBadge(rawVal);
    }

    return rawVal === null || rawVal === undefined ? '-' : String(rawVal);
  };

  // 4. Render Loading skeleton
  const renderLoadingSkeleton = () => {
    return (
      <div className="space-y-4 w-full">
        {/* Desktop Skeleton */}
        <div className="hidden lg:block overflow-hidden bg-transparent">
          <div className="bg-white border-b border-gray-100 flex items-center px-6 py-4 rounded-t-2xl">
            {columns.map((_, idx) => (
              <div key={idx} className="flex-1 h-4 bg-gray-200/60 rounded-lg animate-pulse mr-4 last:mr-0"></div>
            ))}
            {actions.length > 0 && <div className="w-20 h-4 bg-gray-200/60 rounded-lg animate-pulse"></div>}
          </div>
          {[...Array(5)].map((_, rIdx) => (
            <div key={rIdx} className="h-16 border-b border-gray-100 flex items-center px-6 last:border-0 bg-white">
              {columns.map((_, cIdx) => (
                <div key={cIdx} className="flex-1 h-3.5 bg-gray-100/80 rounded-lg animate-pulse mr-4 last:mr-0"></div>
              ))}
              {actions.length > 0 && <div className="w-20 h-3.5 bg-gray-100/80 rounded-lg animate-pulse"></div>}
            </div>
          ))}
        </div>

        {/* Mobile Cards Skeleton */}
        <div className="lg:hidden space-y-4">
          {[...Array(3)].map((_, cardIdx) => (
            <div key={cardIdx} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                <div className="w-1/3 h-4 bg-gray-200/60 rounded animate-pulse"></div>
                <div className="w-1/4 h-5 bg-gray-200/60 rounded-full animate-pulse"></div>
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, fieldIdx) => (
                  <div key={fieldIdx} className="flex justify-between items-center">
                    <div className="w-1/4 h-3.5 bg-gray-100/80 rounded animate-pulse"></div>
                    <div className="w-1/3 h-3.5 bg-gray-100/80 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 5. Calculate Page boundaries details
  const totalItemsCount = pagination ? pagination.totalItems : sortedData.length;
  const currentPageVal = pagination ? pagination.currentPage : 1;
  const pageSizeVal = pagination ? pagination.pageSize : sortedData.length;
  const totalPagesCount = pagination ? Math.ceil(totalItemsCount / pageSizeVal) : 1;
  
  const showFrom = totalItemsCount === 0 ? 0 : (currentPageVal - 1) * pageSizeVal + 1;
  const showTo = Math.min(currentPageVal * pageSizeVal, totalItemsCount);

  // Paginate locally if no remote pagination config provided
  const paginatedData = useMemo(() => {
    if (pagination) return sortedData; // server side paginated data
    return sortedData;
  }, [sortedData]);

  return (
    <div className="w-full space-y-4">
      
      {/* 1. TOP UTILITY BAR (Search Control) */}
      {!hideSearch && (
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
            />
          </div>
        </div>
      )}

      {/* 2. TABLE BODY / VIEWS CONTROL */}
      {isLoading ? (
        renderLoadingSkeleton()
      ) : paginatedData.length === 0 ? (
        // Beautiful Empty State Design
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 text-center px-4 shadow-sm"
        >
          <div className="w-14 h-14 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center text-[#7C3AED] mb-4 shadow-inner">
            <Inbox size={26} strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-black text-gray-800 mb-1">No Data Available</h3>
          <p className="text-xs text-gray-400 font-medium max-w-xs leading-relaxed">{emptyStateText}</p>
        </motion.div>
      ) : (
        <div className="w-full">
          
          {/* DESKTOP VIEW (Large Screen Tables) */}
          <div className="hidden lg:flex flex-col border border-gray-200/70 rounded-xl bg-white shadow-xs overflow-hidden w-full relative">
            <div className="overflow-x-auto overflow-y-auto qlik-custom-scrollbar" style={{ maxHeight: maxHeight }}>
              <table className="w-full border-collapse text-left border-spacing-0">
                
                {/* Translucent Sticky Header exactly like CommonTable but with Jeenora purple hints */}
                <thead className="bg-[#e8f5f2]/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/70 transition-all duration-300">
                  <tr>
                    {!hideNoColumn && (
                      <th className="px-4 py-3 w-10 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        NO
                      </th>
                    )}
                    {isRowExpandable && (
                      <th className="px-4 py-3 w-10 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider"></th>
                    )}
                    {columns.map((col, idx) => (
                      <th
                        key={idx}
                        onClick={() => handleSort(col.key, col.sortable)}
                        className={`px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider select-none ${
                          col.sortable ? 'cursor-pointer hover:bg-teal-50/60 hover:text-teal-700' : ''
                        } transition-colors duration-200`}
                      >
                        <div className="flex items-center gap-1">
                          <span>{col.label}</span>
                          {col.sortable && sortConfig.key === col.key && (
                            sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-teal-600" /> : <ChevronDown size={12} className="text-teal-600" />
                          )}
                        </div>
                      </th>
                    ))}
                    {actions.length > 0 && (
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                
                <tbody className="bg-white divide-y divide-gray-100">
                  <AnimatePresence>
                    {paginatedData.map((row, rIdx) => {
                      const id = row._id || row.id || rIdx;
                      const isExpanded = expandedRows[id];
                      const isExpandable = isRowExpandable ? isRowExpandable(row) : false;
                      const isEven = rIdx % 2 === 0;
                      const rowBg = 'bg-white';

                      return (
                        <React.Fragment key={id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: Math.min(rIdx * 0.03, 0.3) }}
                            onClick={() => {
                              if (isExpandable) {
                                toggleRowExpand(row);
                              } else if (onRowClick) {
                                onRowClick(row);
                              }
                            }}
                            className={`group ${rowBg} hover:bg-teal-50/30 transition-colors duration-150 ${
                              (onRowClick || isExpandable) ? 'cursor-pointer' : ''
                            }`}
                          >
                            {!hideNoColumn && (
                              <td className="px-4 py-2.5 w-10 text-center text-[10px] text-gray-400">
                                {showFrom + rIdx}
                              </td>
                            )}
                            {isRowExpandable && (
                              <td className="px-4 py-2.5 w-10 text-center">
                                {isExpandable ? (
                                  <ChevronDown 
                                    size={14} 
                                    className={`text-gray-400 group-hover:text-teal-600 transition-transform duration-300 ${
                                      isExpanded ? 'rotate-180 text-teal-600' : ''
                                    }`} 
                                  />
                                ) : null}
                              </td>
                            )}

                            {columns.map((col, cIdx) => (
                              <td key={cIdx} className="px-4 py-2.5 text-[11px] text-gray-700 max-w-[240px] truncate">
                                {renderCell(row, col)}
                              </td>
                            ))}
                            
                            {actions.length > 0 && (
                              <td className="px-6 py-4 text-sm text-right font-medium" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-2">
                                  {actions.map((act, actIdx) => (
                                    <button
                                      key={actIdx}
                                      onClick={() => act.onClick(row)}
                                      title={act.label}
                                      className={`p-2 rounded-xl transition-all border shadow-sm ${
                                        act.colorClass || 'bg-white text-gray-500 hover:text-[#7C3AED] border-gray-200/60 hover:border-purple-200 hover:bg-purple-50/50 hover:shadow-purple-600/5'
                                      }`}
                                    >
                                      {act.icon}
                                    </button>
                                  ))}
                                </div>
                              </td>
                            )}
                          </motion.tr>
                          
                          {/* Expanded Row Content */}
                          {isExpandable && isExpanded && (
                            <motion.tr 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-gray-50/50"
                            >
                              <td colSpan={columns.length + (actions.length > 0 ? 1 : 0) + (isRowExpandable ? 1 : 0) + (hideNoColumn ? 0 : 1)} className="px-8 py-5 border-b border-gray-200 bg-purple-50/10">
                                <div className="w-full">
                                  {expandableRowRenderer(row)}
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE VIEW (Screen Stacking Cards) - Now with Framer Motion */}
          <div className="lg:hidden space-y-4 mt-2">
            <AnimatePresence>
              {paginatedData.map((row, rIdx) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(rIdx * 0.05, 0.4) }}
                  key={row._id || row.id || rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4 relative hover:shadow-md hover:border-purple-100 transition-all duration-300"
                >
                  {/* Header row mapping (First column is visual key) */}
                  <div className="flex justify-between items-start gap-4 pb-3.5 border-b border-gray-50">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none block mb-1">
                        {columns[0].label}
                      </span>
                      <span className="text-sm font-black text-gray-800 leading-tight block break-words">
                        {renderCell(row, columns[0])}
                      </span>
                    </div>
                    {columns.slice(1).some(c => c.key === 'status' || c.key === 'paymentStatus' || c.key === 'orderStatus') && (
                      <div>
                        {renderCell(
                          row, 
                          columns.find(c => c.key === 'status' || c.key === 'paymentStatus' || c.key === 'orderStatus')
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 text-xs">
                    {columns.slice(1).map((col, idx) => {
                      if (col.key === 'status' || col.key === 'paymentStatus' || col.key === 'orderStatus') return null;
                      return (
                        <div key={idx} className="min-w-0 space-y-0.5">
                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">
                            {col.label}
                          </span>
                          <span className="font-bold text-gray-700 block truncate">
                            {renderCell(row, col)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer action buttons mapping */}
                  {actions.length > 0 && (
                    <div className="flex items-center gap-2.5 pt-3.5 border-t border-gray-50" onClick={(e) => e.stopPropagation()}>
                      {actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => act.onClick(row)}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                            act.colorClass || 'bg-white text-gray-600 hover:text-purple-600 border-gray-100 hover:bg-purple-50/20 hover:border-purple-200'
                          }`}
                        >
                          {act.icon}
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      )}

      {/* 3. PAGINATION BOTTOM SECTION */}
      {!isLoading && paginatedData.length > 0 && pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-400 font-extrabold tracking-wide uppercase select-none">
            Showing <span className="text-gray-700">{showFrom}</span> to <span className="text-gray-700">{showTo}</span> of <span className="text-gray-700">{totalItemsCount}</span> entries
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => pagination.onPageChange(currentPageVal - 1)}
              disabled={currentPageVal === 1}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Simple Dynamic Page Numbers Block */}
            {[...Array(totalPagesCount)].map((_, pageIdx) => {
              const pageNum = pageIdx + 1;
              const isSelected = currentPageVal === pageNum;
              return (
                <button
                  key={pageIdx}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all border shadow-sm ${
                    isSelected 
                      ? 'bg-purple-600 border-purple-600 text-white shadow-purple-600/15' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => pagination.onPageChange(currentPageVal + 1)}
              disabled={currentPageVal === totalPagesCount}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-40 disabled:hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ResponsiveTable;
