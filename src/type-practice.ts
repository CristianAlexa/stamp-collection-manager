function calculateStampValue(price: number, quantity: number): number {
  return price * quantity;
}

const total = calculateStampValue(12.5, 3);

console.log(total);

// Uncomment this line to see a TypeScript error:
// calculateStampValue("12.5", 3);
