import dayjs from "dayjs";

function NaNToNoData(originalMethod: (data: string | number) => string) {
  return function (args: string | number) {
    const result = originalMethod(args);
    return result.includes("Invalid") ? "未知时间" : result;
  };
}

export const formatDate = NaNToNoData((data: string | number) => {
  return dayjs(data).format("YYYY-M-D HH:mm:ss");
});

export const formatDateTillDay = NaNToNoData((data: string | number) => {
  return dayjs(data).format("YYYY-M-D");
});

export const formatDateTillHour = NaNToNoData((data: string | number) => {
  return dayjs(data).format("YYYY-M-D H[h]");
});

export function checkIsNextDay(time: string | number) {
  const now = dayjs();
  const date = dayjs(time);
  return !now.isSame(date, "day");
}

export function checkIsNextHour(time: string | number) {
  const now = dayjs();
  const date = dayjs(time);
  return !now.isSame(date, "hour");
}
