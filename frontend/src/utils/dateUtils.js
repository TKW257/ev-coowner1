import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

export const isDateInRange = (date, start, end) =>
  dayjs(date).isBetween(dayjs(start), dayjs(end), "day", "[]");

export const isRangeOverlap = (range1, range2) =>
  dayjs(range1.start).isBefore(range2.end) &&
  dayjs(range1.end).isAfter(range2.start);

export const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");
