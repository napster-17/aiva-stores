// src/lib/icons.tsx

import {
  LineChart,
  ShoppingCart,
  DollarSign,
  User,
  Store,
  Wallet,
  XCircle,
  PackageX,
  RefreshCcw,
  BadgeAlert,
  Calendar, 
  Repeat,
  Zap,
  Tag,
  Percent, 
} from 'lucide-react';

export const Icons = {
  sales: LineChart,
  onlineOrders: ShoppingCart,
  walkinOrders: DollarSign,
  customers: User,
  stores: Store,
  settlements: Wallet,
  withdrawals: DollarSign,
  due: BadgeAlert,
  failedDeliveries: PackageX,
  returns: RefreshCcw,
  cancellations: XCircle,
  // Fee Structure Icons
  platform_fee_fixed: Tag,
  convenience_fee_percent: Percent,
  tcs_percent: Percent,
  gst_percent: Percent,
  razorpay_fee_percent: DollarSign,
  effective_from: Calendar,
  apply_now: Zap,
  notes: Repeat,
  // Note: We use the imported Calendar, Repeat, and DollarSign directly in WalkinSubscriptionMetrics,
  // so no need to add them here, but keeping this file consistent is good practice.
};