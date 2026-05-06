import { IBrokerParser, RawTrade } from './parser.interface'
import Papa from 'papaparse'

export class WebullParser implements IBrokerParser {
  name = 'webull'

  async parse(csvContent: string): Promise<RawTrade[]> {
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    })

    const trades: RawTrade[] = []

    // Note: Webull CSVs can vary, this targets the standard "Orders" or "Activity" export
    // Mapping: Symbol, Side, Filled Qty, Avg Price, Filled Time, Total Amount
    for (const row of results.data as any[]) {
      const symbol = row['Symbol'] || row['Ticker']
      const side = row['Side'] || row['Action']
      const quantity = Math.abs(parseFloat(row['Filled Qty'] || row['Quantity'] || '0'))
      const price = parseFloat(row['Avg Price'] || row['Price'] || '0')
      const dateStr = row['Filled Time'] || row['Date'] || row['Time']
      const commission = parseFloat(row['Commission'] || row['Fees'] || '0')

      if (!symbol || !side || isNaN(quantity) || isNaN(price)) continue

      const direction = side.toLowerCase().includes('buy') ? 'long' : 'short'
      const entryDate = new Date(dateStr)

      // Webull often lists individual orders. 
      // For a simple import, we treat each row as a completed or partial trade.
      // In a real scenario, we'd need to group them (Executions -> Trades).
      // Here we map 1:1 for the MVP import engine.
      
      trades.push({
        symbol,
        assetClass: 'stocks', // Webull is primarily stocks/options
        direction: direction as 'long' | 'short',
        entryDate,
        entryPrice: price,
        quantity,
        commission,
        externalId: `${symbol}-${dateStr}-${quantity}`, // Simple unique ID
      })
    }

    return trades
  }
}
