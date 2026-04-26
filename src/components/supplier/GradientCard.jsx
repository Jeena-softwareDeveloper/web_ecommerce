import React from 'react';

const GradientCard = ({ 
  title, 
  value, 
  subtitle,
  icon: Icon,
  buttonText,
  onButtonClick,
  gradientFrom = 'from-[#7C3AED]',
  gradientTo = 'to-[#5B21B6]',
  buttonColor = 'bg-white',
  buttonTextColor = 'text-[#7C3AED]',
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl p-4 text-white flex items-center justify-between ${className}`}>
      <div className="flex items-center flex-1 mr-3">
        {Icon && (
          <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mr-3 shrink-0">
            <Icon size={20} className="text-white" />
          </div>
        )}
        <div>
          <h2 className="text-[16px] font-black leading-tight mb-0.5">{title}</h2>
          {subtitle && (
            <p className="text-white/80 text-[11px] leading-tight font-medium hidden sm:block">
              {subtitle.label} <span className="font-bold text-white">{subtitle.value}</span>
            </p>
          )}
          {subtitle && (
            <p className="text-white/80 text-[11px] leading-tight font-medium sm:hidden">
              {subtitle.label}
            </p>
          )}
        </div>
      </div>
      
      {buttonText && (
        <button 
          onClick={onButtonClick}
          className={`${buttonColor} ${buttonTextColor} px-4 py-2 rounded-xl font-black text-[13px] active:scale-95 transition-all shadow-sm shrink-0 whitespace-nowrap`}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default GradientCard;
