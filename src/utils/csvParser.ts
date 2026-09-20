import { Transaction, ReceiptData, CategoryBudget } from '../types';

/**
 * RFC 4180 compliant CSV parser that handles quoted strings with commas and escaped quotes.
 */
export function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      row.push(cell.trim());
      cell = '';
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        lines.push(row);
      }
      row = [];
    } else {
      cell += char;
    }
  }

  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Parses dates in various formats into standard ISO YYYY-MM-DD.
 * Formats in CSV: "20/09/2018 12:04:08", "19/09/2018", "12/9/2018", "1/1/2015"
 */
export function parseDateToISO(raw: string): string {
  if (!raw) return '2018-01-01';
  const clean = raw.trim().split(' ')[0];
  let parts: string[];

  if (clean.includes('/')) {
    parts = clean.split('/');
  } else if (clean.includes('-')) {
    parts = clean.split('-');
  } else {
    return '2018-01-01';
  }

  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    let year = parts[2];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }
  return '2018-01-01';
}

/**
 * Creates clean, readable merchant and payee names from CSV attributes
 */
export function formatMerchantName(subcat?: string, note?: string, cat?: string): string {
  if (subcat && subcat.trim()) {
    const s = subcat.trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  if (note && note.trim()) {
    const n = note.trim();
    if (n.length <= 36) return n;
    return n.slice(0, 36) + '...';
  }
  return cat ? cat.trim() : 'General';
}

/**
 * Converts raw CSV rows into strongly typed Transaction objects
 */
export function convertCsvRowsToTransactions(rows: string[][]): Transaction[] {
  const transactions: Transaction[] = [];
  if (!rows || rows.length < 2) return transactions;

  // Header: Date, Mode, Category, Subcategory, Note, Amount, Income/Expense, Currency
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 7) continue;

    const [rawDate, mode, cat, subcat, note, amountStr, typeStr, currencyStr] = row;
    const amount = parseFloat(amountStr) || 0;
    const isoDate = parseDateToISO(rawDate);
    const categoryName = cat ? cat.trim() : 'Other';
    const subcategoryName = subcat ? subcat.trim() : undefined;
    const noteText = note ? note.trim() : undefined;
    const paymentMethod = mode ? mode.trim() : 'Cash';
    const currency = currencyStr ? currencyStr.trim() : 'INR';

    let type: 'expense' | 'income' | 'transfer' = 'expense';
    if (typeStr === 'Income') {
      type = 'income';
    } else if (typeStr === 'Transfer-Out') {
      type = 'transfer';
    }

    const merchant = formatMerchantName(subcategoryName, noteText, categoryName);

    const isSubscription =
      categoryName.toLowerCase() === 'subscription' ||
      Boolean(subcategoryName && subcategoryName.toLowerCase().includes('subscription')) ||
      Boolean(noteText && noteText.toLowerCase().includes('subscription')) ||
      ['netflix', 'tata sky', 'mobile service provider', 'hbr'].includes(
        (subcategoryName || '').toLowerCase()
      );

    const tags: string[] = [];
    if (categoryName) tags.push(categoryName.toLowerCase().replace(/\s+/g, '-'));
    if (subcategoryName) tags.push(subcategoryName.toLowerCase().replace(/\s+/g, '-'));
    if (paymentMethod) tags.push(paymentMethod.toLowerCase().replace(/\s+/g, '-'));

    const tx: Transaction = {
      id: `tx-csv-${i}`,
      date: isoDate,
      rawDate: rawDate.trim(),
      merchant,
      amount,
      type,
      category: categoryName,
      subcategory: subcategoryName,
      paymentMethod,
      status: 'cleared',
      notes: noteText,
      isSubscription,
      tags,
      currency: 'INR',
    };

    // Construct verified digital receipt details
    if (noteText || subcategoryName || amount > 0) {
      const receiptItemName = noteText || subcategoryName || categoryName;
      tx.receipt = {
        id: `rcpt-csv-${i}`,
        merchantName: merchant,
        date: isoDate,
        subtotal: amount,
        taxAmount: 0,
        totalAmount: amount,
        paymentMethod,
        confidenceScore: 0.98,
        notes: noteText,
        items: [
          {
            id: `item-${i}-1`,
            name: receiptItemName,
            price: amount,
            quantity: 1,
            category: categoryName,
          },
        ],
      };
    }

    transactions.push(tx);
  }

  return transactions;
}

/**
 * Formats currency values with Indian Rupee (₹) or given currency symbol
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const symbol = currency === 'INR' ? '₹' : '$';
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Compact currency formatter for charts and badges (e.g. ₹1.2k, ₹4.5L)
 */
export function formatCompactCurrency(amount: number, currency: string = 'INR'): string {
  const symbol = currency === 'INR' ? '₹' : '$';
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    return `${symbol}${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${symbol}${(amount / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}k`;
  }
  return `${symbol}${amount.toFixed(0)}`;
}

/**
 * Fetches and parses the CSV directly from the public assets directory
 */
export async function fetchTransactionsFromCsv(): Promise<Transaction[]> {
  try {
    const urls = [
      `${import.meta.env.BASE_URL || '/'}data/Daily Household Transactions.csv`,
      '/data/Daily Household Transactions.csv',
      './data/Daily Household Transactions.csv',
      'data/Daily Household Transactions.csv',
    ];

    let csvText = '';
    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          csvText = await response.text();
          if (csvText && csvText.includes('Income/Expense')) {
            break;
          }
        }
      } catch {
        // try next fallback url
      }
    }

    if (csvText) {
      const rows = parseCSV(csvText);
      const parsedTransactions = convertCsvRowsToTransactions(rows);
      if (parsedTransactions.length > 0) {
        return parsedTransactions;
      }
    }
  } catch (err) {
    console.error('Failed to fetch CSV from public folder:', err);
  }
  return [];
}
