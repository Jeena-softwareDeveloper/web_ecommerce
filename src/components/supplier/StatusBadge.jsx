import React from 'react';

const StatusBadge = ({ 
  status, 
  customConfig,
  size = 'sm',
  className = ''
}) => {
  const configs = {
    completed: { color: 'text-green-700', bg: 'bg-green-100', label: 'Completed' },
    pending: { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Pending' },
    failed: { color: 'text-red-700', bg: 'bg-red-100', label: 'Failed' },
    processing: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Processing' },
    active: { color: 'text-green-700', bg: 'bg-green-100', label: 'Active' },
    inactive: { color: 'text-gray-700', bg: 'bg-gray-100', label: 'Inactive' },
    draft: { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Draft' },
    shipped: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Shipped' },
    delivered: { color: 'text-green-700', bg: 'bg-green-100', label: 'Delivered' },
    cancelled: { color: 'text-red-700', bg: 'bg-red-100', label: 'Cancelled' },
    returned: { color: 'text-purple-700', bg: 'bg-purple-100', label: 'Returned' },
    refunded: { color: 'text-indigo-700', bg: 'bg-indigo-100', label: 'Refunded' },
  };

  const config = customConfig || configs[status] || configs.pending;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xxs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  return (
    <div className={`${config.bg} ${sizeClasses[size]} rounded-full flex items-center ${className}`}>
      <span className={`${config.color} font-bold uppercase tracking-wider`}>
        {config.label}
      </span>
    </div>
  );
};

export default StatusBadge;
