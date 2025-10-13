// Helper function to count consecutive occurrences
const countConsecutive = (numbers, predicate) => {
  let count = 0;
  // Start from the most recent number (end of the array)
  for (let i = numbers.length - 1; i >= 0; i--) {
    const num = parseInt(numbers[i], 10);
    if (predicate(num)) {
      count++;
    } else {
      break; // Stop counting when the streak is broken
    }
  }
  return count;
};

export const calculateCurrentStreak = (numbers, redNumbers, blackNumbers) => {
  // Convert arrays to Sets for faster lookup
  const redSet = new Set(redNumbers);
  const blackSet = new Set(blackNumbers);

  // Count streaks for different categories
  const redStreak = countConsecutive(numbers, (num) => redSet.has(num));
  const blackStreak = countConsecutive(numbers, (num) => blackSet.has(num));
  const zeroStreak = countConsecutive(numbers, (num) => num === 0);
  const firstStreak = countConsecutive(numbers, (num) => num >= 1 && num <= 12);
  const secondStreak = countConsecutive(
    numbers,
    (num) => num >= 13 && num <= 24
  );
  const thirdStreak = countConsecutive(
    numbers,
    (num) => num >= 25 && num <= 36
  );

  return {
    red: redStreak,
    black: blackStreak,
    zero: zeroStreak,
    first: firstStreak,
    second: secondStreak,
    third: thirdStreak,
  };
};
