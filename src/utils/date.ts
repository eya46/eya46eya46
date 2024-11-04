function NaNToNoData(originalMethod: (data: string | number) => string) {
  return function (args: string | number) {
    const result = originalMethod(args);
    return result.includes("NaN") ? "未知时间" : result;
  };
}

export const formatDate = NaNToNoData((data: string | number) => {
  const date = new Date(data);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
});

export const formatDateTillDay = NaNToNoData((data: string | number) => {
  const date = new Date(data);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
});

export const formatDateTillHour = NaNToNoData((data: string | number) => {
  const date = new Date(data);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}h`;
});

export function checkIsNextDay(time: string | number) {
  const now = new Date();
  const date = new Date(time);
  return `${now.getMonth()}-${now.getDate()}` !== `${date.getMonth()}-${date.getDate()}`;
}

export function checkIsNextHour(time: string | number) {
  const now = new Date();
  const date = new Date(time);
  return (
    `${now.getMonth()}-${now.getDate()}-${now.getHours()}` !== `${date.getMonth()}-${date.getDate()}-${date.getHours()}`
  );
}
