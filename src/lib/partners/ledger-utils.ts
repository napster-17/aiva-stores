// src/lib/partners/ledger-utils.ts

export type LedgerEntry = {
  id: string;
  type: 'CREDIT' | 'DEBIT' | 'PENALTY';
  amount: number;
  note: string | null;
  order_id: string | null;
  created_at: string;
  mode: string | null;
  removed_by_admin: boolean;
  platform_fee?: number;
  gst?: number;
  tcs?: number;
  razorpay_fee?: number;
  customer_platform_fee?: number;
  customer_convenience_fee?: number;
  orders?: {
    total_amount: number;
    payment_method: string;
    status: string;
  };
};

export const calculateLedgerStats = (entries: LedgerEntry[]) => {
  let creditSum = 0;
  let debitSum = 0;
  let totalSalesValue = 0;

  entries.forEach((entry) => {
    if (entry.removed_by_admin) return;

    // Balance Logic
    if (entry.type === 'CREDIT') {
      creditSum += entry.amount;
    } else {
      debitSum += entry.amount;
    }

    // Sales Value Logic (Replicating Mobile Logic)
    if (
      entry.order_id &&
      entry.orders &&
      entry.orders.status !== 'rejected' &&
      entry.orders.status !== 'cancelled' &&
      entry.type !== 'PENALTY' &&
      !(entry.type === 'DEBIT' && entry.note?.includes('Refund payout'))
    ) {
      totalSalesValue += entry.orders.total_amount;
    }
  });

  return {
    creditSum,
    debitSum,
    availableBalance: creditSum - debitSum,
    totalSalesValue,
  };
};