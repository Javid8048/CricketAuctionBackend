/**
 * Currency utilities for Indian Rupees
 * Scaled for tournament auctions (Base ₹100, Purse ₹15,000, Icon ₹2,500)
 */

export function formatRupees(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatShortRupees(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function getMinBidIncrement(currentBid: number): number {
  if (currentBid < 500) {
    return 100;
  } else if (currentBid < 2000) {
    return 200;
  } else {
    return 500;
  }
}
