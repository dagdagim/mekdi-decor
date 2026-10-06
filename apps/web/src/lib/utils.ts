import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EventStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'ETB'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${currency} ${formatted}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getStatusStepIndex(status: EventStatus): number {
  const steps: EventStatus[] = [
    'REQUESTED',
    'CONSULTATION',
    'QUOTE_SENT',
    'QUOTE_ACCEPTED',
    'DEPOSIT_PENDING',
    'CONFIRMED',
    'DESIGN_PHASE',
    'PREPARATION',
    'EVENT_DAY',
    'COMPLETED',
  ];
  const idx = steps.indexOf(status);
  return idx >= 0 ? idx : 0;
}
