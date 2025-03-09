export const calculateCurrentStreak = (numbers, redNumbers, blackNumbers) => {
  // Convert all numbers to integers
  const numArray = numbers.map((n) => parseInt(n, 10));

  // Initialize streaks
  let redStreak = 0;
  let blackStreak = 0;
  let firstStreak = 0; // 1-12
  let secondStreak = 0; // 13-24
  let thirdStreak = 0; // 25-36
  let zeroStreak = 0; // 0

  // Helper function to check consecutive numbers of a certain type
  const countConsecutive = (checkFn) => {
    let count = 0;
    for (let i = numArray.length - 1; i >= 0; i--) {
      if (checkFn(numArray[i])) {
        count++;
      } else {
        break;
      }
    }
    return count;
  };

  // Calculate each streak type
  redStreak = countConsecutive((num) => redNumbers.has(num));
  blackStreak = countConsecutive((num) => blackNumbers.has(num));
  firstStreak = countConsecutive((num) => num >= 1 && num <= 12);
  secondStreak = countConsecutive((num) => num >= 13 && num <= 24);
  thirdStreak = countConsecutive((num) => num >= 25 && num <= 36);
  zeroStreak = countConsecutive((num) => num === 0);

  return {
    red: redStreak,
    black: blackStreak,
    first: firstStreak,
    second: secondStreak,
    third: thirdStreak,
    zero: zeroStreak,
  };
};
