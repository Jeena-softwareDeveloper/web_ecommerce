import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Package, CheckCircle, AlertCircle, 
  Sparkles, Zap, Clock, BarChart, Users,
  TrendingUp, Shield, Truck, Globe, 
  Smartphone, Tablet, Monitor, Cloud
} from 'lucide-react';
import DynamicFormGenerator from '../../components/common/DynamicFormGenerator';
import { productFormConfig, getCategorySpecs, sampleProductData } from '../../components/common/productFormConfig';

const EnhancedCatalogUpload = () => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('single');
  const [bulkProducts, setBulkProducts] = useState([]);
  const [categorySpecs, setCategorySpecs] = useState([]);

  // Handle form data changes
  const handleFormChange = (data) => {
    setFormData(data);
    
    // Update category-specific specs when category changes
    if (data.category && data.category !== formData.category) {
      const specs = getCategorySpecs(data.category);
      setCategorySpecs(specs);
    }
  };

  // Handle form submission
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, send data to backend
      
      setSubmitStatus({
        type: 'success',
        message: 'Product uploaded successfully!',
        details: 'Your product is now live on the marketplace.'
      });
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({});
        setCategorySpecs([]);
      }, 2000);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Upload failed',
        details: error.message || 'Please check your connection and try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (file) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate CSV/Excel processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock processed products
      const mockProducts = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        status: 'pending',
        errors: []
      }));
      
      setBulkProducts(mockProducts);
      setSubmitStatus({
        type: 'success',
        message: 'Bulk upload processed!',
        details: `Found ${mockProducts.length} products. Review and confirm.`
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Bulk upload failed',
        details: error.message || 'Invalid file format or corrupted file.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats for dashboard
  const stats = [
    { label: 'Total Products', value: '1,247', icon: <Package />, change: '+12%' },
    { label: 'Active Listings', value: '892', icon: <CheckCircle />, change: '+8%' },
    { label: 'Pending Review', value: '23', icon: <Clock />, change: '-3%' },
    { label: 'Monthly Sales', value: '₹2.4L', icon: <TrendingUp />, change: '+24%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Product Catalog</h1>
              <p className="text-white/80 mt-2">Upload and manage your products with advanced tools</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2">
                <Cloud size={18} />
                <span className="font-bold">Sync Inventory</span>
              </button>
              <button className="px-6 py-3 bg-white text-[#7C3AED] rounded-xl hover:bg-white/90 transition-colors font-bold">
                Export Catalog
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="text-[#7C3AED]">
                  {React.cloneElement(stat.icon, { size: 24 })}
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {stat.change} from last month
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload Options */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Method Tabs */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload size={18} className="text-[#7C3AED]" />
                Upload Method
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setActiveTab('single')}
                  className={`p-4 rounded-xl border-2 transition-all font-bold ${
                    activeTab === 'single'
                      ? 'border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED]'
                      : 'border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  Single Product
                </button>
                <button
                  onClick={() => setActiveTab('bulk')}
                  className={`p-4 rounded-xl border-2 transition-all font-bold ${
                    activeTab === 'bulk'
                      ? 'border-[#7C3AED] bg-[#7C3AED]/5 text-[#7C3AED]'
                      : 'border-gray-100 text-gray-500 hover:border-gray-200'
                  }`}
                >
                  Bulk Upload
                </button>
              </div>

              {/* AI Assistant */}
              <div className="bg-gradient-to-r from-[#7C3AED]/10 to-[#6D28D9]/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#7C3AED] rounded-full flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">AI Assistant</h4>
                    <p className="text-[10px] text-gray-500">Get smart suggestions</p>
                  </div>
                </div>
                <button className="w-full py-3 bg-[#7C3AED] text-white rounded-xl font-bold hover:bg-[#6D28D9] transition-colors flex items-center justify-center gap-2">
                  <Zap size={16} />
                  Generate Product Details
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Smartphone size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Mobile Preview</p>
                      <p className="text-[10px] text-gray-500">See how it looks on mobile</p>
                    </div>
                  </div>
                </button>
                <button className="w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <BarChart size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Price Analysis</p>
                      <p className="text-[10px] text-gray-500">Compare with competitors</p>
                    </div>
                  </div>
                </button>
                <button className="w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Target Audience</p>
                      <p className="text-[10px] text-gray-500">Who will buy this?</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Status & Notifications */}
            {submitStatus && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl p-6 ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    submitStatus.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {submitStatus.type === 'success' ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <AlertCircle size={20} className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <h4 className={`font-bold ${
                      submitStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {submitStatus.message}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {submitStatus.details}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2">
            {activeTab === 'single' ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-gray-900">Add New Product</h2>
                      <p className="text-gray-500 text-sm mt-1">
                        Fill in the details below. All required fields are marked with *
                      </p>
                    </div>
                    <button
                      onClick={() => setFormData(sampleProductData)}
                      className="text-[10px] font-bold text-[#7C3AED] hover:text-[#6D28D9] uppercase tracking-widest"
                    >
                      Load Sample
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <DynamicFormGenerator
                    formConfig={productFormConfig}
                    initialValues={formData}
                    onChange={handleFormChange}
                    onSubmit={handleSubmit}
                    mode="create"
                    categorySpecs={categorySpecs}
                    showLivePreview={true}
                    showValidation={true}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-black text-gray-900">Bulk Product Upload</h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Upload CSV or Excel file with multiple products
                  </p>
                </div>
                
                <div className="p-6">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-[#7C3AED] transition-colors">
                    <div className="w-20 h-20 bg-[#7C3AED]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Upload size={32} className="text-[#7C3AED]" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">
                      Drop your file here
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Supports .csv, .xlsx, .xls files up to 10MB
                    </p>
                    <label className="inline-block px-8 py-3 bg-[#7C3AED] text-white rounded-xl font-bold hover:bg-[#6D28D9] transition-colors cursor-pointer">
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => handleBulkUpload(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-gray-400 mt-4">
                      Download{' '}
                      <a href="#" className="text-[#7C3AED] hover:underline font-bold">
                        template file
                      </a>{' '}
                      for reference
                    </p>
                  </div>

                  {/* Bulk Products List */}
                  {bulkProducts.length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-bold text-gray-900 mb-4">
                        Products to Upload ({bulkProducts.length})
                      </h4>
                      <div className="space-y-3">
                        {bulkProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package size={20} className="text-gray-400" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{product.name}</p>
                                <p className="text-[10px] text-gray-500">SKU: PROD-{product.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {product.errors.length > 0 ? (
                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                  {product.errors.length} errors
                                </span>
                              ) : (
                                <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                  Ready
                                </span>
                              )}
                              <button className="text-[10px] text-[#7C3AED] font-bold">
                                Edit
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex justify-end gap-3">
                        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                          Cancel
                        </button>
                        <button className="px-6 py-3 bg-[#7C3AED] text-white rounded-xl font-bold hover:bg-[#6D28D9] transition-colors">
                          Upload All Products
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Tips & Guidelines */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Quality Guidelines</h4>
                <p className="text-[10px] text-gray-500">Follow best practices</p>
              </div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Use high-resolution images</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Write detailed descriptions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Set competitive prices</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Include all product variants</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Truck size={20} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Shipping Setup</h4>
                <p className="text-[10px] text-gray-500">Configure delivery options</p>
              </div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Set accurate weight & dimensions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Define processing time</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Configure return policy</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Enable cash on delivery</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Globe size={20} className="text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">SEO Optimization</h4>
                <p className="text-[10px] text-gray-500">Improve discoverability</p>
              </div>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Use relevant keywords</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Add product tags</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Optimize meta descriptions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5" />
                <span className="text-sm text-gray-600">Include alt text for images</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCatalogUpload;
