import React from 'react';

/**
 * PageHeader — Reusable page-level header with title, subtitle, and configurable buttons.
 *
 * Props:
 * - title: string — main page heading
 * - subtitle: string — secondary description (optional)
 * - buttons: array of button config objects (optional)
 *   Each button: {
 *     label: string,
 *     icon?: React.ReactNode,
 *     onClick: () => void,
 *     variant?: 'primary' | 'secondary' | 'danger' | 'ghost',
 *     loading?: boolean,
 *     disabled?: boolean,
 *     hidden?: boolean,   — conditionally hide a button
 *   }
 * - actions: React.ReactNode — custom right-side elements (rendered after buttons)
 */
const VARIANT_STYLES = {
    primary:   'bg-purple-600 text-white hover:bg-purple-700 shadow-sm shadow-purple-600/10 border border-purple-600',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm',
    danger:    'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100',
    ghost:     'bg-transparent text-gray-500 hover:bg-gray-50 border border-gray-200',
};

const PageHeader = ({ title, subtitle, buttons = [], actions }) => {
    const visibleButtons = buttons.filter(btn => !btn.hidden);

    return (
        <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 shrink-0">
            
            {/* Left: Title + Subtitle */}
            <div>
                <h2 className="text-sm font-bold text-gray-900 leading-tight">{title}</h2>
                {subtitle && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>
                )}
            </div>

            {/* Right: Buttons & Custom Actions */}
            <div className="flex items-center gap-3.5">
                {visibleButtons.length > 0 && (
                    <div className="flex items-center gap-2.5">
                        {visibleButtons.map((btn, idx) => (
                            <button
                                key={idx}
                                onClick={btn.onClick}
                                disabled={btn.disabled || btn.loading}
                                className={`
                                    flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold
                                    transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                                    ${VARIANT_STYLES[btn.variant || 'secondary']}
                                `}
                            >
                                {btn.loading ? (
                                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : btn.icon ? (
                                    <span className="shrink-0">{btn.icon}</span>
                                ) : null}
                                <span>{btn.label}</span>
                            </button>
                        ))}
                    </div>
                )}
                
                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
