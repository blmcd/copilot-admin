export function generateDateFromMidnight(days = 0, hours = 0, minutes = 0) {
  const expireDate = new Date();
  expireDate.setHours(0, 0, 0, 0);
  expireDate.setDate(expireDate.getDate() + days);
  expireDate.setHours(hours);
  expireDate.setMinutes(minutes);
  return expireDate.toISOString();
}
