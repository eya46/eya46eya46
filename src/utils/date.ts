export function formatDate(data: string) {
  const date = new Date(data);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

export function checkIsNextDay(time: number) {
  const now = new Date();
  const date = new Date(time);
  return `${now.getMonth()}-${now.getDate()}` !== `${date.getMonth()}-${date.getDate()}`;
}

export function checkIsNextHour(time: number) {
  const now = new Date();
  const date = new Date(time);
  return (
    `${now.getMonth()}-${now.getDate()}-${now.getHours()}` !== `${date.getMonth()}-${date.getDate()}-${date.getHours()}`
  );
}
