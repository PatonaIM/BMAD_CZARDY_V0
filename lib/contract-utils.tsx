export function romanToArabic(roman: string): number {
  const romanMap: { [key: string]: number } = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  }

  let arabic = 0
  let prevValue = 0

  // Process from right to left
  for (let i = roman.length - 1; i >= 0; i--) {
    const currentValue = romanMap[roman[i].toUpperCase()]

    if (currentValue === undefined) {
      return 0 // Invalid Roman numeral
    }

    // If current value is less than previous, subtract it (e.g., IV = 4)
    // Otherwise, add it (e.g., VI = 6)
    if (currentValue < prevValue) {
      arabic -= currentValue
    } else {
      arabic += currentValue
    }

    prevValue = currentValue
  }

  return arabic
}
// </CHANGE>
