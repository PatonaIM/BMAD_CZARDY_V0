function detectIntent(text: string) {
  const lowerText = text.toLowerCase()

  if (
    lowerText.includes("pricing") ||
    lowerText.includes("price") ||
    lowerText.includes("cost") ||
    lowerText.includes("plans") ||
    lowerText.includes("subscription") ||
    lowerText.includes("how much")
  ) {
    return {
      isCommand: true,
      command: "pricing",
    }
  }
  // </CHANGE>

  // Browse candidates - for hiring managers
  if (
    lowerText.includes("browse candidate") ||
    lowerText.includes("candidates") ||
    lowerText.includes("hiring") ||
    lowerText.includes("job")
  ) {
    return {
      isCommand: true,
      command: "browseCandidates",
    }
  }

  // ... rest of code here ...
}
