import { RawTrade } from './parsers/parser.interface';
import { TradeDirection } from '@prisma/client';

/**
 * Groups raw executions into unified trades based on Symbol and Asset Class.
 * Uses a basic inventory matching (FIFO-ish) to determine when a position is closed.
 */
export function groupExecutionsIntoTrades(executions: RawTrade[]): RawTrade[] {
  // Sort by date ascending to process in order
  const sorted = [...executions].sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime());

  const completedTrades: RawTrade[] = [];
  // Key: Symbol-AssetClass
  const openPositions: Record<string, { qty: number; direction: TradeDirection; legs: RawTrade[] }> = {};

  for (const exec of sorted) {
    const key = `${exec.symbol}-${exec.assetClass}`;
    const current = openPositions[key];

    // If no open position for this symbol, start one
    if (!current || current.qty === 0) {
      openPositions[key] = {
        qty: exec.quantity,
        direction: exec.direction,
        legs: [exec],
      };
      continue;
    }

    // Checking if this execution adds to or reduces the current position
    const isSameDirection = current.direction === exec.direction;

    if (isSameDirection) {
      // Adding to position (Scale in)
      current.qty += exec.quantity;
      current.legs.push(exec);
    } else {
      // Reducing position (Scale out or close)
      const closingQty = Math.min(current.qty, exec.quantity);
      
      // We always track all legs participating in this logical trade
      current.legs.push(exec);
      current.qty -= closingQty;

      // If position is now flat (fully closed)
      if (current.qty === 0) {
        completedTrades.push(calculateTradeFromLegs(current.legs));
        delete openPositions[key];
      }
      
      // If the closing execution was larger than the current position (Reversal)
      if (exec.quantity > closingQty) {
        const excessQty = exec.quantity - closingQty;
        openPositions[key] = {
          qty: excessQty,
          direction: exec.direction,
          legs: [{ ...exec, quantity: excessQty }] // Start new position with remaining qty
        };
      }
    }
  }

  // Any remaining open positions should be recorded as "OPEN" trades
  for (const key in openPositions) {
    const pos = openPositions[key];
    if (pos && pos.qty > 0) {
      completedTrades.push(calculateTradeFromLegs(pos.legs));
    }
  }

  return completedTrades;
}

/**
 * Aggregates multiple execution legs into a single RawTrade object.
 */
function calculateTradeFromLegs(legs: RawTrade[]): RawTrade {
  if (legs.length === 0) throw new Error("No legs provided to calculateTradeFromLegs");
  const first = legs[0]!;
  const direction = first.direction;
  
  let totalEntryQty = 0;
  let totalExitQty = 0;
  let weightedEntrySum = 0;
  let weightedExitSum = 0;
  let totalCommission = 0;
  let exitDate: Date | undefined;

  for (const leg of legs) {
    totalCommission += leg.commission || 0;
    
    // If it's in the same direction as the opening, it's an entry/add
    if (leg.direction === direction) {
      weightedEntrySum += leg.entryPrice * leg.quantity;
      totalEntryQty += leg.quantity;
    } else {
      // It's a reduction/exit
      weightedExitSum += leg.entryPrice * leg.quantity;
      totalExitQty += leg.quantity;
      
      // The latest exit leg defines the exit date
      if (!exitDate || leg.entryDate > exitDate) {
        exitDate = leg.entryDate;
      }
    }
  }

  const avgEntryPrice = weightedEntrySum / totalEntryQty;
  // If we never exited, exitPrice is undefined (OPEN trade)
  const avgExitPrice = totalExitQty > 0 ? weightedExitSum / totalExitQty : undefined;

  // We generate a composite externalId to maintain trace
  const compositeId = legs
    .map(l => l.externalId)
    .filter(Boolean)
    .join('|')
    .substring(0, 255); // DB limit

  return {
    symbol: first.symbol,
    assetClass: first.assetClass,
    direction: first.direction,
    entryDate: first.entryDate,
    exitDate,
    quantity: totalEntryQty,
    entryPrice: avgEntryPrice,
    exitPrice: avgExitPrice,
    commission: totalCommission,
    externalId: compositeId || undefined,
  };
}
