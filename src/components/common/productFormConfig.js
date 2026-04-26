import { 
  Package, DollarSign, Tag, Image as ImageIcon, 
  Ruler, Weight, Hash, Grid, List, Type, 
  Star, TrendingUp, Shield, Truck, Clock,
  Layers, Palette, Users, MapPin, Globe
} from 'lucide-react';

export const productFormConfig = [
  // Basic Information Section
  {
    id: 'productName',
    type: 'text',
    label: 'Product Name',
    placeholder: 'Enter product name (e.g., Cotton Kurta Set)',
    section: 'Basic Information',
    required: true,
    validation: {
      required: true,
      minLength: 3,
      maxLength: 200
    },
    aiSuggestions: true,
    icon: <Package />
  },
  {
    id: 'description',
    type: 'textarea',
    label: 'Description',
    placeholder: 'Describe your product in detail...',
    section: 'Basic Information',
    required: true,
    rows: 4,
    validation: {
      required: true,
      minLength: 50,
      maxLength: 2000
    },
    aiSuggestions: true,
    showCount: true,
    maxCount: 2000,
    icon: <Type />
  },
  {
    id: 'shortDescription',
    type: 'textarea',
    label: 'Short Description',
    placeholder: 'Brief summary (appears in product listings)',
    section: 'Basic Information',
    rows: 2,
    validation: {
      maxLength: 200
    },
    showCount: true,
    maxCount: 200,
    icon: <List />
  },

  // Pricing & Inventory Section
  {
    id: 'price',
    type: 'number',
    label: 'Selling Price (₹)',
    placeholder: '0',
    section: 'Pricing & Inventory',
    required: true,
    validation: {
      required: true,
      min: 1,
      max: 1000000
    },
    prefix: '₹',
    icon: <DollarSign />
  },
  {
    id: 'originalPrice',
    type: 'number',
    label: 'Original Price (₹)',
    placeholder: '0',
    section: 'Pricing & Inventory',
    validation: {
      min: 1,
      max: 1000000
    },
    prefix: '₹',
    helpText: 'Leave empty if no discount'
  },
  {
    id: 'stockQuantity',
    type: 'number',
    label: 'Stock Quantity',
    placeholder: '0',
    section: 'Pricing & Inventory',
    required: true,
    validation: {
      required: true,
      min: 0,
      max: 100000
    },
    icon: <Hash />
  },
  {
    id: 'sku',
    type: 'text',
    label: 'SKU (Stock Keeping Unit)',
    placeholder: 'PROD-001',
    section: 'Pricing & Inventory',
    validation: {
      pattern: '^[A-Za-z0-9-]+$'
    },
    helpText: 'Unique product identifier',
    icon: <Grid />
  },

  // Category & Classification
  {
    id: 'category',
    type: 'select',
    label: 'Main Category',
    placeholder: 'Select category',
    section: 'Category & Classification',
    required: true,
    options: [
      { label: 'Men\'s Clothing', value: 'mens-clothing' },
      { label: 'Women\'s Clothing', value: 'womens-clothing' },
      { label: 'Kids Wear', value: 'kids-wear' },
      { label: 'Ethnic Wear', value: 'ethnic-wear' },
      { label: 'Western Wear', value: 'western-wear' },
      { label: 'Accessories', value: 'accessories' },
      { label: 'Footwear', value: 'footwear' }
    ],
    icon: <Layers />
  },
  {
    id: 'subCategory',
    type: 'select',
    label: 'Sub Category',
    placeholder: 'Select sub-category',
    section: 'Category & Classification',
    options: [
      { label: 'T-Shirts', value: 't-shirts' },
      { label: 'Shirts', value: 'shirts' },
      { label: 'Jeans', value: 'jeans' },
      { label: 'Kurtas', value: 'kurtas' },
      { label: 'Sarees', value: 'sarees' },
      { label: 'Dresses', value: 'dresses' },
      { label: 'Jackets', value: 'jackets' }
    ]
  },
  {
    id: 'gender',
    type: 'radio',
    label: 'Gender',
    section: 'Category & Classification',
    options: [
      { label: 'Men', value: 'men' },
      { label: 'Women', value: 'women' },
      { label: 'Unisex', value: 'unisex' },
      { label: 'Kids', value: 'kids' }
    ],
    icon: <Users />
  },

  // Product Attributes
  {
    id: 'size',
    type: 'multiselect',
    label: 'Available Sizes',
    section: 'Product Attributes',
    options: [
      'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
      '28', '30', '32', '34', '36', '38', '40',
      'Free Size', 'One Size'
    ],
    icon: <Ruler />
  },
  {
    id: 'color',
    type: 'color',
    label: 'Available Colors',
    section: 'Product Attributes',
    options: [
      { name: 'Red', hex: '#D80032' },
      { name: 'Blue', hex: '#1E40AF' },
      { name: 'Green', hex: '#059669' },
      { name: 'Yellow', hex: '#F59E0B' },
      { name: 'Black', hex: '#000000' },
      { name: 'White', hex: '#FFFFFF', border: true },
      { name: 'Gray', hex: '#6B7280' },
      { name: 'Pink', hex: '#EC4899' },
      { name: 'Purple', hex: '#7C3AED' },
      { name: 'Brown', hex: '#92400E' }
    ],
    icon: <Palette />
  },
  {
    id: 'material',
    type: 'multiselect',
    label: 'Material',
    section: 'Product Attributes',
    options: [
      'Cotton', 'Polyester', 'Silk', 'Wool', 'Linen',
      'Denim', 'Leather', 'Nylon', 'Rayon', 'Spandex',
      'Velvet', 'Chiffon', 'Georgette', 'Crepe'
    ]
  },

  // Images & Media
  {
    id: 'images',
    type: 'image',
    label: 'Product Images',
    section: 'Images & Media',
    required: true,
    maxImages: 12,
    helpText: 'Upload high-quality images (max 12)',
    icon: <ImageIcon />
  },
  {
    id: 'videoUrl',
    type: 'text',
    label: 'Video URL (Optional)',
    placeholder: 'https://youtube.com/watch?v=...',
    section: 'Images & Media',
    validation: {
      pattern: '^(https?://)?(www\\.)?(youtube\\.com|youtu\\.be)/.+$'
    },
    helpText: 'YouTube video URL for product demonstration'
  },

  // Shipping & Logistics
  {
    id: 'weight',
    type: 'number',
    label: 'Weight (grams)',
    placeholder: '0',
    section: 'Shipping & Logistics',
    validation: {
      min: 1,
      max: 50000
    },
    suffix: 'g',
    icon: <Weight />
  },
  {
    id: 'dimensions',
    type: 'text',
    label: 'Dimensions (L×W×H)',
    placeholder: '30×20×5',
    section: 'Shipping & Logistics',
    helpText: 'In centimeters (e.g., 30×20×5)'
  },
  {
    id: 'shippingType',
    type: 'select',
    label: 'Shipping Type',
    section: 'Shipping & Logistics',
    options: [
      { label: 'Standard Shipping', value: 'standard' },
      { label: 'Express Shipping', value: 'express' },
      { label: 'Free Shipping', value: 'free' },
      { label: 'Local Pickup', value: 'pickup' }
    ],
    icon: <Truck />
  },
  {
    id: 'processingTime',
    type: 'number',
    label: 'Processing Time (days)',
    placeholder: '1',
    section: 'Shipping & Logistics',
    validation: {
      min: 0,
      max: 30
    },
    suffix: 'days',
    icon: <Clock />
  },

  // SEO & Marketing
  {
    id: 'metaTitle',
    type: 'text',
    label: 'SEO Title',
    placeholder: 'Optimized title for search engines',
    section: 'SEO & Marketing',
    validation: {
      maxLength: 60
    },
    showCount: true,
    maxCount: 60,
    helpText: 'Max 60 characters for SEO'
  },
  {
    id: 'metaDescription',
    type: 'textarea',
    label: 'SEO Description',
    placeholder: 'Optimized description for search engines',
    section: 'SEO & Marketing',
    rows: 2,
    validation: {
      maxLength: 160
    },
    showCount: true,
    maxCount: 160,
    helpText: 'Max 160 characters for SEO'
  },
  {
    id: 'tags',
    type: 'multiselect',
    label: 'Product Tags',
    section: 'SEO & Marketing',
    options: [
      'trending', 'new arrival', 'best seller', 'discount',
      'premium', 'handmade', 'sustainable', 'organic',
      'festive', 'wedding', 'casual', 'formal', 'party',
      'summer', 'winter', 'monsoon', 'limited edition'
    ],
    aiSuggestions: true,
    icon: <Tag />
  },

  // Advanced Settings
  {
    id: 'isFeatured',
    type: 'checkbox',
    label: 'Featured Product',
    section: 'Advanced Settings',
    helpText: 'Show this product in featured section'
  },
  {
    id: 'isActive',
    type: 'checkbox',
    label: 'Active Product',
    section: 'Advanced Settings',
    defaultValue: true,
    helpText: 'Product will be visible to customers'
  },
  {
    id: 'returnPolicy',
    type: 'select',
    label: 'Return Policy',
    section: 'Advanced Settings',
    options: [
      { label: '7 Days Return', value: '7-days' },
      { label: '14 Days Return', value: '14-days' },
      { label: '30 Days Return', value: '30-days' },
      { label: 'No Return', value: 'no-return' }
    ],
    icon: <Shield />
  },
  {
    id: 'warranty',
    type: 'text',
    label: 'Warranty',
    placeholder: 'e.g., 6 months manufacturer warranty',
    section: 'Advanced Settings',
    helpText: 'Product warranty details'
  }
];

