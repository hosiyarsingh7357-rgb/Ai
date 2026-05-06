import { IBrokerParser, RawTrade } from './parser.interface'
import Papa from 'papaparse'

export class SchwabParser implements IBrokerParser {
  name = 'schwab'

  async parse(csvContent: string): Promise<RawTrade[]> {
    const results = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    })

    const trades: RawTrade[] = []

    // Schwab Export columns: Date, Action, Symbol, Description, Quantity, Price, Fees & Comm, Amount
    for (const row of results.data as any[]) {
      const symbol = row['Symbol']
      const action = row['Action'] || ''
      const quantity = Math.abs(parseFloat(row['Quantity'] || '0'))
      const price = parseFloat(row['Price'] || '0')
      const dateStr = row['Date']
      const commission = parseFloat(row['Fees & Comm'] || '0')

      if (!symbol || !action || isNaN(quantity) || isNaN(price)) continue

      // Filter for trade actions
      const direction = action.toLowerCase().includes('buy') ? 'long' : 
                        action.toLowerCase().includes('sell') ? 'short' : null
      
      if (!direction) continue

      const entryDate = new Date(dateStr)

      trades.push({
        symbol,
        assetClass: 'stocks',
        direction: direction as 'long' | 'short',
        entryDate,
        entryPrice: price,
        quantity,
        commission,
        externalId: `schwab-${symbol}-${dateStr}-${quantity}`,
      })
    }

    return trades
  }
}
