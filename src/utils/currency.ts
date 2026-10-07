/**
 * Currency utilities for Indian Rupees (Lakhs & Crores)
 * 1 Lakh = 100,000
 * 1 Crore = 10,000,000 (100 Lakhs)
 */

export const LAKH = 100000;
export const CRORE = 10000000;

export function formatRupees(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  if (amount >= CRORE) {
    const cr = amount / CRORE;
    // If it's a whole number or clean decimal
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2);
    return `₹${formatted} Cr`;
  } else if (amount >= LAKH) {
    const lakh = amount / LAKH;
    const formatted = lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1);
    return `₹${formatted} Lakh`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

export function getMinBidIncrement(currentBid: number): number {
  if (currentBid < 1 * CRORE) {
    return 10 * LAKH; // 10 Lakhs
  } else if (currentBid < 5 * CRORE) {
    return 20 * LAKH; // 20 Lakhs
  } else {
    return 25 * LAKH; // 25 Lakhs
  }
}