// Sample category-specific specifications
export const clothingSpecs = [
  {
    name: 'Fabric',
    type: 'select',
    required: true,
    options: ['Cotton', 'Polyester', 'Silk', 'Linen', 'Wool', 'Denim']
  },
  {
    name: 'Pattern',
    type: 'select',
    required: false,
    options: ['Solid', 'Printed', 'Striped', 'Checked', 'Floral', 'Geometric']
  },
  {
    name: 'Sleeve Length',
    type: 'select',
    required: false,
    options: ['Full Sleeve', 'Half Sleeve', 'Sleeveless', 'Three-Quarter']
  },
  {
    name: 'Neck Type',
    type: 'select',
    required: false,
    options: ['Round Neck', 'V-Neck', 'Collar', 'Polo', 'Hooded']
  },
  {
    name: 'Fit',
    type: 'select',
    required: false,
    options: ['Regular', 'Slim', 'Oversized', 'Relaxed', 'Tailored']
  }
];

export const footwearSpecs = [
  {
    name: 'Sole Material',
    type: 'select',
    required: true,
    options: ['Rubber', 'Leather', 'EVA', 'PU', 'TPR']
  },
  {
    name: 'Closure Type',
    type: 'select',
    required: true,
    options: ['Lace-up', 'Slip-on', 'Strap', 'Velcro', 'Zipper']
  },
  {
    name: 'Heel Height',
    type: 'number',
    required: false,
    suffix: 'cm'
  },
  {
    name: 'Water Resistance',
    type: 'checkbox',
    required: false
  }
];

