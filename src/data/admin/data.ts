export interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  size: string;
  fragranceFamily: string;
  rating: number;
  reviews: number;
  description: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  inStock: boolean;
  isBestseller: boolean;
  isNew: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  productCount: number;
  image: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image?: string;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: "customer" | "admin";
  orders: number;
  totalSpent: number;
  status: "active" | "inactive" | "blocked";
  createdAt: string;
  lastLogin: string;
}

export interface Notification {
  id: number;
  type: "order" | "user" | "system" | "review";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}

export const categories: Category[] = [
  { id: 1, name: "Men", slug: "men", description: "Luxury fragrances for men", productCount: 3, image: "https://images.unsplash.com/photo-1595444813083-2aa77c829cb7?w=400&h=400&fit=crop", createdAt: "2024-01-15" },
  { id: 2, name: "Women", slug: "women", description: "Elegant fragrances for women", productCount: 3, image: "https://images.unsplash.com/photo-1585232351009-31338186ce39?w=400&h=400&fit=crop", createdAt: "2024-01-15" },
  { id: 3, name: "Unisex", slug: "unisex", description: "Fragrances for everyone", productCount: 2, image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400&h=400&fit=crop", createdAt: "2024-01-15" },
];

export const orders: Order[] = [
  {
    id: "ORD-001",
    customerName: "Sarah Mitchell",
    customerEmail: "sarah@email.com",
    items: [
      { id: 1, name: "Safari Midnight", price: 149, quantity: 1, size: "100ml", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=100&h=100&fit=crop" },
      { id: 2, name: "Safari Rose", price: 129, quantity: 1, size: "50ml", image: "https://images.unsplash.com/photo-1585232351009-31338186ce39?w=100&h=100&fit=crop" },
    ],
    subtotal: 278,
    shipping: 0,
    tax: 22.24,
    total: 300.24,
    status: "processing",
    paymentStatus: "paid",
    shippingAddress: { name: "Sarah Mitchell", address: "123 Main St", city: "New York", state: "NY", zip: "10001", country: "USA" },
    createdAt: "2024-03-15T10:30:00Z",
    updatedAt: "2024-03-15T14:20:00Z",
  },
  {
    id: "ORD-002",
    customerName: "James Chen",
    customerEmail: "james@email.com",
    items: [
      { id: 6, name: "Safari Noir", price: 159, quantity: 2, size: "100ml", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=100&h=100&fit=crop" },
    ],
    subtotal: 318,
    shipping: 15,
    tax: 25.44,
    total: 358.44,
    status: "shipped",
    paymentStatus: "paid",
    shippingAddress: { name: "James Chen", address: "456 Oak Ave", city: "Los Angeles", state: "CA", zip: "90001", country: "USA" },
    createdAt: "2024-03-14T09:15:00Z",
    updatedAt: "2024-03-15T11:00:00Z",
  },
  {
    id: "ORD-003",
    customerName: "Amira Hassan",
    customerEmail: "amira@email.com",
    items: [
      { id: 3, name: "Safari Oud", price: 199, quantity: 1, size: "100ml", image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=100&h=100&fit=crop" },
    ],
    subtotal: 199,
    shipping: 0,
    tax: 15.92,
    total: 214.92,
    status: "delivered",
    paymentStatus: "paid",
    shippingAddress: { name: "Amira Hassan", address: "789 Park Rd", city: "London", state: "", zip: "SW1A 1AA", country: "UK" },
    createdAt: "2024-03-10T16:45:00Z",
    updatedAt: "2024-03-14T09:30:00Z",
  },
  {
    id: "ORD-004",
    customerName: "Michael Brown",
    customerEmail: "michael@email.com",
    items: [
      { id: 4, name: "Safari Citrus", price: 89, quantity: 1, size: "100ml", image: "https://images.unsplash.com/photo-1595444813083-2aa77c829cb7?w=100&h=100&fit=crop" },
      { id: 5, name: "Safari Vanilla", price: 119, quantity: 1, size: "50ml", image: "https://images.unsplash.com/photo-1543863646-3c7bfd28ad9b?w=100&h=100&fit=crop" },
    ],
    subtotal: 208,
    shipping: 15,
    tax: 16.64,
    total: 239.64,
    status: "pending",
    paymentStatus: "pending",
    shippingAddress: { name: "Michael Brown", address: "321 Elm St", city: "Chicago", state: "IL", zip: "60601", country: "USA" },
    createdAt: "2024-03-16T08:00:00Z",
    updatedAt: "2024-03-16T08:00:00Z",
  },
  {
    id: "ORD-005",
    customerName: "Emma Wilson",
    customerEmail: "emma@email.com",
    items: [
      { id: 7, name: "Safari Bloom", price: 109, quantity: 1, size: "50ml", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=100&h=100&fit=crop" },
    ],
    subtotal: 109,
    shipping: 0,
    tax: 8.72,
    total: 117.72,
    status: "cancelled",
    paymentStatus: "refunded",
    shippingAddress: { name: "Emma Wilson", address: "555 Pine Rd", city: "Seattle", state: "WA", zip: "98101", country: "USA" },
    createdAt: "2024-03-12T12:30:00Z",
    updatedAt: "2024-03-13T10:15:00Z",
  },
];

export const users: User[] = [
  { id: 1, name: "Sarah Mitchell", email: "sarah@email.com", phone: "+1 555-0101", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", role: "customer", orders: 5, totalSpent: 892, status: "active", createdAt: "2023-06-15", lastLogin: "2024-03-15" },
  { id: 2, name: "James Chen", email: "james@email.com", phone: "+1 555-0102", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", role: "customer", orders: 3, totalSpent: 654, status: "active", createdAt: "2023-08-20", lastLogin: "2024-03-14" },
  { id: 3, name: "Amira Hassan", email: "amira@email.com", phone: "+44 20 7123 4567", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", role: "customer", orders: 8, totalSpent: 1456, status: "active", createdAt: "2023-03-10", lastLogin: "2024-03-14" },
  { id: 4, name: "Michael Brown", email: "michael@email.com", phone: "+1 555-0104", role: "customer", orders: 1, totalSpent: 240, status: "active", createdAt: "2024-02-28", lastLogin: "2024-03-16" },
  { id: 5, name: "Emma Wilson", email: "emma@email.com", phone: "+1 555-0105", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", role: "customer", orders: 2, totalSpent: 380, status: "inactive", createdAt: "2023-11-05", lastLogin: "2024-03-12" },
  { id: 6, name: "Admin User", email: "admin@safari.com", phone: "+1 555-0100", role: "admin", orders: 0, totalSpent: 0, status: "active", createdAt: "2023-01-01", lastLogin: "2024-03-16" },
];

export const notifications: Notification[] = [
  { id: 1, type: "order", title: "New Order", message: "Sarah Mitchell placed a new order (ORD-001)", read: false, createdAt: "2024-03-15T10:30:00Z" },
  { id: 2, type: "order", title: "Order Shipped", message: "Order ORD-002 has been shipped", read: false, createdAt: "2024-03-15T11:00:00Z" },
  { id: 3, type: "review", title: "New Review", message: "New 5-star review on Safari Midnight", read: false, createdAt: "2024-03-14T15:20:00Z" },
  { id: 4, type: "user", title: "New Customer", message: "Michael Brown has registered as a new customer", read: true, createdAt: "2024-03-16T08:00:00Z" },
  { id: 5, type: "system", title: "Low Stock Alert", message: "Safari Citrus is running low on stock", read: true, createdAt: "2024-03-13T09:00:00Z" },
];

export const dashboardStats: DashboardStats = {
  totalRevenue: 15847,
  totalOrders: 156,
  totalCustomers: 89,
  totalProducts: 8,
  revenueChange: 12.5,
  ordersChange: 8.2,
  customersChange: 15.3,
  productsChange: 0,
};

export const recentActivity = [
  { id: 1, action: "New order placed", details: "ORD-001 by Sarah Mitchell", time: "2 hours ago" },
  { id: 2, action: "Order shipped", details: "ORD-002 by James Chen", time: "5 hours ago" },
  { id: 3, action: "New customer registered", details: "Michael Brown", time: "8 hours ago" },
  { id: 4, action: "New review received", details: "5-star review on Safari Midnight", time: "1 day ago" },
  { id: 5, action: "Order delivered", details: "ORD-003 to Amira Hassan", time: "2 days ago" },
];