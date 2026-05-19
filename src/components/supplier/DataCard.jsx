import React from 'react';

const DataCard = ({ 
  title,
  viewAllText = 'View All',
  onViewAll,
  children,
  emptyIcon: EmptyIcon,
  emptyText = 'No data found',
  emptyActionText,
  onEmptyAction,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl p-4 border border-gray-100 shadow-sm ${className}`}>
      {(title || viewAllText) && (
        <div className="flex justify-between items-center mb-4">
          {title && <h3 className="text-gray-900 text-sm font-bold">{title}</h3>}
          {viewAllText && onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-[#7C3AED] text-xs font-bold"
            >
              {viewAllText}
            </button>
          )}
        </div>
      )}
      
      {children ? (
        children
      ) : (
        <div className="text-center py-10">
          {EmptyIcon && <EmptyIcon size={48} className="text-gray-300 mx-auto mb-3" />}
          <p className="text-gray-500 text-sm">{emptyText}</p>
          {emptyActionText && onEmptyAction && (
            <button 
              onClick={onEmptyAction}
              className="mt-3 bg-[#7C3AED] text-white px-4 py-2 rounded-lg text-xs font-bold"
            >
              {emptyActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DataCard;