// Helper function to get specs by category
export const getCategorySpecs = (category) => {
  switch (category) {
    case 'mens-clothing':
    case 'womens-clothing':
    case 'ethnic-wear':
      return clothingSpecs;
    case 'footwear':
      return footwearSpecs;
    default:
      return [];
  }
};

// Sample initial values for edit mode
export const sampleProductData = {
  productName: 'Premium Cotton Kurta Set',
  description: 'Made from 100% premium cotton with intricate embroidery work. Perfect for festive occasions and weddings. Comfortable and breathable fabric suitable for all-day wear.',
  shortDescription: 'Elegant cotton kurta set with embroidery',
  price: 1299,
  originalPrice: 1999,
  stockQuantity: 50,
  sku: 'KURTA-001',
  category: 'ethnic-wear',
  subCategory: 'kurtas',
  gender: 'men',
  size: 'M,L,XL',
  color: 'Blue,White',
  material: 'Cotton',
  weight: 500,
  dimensions: '30×25×5',
  shippingType: 'standard',
  processingTime: 2,
  metaTitle: 'Premium Cotton Kurta Set for Men | Ethnic Wear',
  metaDescription: 'Buy premium quality cotton kurta set with embroidery. Perfect for weddings and festive occasions. Available in multiple sizes and colors.',
  tags: 'ethnic wear,traditional,festive,wedding',
  isFeatured: true,
  isActive: true,
  returnPolicy: '7-days',
  warranty: '6 months manufacturer warranty'
};
