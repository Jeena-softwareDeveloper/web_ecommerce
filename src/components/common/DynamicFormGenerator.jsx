import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ChevronUp, AlertCircle, Check, 
  Sparkles, Info, HelpCircle, X, Plus, Trash2,
  Image as ImageIcon, DollarSign, Tag, Package,
  Ruler, Weight, Hash, Grid, List, Type, Calendar,
  Star, TrendingUp, Shield, Truck, Clock, Eye
} from 'lucide-react';

const DynamicFormGenerator = ({
  formConfig = [],
  initialValues = {},
  onChange,
  onSubmit,
  mode = 'create', // 'create' or 'edit'
  categorySpecs = [], // Dynamic specs from category
  showLivePreview = true,
  showValidation = true
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState({});

  // Group fields by section
  const sections = formConfig.reduce((acc, field) => {
    const section = field.section || 'General';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(field);
    return acc;
  }, {});

  const sectionKeys = Object.keys(sections);

  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  const validateField = (field, value) => {
    const fieldConfig = formConfig.find(f => f.id === field);
    if (!fieldConfig || !fieldConfig.validation) return '';

    const { required, minLength, maxLength, pattern, min, max } = fieldConfig.validation;

    if (required && (!value || value.toString().trim() === '')) {
      return `${fieldConfig.label} is required`;
    }

    if (minLength && value && value.toString().length < minLength) {
      return `${fieldConfig.label} must be at least ${minLength} characters`;
    }

    if (maxLength && value && value.toString().length > maxLength) {
      return `${fieldConfig.label} must be less than ${maxLength} characters`;
    }

    if (pattern && value && !new RegExp(pattern).test(value)) {
      return fieldConfig.errorMessage || `Invalid ${fieldConfig.label} format`;
    }

    if (min !== undefined && value !== undefined && parseFloat(value) < min) {
      return `${fieldConfig.label} must be at least ${min}`;
    }

    if (max !== undefined && value !== undefined && parseFloat(value) > max) {
      return `${fieldConfig.label} must be at most ${max}`;
    }

    return '';
  };

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    if (touched[fieldId]) {
      const error = validateField(fieldId, value);
      setErrors(prev => ({
        ...prev,
        [fieldId]: error
      }));
    }
  };

  const handleBlur = (fieldId) => {
    setTouched(prev => ({
      ...prev,
      [fieldId]: true
    }));

    const error = validateField(fieldId, formData[fieldId]);
    setErrors(prev => ({
      ...prev,
      [fieldId]: error
    }));
  };

  const handleAISuggestion = async (fieldId) => {
    const fieldConfig = formConfig.find(f => f.id === fieldId);
    if (!fieldConfig?.aiSuggestions) return;

    // Simulate AI API call
    setAiSuggestions(prev => ({
      ...prev,
      [fieldId]: { loading: true }
    }));

    try {
      // In real implementation, call AI API
      const suggestions = await generateAISuggestions(fieldId, formData);
      setAiSuggestions(prev => ({
        ...prev,
        [fieldId]: { loading: false, suggestions }
      }));
    } catch (error) {
      setAiSuggestions(prev => ({
        ...prev,
        [fieldId]: { loading: false, error: 'AI suggestion failed' }
      }));
    }
  };

  const generateAISuggestions = async (fieldId, currentData) => {
    // Mock AI suggestions based on field type
    switch (fieldId) {
      case 'productName':
        return [
          'Trendy Cotton Kurta Set with Embroidery',
          'Premium Silk Saree with Zari Work',
          'Casual Denim Jacket for Men',
          'Elegant Anarkali Suit for Women'
        ];
      case 'description':
        return [
          'Made from premium quality cotton fabric with intricate embroidery work. Perfect for festive occasions and weddings.',
          'This elegant piece features traditional craftsmanship with modern styling. Comfortable and stylish for daily wear.'
        ];
      case 'tags':
        return ['ethnic wear', 'traditional', 'festive', 'wedding', 'casual', 'fashion'];
      default:
        return [];
    }
  };

  const renderField = (field) => {
    const {
      id,
      type,
      label,
      placeholder,
      options = [],
      helpText,
      icon,
      prefix,
      suffix,
      rows = 3,
      disabled = false,
      readOnly = false,
      showCount = false,
      maxCount,
      aiSuggestions: hasAiSuggestions
    } = field;

    const value = formData[id] || '';
    const error = errors[id];
    const isTouched = touched[id];
    const aiSuggestion = aiSuggestions[id];

    const fieldClasses = `w-full bg-white border rounded-xl p-4 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all ${
      error && isTouched ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
    } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`;

    const renderInput = () => {
      switch (type) {
        case 'text':
        case 'email':
        case 'tel':
          return (
            <div className="relative">
              {prefix && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {prefix}
                </div>
              )}
              <input
                type={type}
                id={id}
                value={value}
                onChange={(e) => handleChange(id, e.target.value)}
                onBlur={() => handleBlur(id)}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                className={`${fieldClasses} ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''}`}
              />
              {suffix && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {suffix}
                </div>
              )}
              {showCount && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                  {value.length}/{maxCount}
                </div>
              )}
            </div>
          );

        case 'number':
          return (
            <div className="relative">
              <input
                type="number"
                id={id}
                value={value}
                onChange={(e) => handleChange(id, e.target.value)}
                onBlur={() => handleBlur(id)}
                placeholder={placeholder}
                disabled={disabled}
                className={fieldClasses}
                step={field.step || 'any'}
                min={field.min}
                max={field.max}
              />
              {suffix && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {suffix}
                </div>
              )}
            </div>
          );

        case 'textarea':
          return (
            <div className="relative">
              <textarea
                id={id}
                value={value}
                onChange={(e) => handleChange(id, e.target.value)}
                onBlur={() => handleBlur(id)}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                rows={rows}
                className={`${fieldClasses} resize-none`}
              />
              {showCount && (
                <div className="absolute bottom-3 right-4 text-[10px] text-gray-400">
                  {value.length}/{maxCount}
                </div>
              )}
            </div>
          );

        case 'select':
          return (
            <div className="relative">
              <select
                id={id}
                value={value}
                onChange={(e) => handleChange(id, e.target.value)}
                onBlur={() => handleBlur(id)}
                disabled={disabled}
                className={`${fieldClasses} appearance-none`}
              >
                <option value="">{placeholder || 'Select an option'}</option>
                {options.map((opt, idx) => (
                  <option key={idx} value={opt.value || opt}>
                    {opt.label || opt}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>
          );

        case 'multiselect':
          const selectedValues = Array.isArray(value) ? value : value ? value.split(',') : [];
          return (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {options.map((opt, idx) => {
                  const isSelected = selectedValues.includes(opt.value || opt);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const newValues = isSelected
                          ? selectedValues.filter(v => v !== (opt.value || opt))
                          : [...selectedValues, opt.value || opt];
                        handleChange(id, newValues.join(','));
                      }}
                      className={`px-4 py-2 rounded-lg border-2 transition-all font-medium text-sm ${
                        isSelected
                          ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {opt.label || opt}
                    </button>
                  );
                })}
              </div>
              <input
                type="hidden"
                value={selectedValues.join(',')}
                onChange={() => {}}
              />
            </div>
          );

        case 'checkbox':
          return (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={id}
                checked={!!value}
                onChange={(e) => handleChange(id, e.target.checked)}
                onBlur={() => handleBlur(id)}
                disabled={disabled}
                className="w-5 h-5 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]"
              />
              <label htmlFor={id} className="text-gray-700 font-medium">
                {label}
              </label>
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="radio"
                    id={`${id}-${idx}`}
                    name={id}
                    value={opt.value || opt}
                    checked={value === (opt.value || opt)}
                    onChange={(e) => handleChange(id, e.target.value)}
                    onBlur={() => handleBlur(id)}
                    disabled={disabled}
                    className="w-4 h-4 border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]"
                  />
                  <label htmlFor={`${id}-${idx}`} className="text-gray-700 font-medium">
                    {opt.label || opt}
                  </label>
                </div>
              ))}
            </div>
          );

        case 'color':
          return (
            <div className="flex flex-wrap gap-3">
              {options.map((color, idx) => {
                const isSelected = value === color.value || value === color;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChange(id, color.value || color)}
                    className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
                      isSelected ? 'bg-gray-50 scale-105' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full border-2 ${
                        isSelected ? 'border-[#7C3AED]' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.hex || color }}
                    />
                    <span className="text-[10px] font-medium text-gray-600">
                      {color.name || color}
                    </span>
                  </button>
                );
              })}
            </div>
          );

        case 'image':
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {Array.isArray(value) && value.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...value];
                        newImages.splice(idx, 1);
                        handleChange(id, newImages);
                      }}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {(!value || value.length < (field.maxImages || 12)) && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#7C3AED] transition-colors">
                    <ImageIcon size={24} className="text-gray-400" />
                    <span className="text-[10px] font-medium text-gray-500 mt-2">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        const currentImages = Array.isArray(value) ? value : [];
                        const newImages = [...currentImages, ...files.map(file => URL.createObjectURL(file))];
                        handleChange(id, newImages.slice(0, field.maxImages || 12));
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-[10px] text-gray-500">
                {field.maxImages ? `Max ${field.maxImages} images` : 'Add product images'}
              </p>
            </div>
          );

        case 'dynamic-specs':
          return (
            <div className="space-y-4">
              {categorySpecs.map((spec, idx) => {
                const specValue = formData[`spec_${spec.name}`] || '';
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">
                        {spec.name} {spec.required && <span className="text-red-500">*</span>}
                      </label>
                      {spec.type === 'select' && spec.options && (
                        <button
                          type="button"
                          onClick={() => {
                            // Toggle between select and input
                            const currentMode = formData[`spec_mode_${spec.name}`] || 'select';
                            handleChange(`spec_mode_${spec.name}`, currentMode === 'select' ? 'input' : 'select');
                          }}
                          className="text-[10px] text-[#7C3AED] font-medium"
                        >
                          {formData[`spec_mode_${spec.name}`] === 'input' ? 'Use List' : 'Custom Input'}
                        </button>
                      )}
                    </div>
                    
                    {spec.type === 'select' && spec.options && formData[`spec_mode_${spec.name}`] !== 'input' ? (
                      <select
                        value={specValue}
                        onChange={(e) => handleChange(`spec_${spec.name}`, e.target.value)}
                        className={fieldClasses}
                      >
                        <option value="">Select {spec.name}</option>
                        {spec.options.map((opt, optIdx) => (
                          <option key={optIdx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={spec.type === 'number' ? 'number' : 'text'}
                        value={specValue}
                        onChange={(e) => handleChange(`spec_${spec.name}`, e.target.value)}
                        placeholder={`Enter ${spec.name}`}
                        className={fieldClasses}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );

        default:
          return (
            <input
              type="text"
              id={id}
              value={value}
              onChange={(e) => handleChange(id, e.target.value)}
              onBlur={() => handleBlur(id)}
              placeholder={placeholder}
              className={fieldClasses}
            />
          );
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor={id} className="text-sm font-medium text-gray-700 flex items-center gap-2">
            {icon && React.cloneElement(icon, { size: 16, className: 'text-[#7C3AED]' })}
            {label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          
          {hasAiSuggestions && (
            <button
              type="button"
              onClick={() => handleAISuggestion(id)}
              disabled={aiSuggestion?.loading}
              className="flex items-center gap-1 text-[10px] text-[#7C3AED] font-medium hover:text-[#6D28D9]"
            >
              <Sparkles size={12} />
              {aiSuggestion?.loading ? 'Thinking...' : 'AI Suggest'}
            </button>
          )}
        </div>

        {helpText && (
          <p className="text-[10px] text-gray-500 flex items-center gap-1">
            <Info size={10} />
            {helpText}
          </p>
        )}

        {renderInput()}

        {aiSuggestion?.suggestions && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-gray-400">AI Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {aiSuggestion.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChange(id, suggestion)}
                  className="text-[10px] bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-1 rounded-full hover:bg-[#7C3AED]/20"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && isTouched && (
          <p className="text-[10px] text-red-500 flex items-center gap-1">
            <AlertCircle size={10} />
            {error}
          </p>
        )}
      </div>
    );
  };

  const renderSection = (sectionName, fields, index) => {
    const isActive = activeSection === index;
    const hasErrors = fields.some(field => errors[field.id] && touched[field.id]);
    const isComplete = fields.every(field => {
      if (!field.required) return true;
      const value = formData[field.id];
      return value && value.toString().trim() !== '';
    });

    return (
      <div key={sectionName} className="border border-gray-200 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setActiveSection(isActive ? -1 : index)}
          className="w-full p-4 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {isComplete ? <Check size={16} /> : <span className="text-sm font-bold">{index + 1}</span>}
            </div>
            <div className="text-left">
              <h3 className="font-bold text-gray-900">{sectionName}</h3>
              <p className="text-[10px] text-gray-500">
                {fields.length} field{fields.length !== 1 ? 's' : ''}
                {hasErrors && <span className="text-red-500 ml-2">• Has errors</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasErrors && (
              <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full">
                Fix errors
              </span>
            )}
            <ChevronDown size={18} className={`text-gray-400 transition-transform ${isActive ? 'rotate-180' : ''}`} />
          </div>
        </button>

        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {fields.map((field, idx) => (
                  <div key={field.id} className="space-y-3">
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    const newTouched = {};
    
    formConfig.forEach(field => {
      newTouched[field.id] = true;
      const error = validateField(field.id, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.keys(newErrors).length > 0;
    
    if (!hasErrors && onSubmit) {
      onSubmit(formData);
    }
  };

  const getCompletionPercentage = () => {
    const requiredFields = formConfig.filter(f => f.required);
    const completedFields = requiredFields.filter(f => {
      const value = formData[f.id];
      return value && value.toString().trim() !== '';
    });
    return requiredFields.length > 0 ? Math.round((completedFields.length / requiredFields.length) * 100) : 0;
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900">
            {mode === 'create' ? 'Create New Product' : 'Edit Product'}
          </span>
          <span className="text-[10px] font-bold text-[#7C3AED]">
            {completionPercentage}% Complete
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#7C3AED] transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Form Sections */}
      <div className="space-y-4">
        {sectionKeys.map((sectionName, index) =>
          renderSection(sectionName, sections[sectionName], index)
        )}
      </div>

      {/* Live Preview (Optional) */}
      {showLivePreview && (
        <div className="border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Eye size={16} className="text-[#7C3AED]" />
              Live Preview
            </h3>
            <span className="text-[10px] text-gray-500">Updates as you type</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                {formData.images?.[0] ? (
                  <img src={formData.images[0]} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ImageIcon size={24} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">
                  {formData.productName || 'Product Name'}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {formData.description || 'Product description will appear here...'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-[#7C3AED]">
                    ₹{formData.price || '0'}
                  </span>
                  {formData.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{formData.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Summary */}
      {showValidation && Object.keys(errors).length > 0 && (
        <div className="border border-red-200 bg-red-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-red-500" />
            <h3 className="font-bold text-red-700">Fix the following errors:</h3>
          </div>
          <ul className="space-y-1">
            {Object.entries(errors).map(([fieldId, error]) => {
              if (!error) return null;
              const field = formConfig.find(f => f.id === fieldId);
              return (
                <li key={fieldId} className="text-sm text-red-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  <span className="font-medium">{field?.label || fieldId}:</span>
                  <span>{error}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 -mx-4 -mb-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={Object.keys(errors).length > 0}
          className="w-full bg-[#7C3AED] py-4 rounded-xl text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-purple-100 hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {mode === 'create' ? 'Create Product' : 'Update Product'}
        </button>
      </div>
    </div>
  );
};

export default DynamicFormGenerator;
