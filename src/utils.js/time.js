export function generateDateFromMidnight(days = 0, hours = 0, minutes = 0) {
  const expireDate = new Date();
  console.log({ expireDate, days });
  if (Number(days) > 0) {
    expireDate.setHours(0, 0, 0, 0);
    const nowDay = expireDate.getDate();
    console.log({ nowDay });
    expireDate.setDate(+nowDay + Number(days));
    expireDate.setHours(Number(hours));
    expireDate.setMinutes(Number(minutes));
  } else {
    expireDate.setHours(+expireDate.getHours() + Number(hours));
    expireDate.setMinutes(+expireDate.getMinutes() + Number(minutes));
  }

  console.log("设置天数之后", { expireDate, days });

  return expireDate.toISOString();
}
