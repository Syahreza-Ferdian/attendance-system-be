import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = 'Asia/Jakarta';

export const now = () => dayjs().tz(TIMEZONE);

export const toDate = (date: dayjs.Dayjs) => date.toDate();

export const convertToISO8601 = (date: dayjs.Dayjs) =>
  date.format('YYYY-MM-DDTHH:mm:ssZ');

export const convertStringToDate = (dateString: string) =>
  dayjs.utc(dateString);
