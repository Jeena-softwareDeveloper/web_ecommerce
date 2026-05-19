# Supplier Design System

A consistent design system for Jeenora supplier screens, based on the SupplierPayments design patterns.

## Components

### 1. StatsCard
A card component for displaying statistics with icons, values, and optional trends.

**Props:**
- `title` (string): Card title
- `value` (string): Main value to display
- `icon` (ReactElement): Icon component from lucide-react
- `iconColor` (string): Tailwind color class for icon (default: 'text-primary')
- `bgColor` (string): Background color class (default: 'bg-white')
- `borderColor` (string): Border color class (default: 'border-gray-100')
- `textColor` (string): Text color class (default: 'text-gray-900')
- `subtitle` (string): Optional subtitle text
- `trend` (string): Optional trend indicator (e.g., '+12%')
- `trendColor` (string): Trend text color (default: 'text-green-500')
- `className` (string): Additional CSS classes
- `onClick` (function): Optional click handler

**Usage:**
```jsx
<StatsCard
  title="Total Sales"
  value="₹12,450"
  icon={DollarSign}
  iconColor="text-green-500"
  trend="+12%"
/>
```

### 2. GradientCard
A gradient background card with prominent call-to-action.

**Props:**
- `title` (string): Card title
- `value` (string): Main value/heading
- `subtitle` (object): { label: string, value: string }
- `icon` (ReactElement): Icon component
- `buttonText` (string): Button text
- `onButtonClick` (function): Button click handler
- `gradientFrom` (string): Gradient start color (default: 'from-[#7C3AED]')
- `gradientTo` (string): Gradient end color (default: 'to-[#5B21B6]')
- `buttonColor` (string): Button background (default: 'bg-white')
- `buttonTextColor` (string): Button text color (default: 'text-[#7C3AED]')
- `className` (string): Additional CSS classes

**Usage:**
```jsx
<GradientCard
  title="Upload Your Catalog"
  value="Start Selling"
  subtitle={{
    label: "Add products to start selling",
    value: "On Jeenora"
  }}
  icon={Upload}
  buttonText="Upload Now"
  onButtonClick={() => navigate('/supplier-inventory')}
/>
```

### 3. StatusBadge
A consistent status indicator badge with predefined colors.

**Props:**
- `status` (string): Status type (active, pending, completed, failed, processing, inactive, draft, shipped, delivered, cancelled, returned, refunded)
- `customConfig` (object): Custom color/label configuration
- `size` (string): Size variant (sm, md, lg) (default: 'sm')
- `className` (string): Additional CSS classes

**Usage:**
```jsx
<StatusBadge status="active" />
<StatusBadge status="pending" size="md" />
<StatusBadge status="completed" size="lg" />
```

### 4. ActionGrid
A grid of quick action buttons with icons.

**Props:**
- `actions` (array): Array of action objects
  - `icon` (ReactElement): Icon component
  - `label` (string): Action label
  - `subtitle` (string): Optional subtitle
  - `onClick` (function): Click handler
- `columns` (number): Number of columns (2, 3, 4) (default: 2)
- `className` (string): Additional CSS classes

**Usage:**
```jsx
<ActionGrid
  actions={[
    {
      icon: <Headphones />,
      label: "Live Training",
      subtitle: "Expert led sessions",
      onClick: () => {}
    },
    // ... more actions
  ]}
/>
```

### 5. DataCard
A container card for displaying lists of data with optional empty states.

**Props:**
- `title` (string): Card title
- `viewAllText` (string): "View All" button text (default: 'View All')
- `onViewAll` (function): View all click handler
- `children` (ReactNode): Content to display
- `emptyIcon` (ReactElement): Icon for empty state
- `emptyText` (string): Empty state message (default: 'No data found')
- `emptyActionText` (string): Empty state action button text
- `onEmptyAction` (function): Empty state action handler
- `className` (string): Additional CSS classes

**Usage:**
```jsx
<DataCard
  title="Recent Orders"
  viewAllText="View All"
  onViewAll={() => navigate('/orders')}
>
  {/* Content here */}
</DataCard>

<DataCard
  title="Products"
  emptyIcon={Package}
  emptyText="No products found"
  emptyActionText="Add Product"
  onEmptyAction={() => navigate('/catalog-upload')}
/>
```

## Installation

All components are exported from the index file:

```jsx
import { 
  StatsCard, 
  GradientCard, 
  StatusBadge,
  ActionGrid,
  DataCard 
} from '../../components/supplier';
```

## Design Patterns

### Color Scheme
- Primary: `#7C3AED` (purple)
- Success: `#10B981` (green)
- Warning: `#F59E0B` (amber)
- Error: `#EF4444` (red)
- Info: `#3B82F6` (blue)

### Spacing
- Small: `0.25rem` (4px)
- Medium: `0.5rem` (8px)
- Large: `1rem` (16px)
- X-Large: `1.5rem` (24px)

### Typography
- Headers: `font-black` with appropriate sizes
- Body: `font-bold` for important text, regular for descriptions
- Labels: `text-xs` or `text-sm` with `font-bold`

## Usage Examples

See `test_components.jsx` for comprehensive examples of all components.

## Integration with Existing Screens

The design system has been integrated into:
- `SupplierDashboard.jsx` - Updated with StatsCard, GradientCard, ActionGrid, DataCard
- `SupplierPricing.jsx` - Updated with StatsCard, StatusBadge, DataCard

## Benefits

1. **Consistency**: All supplier screens now follow the same design patterns
2. **Maintainability**: Changes to design system automatically apply to all screens
3. **Developer Experience**: Simple, reusable components with clear props
4. **Accessibility**: Built with accessibility best practices
5. **Responsive**: Mobile-first design with responsive breakpoints