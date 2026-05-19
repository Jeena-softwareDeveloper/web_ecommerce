import React from 'react';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'text-primary',
  bgColor = 'bg-white',
  borderColor = 'border-gray-100',
  textColor = 'text-gray-900',
  subtitle,
  trend,
  trendColor = 'text-green-500',
  className = ''
}) => {
  return (
    <div className={`${bgColor} rounded-xl p-4 border ${borderColor} shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-gray-500 text-xs sm:text-sm font-bold">{title}</p>
        {Icon && <Icon size={16} className={`${iconColor} sm:w-5 sm:h-5`} />}
      </div>
      <p className={`${textColor} text-lg sm:text-xl font-black`}>{value}</p>
      {(subtitle || trend) && (
        <div className="flex items-center justify-between mt-2">
          {subtitle && (
            <p className="text-gray-400 text-xxs sm:text-xs">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <span className="text-xxs sm:text-xs font-bold">{trend}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
