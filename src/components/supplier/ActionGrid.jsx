import React from 'react';

const ActionGrid = ({ 
  actions,
  columns = 2,
  className = ''
}) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  return (
    <div className={`bg-white rounded-xl p-4 border border-gray-100 ${className}`}>
      <h3 className="text-gray-900 text-sm font-bold mb-3">Quick Actions</h3>
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="bg-gray-50 p-3 rounded-lg flex flex-col items-center justify-center hover:bg-gray-100 active:scale-95 transition-all"
          >
            {action.icon && (
              <div className="mb-2">
                {React.cloneElement(action.icon, { 
                  size: 20, 
                  className: `text-[#7C3AED] ${action.icon.props?.className || ''}` 
                })}
              </div>
            )}
            <span className="text-gray-700 text-xs font-bold text-center">{action.label}</span>
            {action.subtitle && (
              <span className="text-gray-400 text-xxs mt-1 text-center">{action.subtitle}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionGrid;
