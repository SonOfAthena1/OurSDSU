/**
 * Takes in a decimal number of hours and formats it as hh:mm (am/pm optional)
 * @param hours
 * @param militaryTime
 * @param padStart
 * @returns
 */
export function formatDecimalHours(
  hours: number,
  militaryTime = true,
  padStart = false,
) {
  const minutes = (hours % 1) * 60;
  let justHour = Math.trunc(hours);
  let addToEnd = "";

  if (!militaryTime) {
    addToEnd = justHour < 12 ? " am" : " pm";
    if (justHour >= 13) {
      justHour -= 12;
    }
  }

  let result = `${justHour}:${String(minutes).padStart(2, "0")}${addToEnd}`;

  if (padStart) {
    result = `${String(justHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}${addToEnd}`;
  }

  return result;
}
