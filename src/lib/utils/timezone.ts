import { format } from "date-fns-tz";

const BOGOTA_TIME_ZONE = "America/Bogota";
const TIMESTAMP_FORMAT = "yyyy-MM-dd'T'HH:mm:ssXXX";

/**
 * Returns an ISO 8601 timestamp string representing the provided date
 * in the America/Bogota (GMT-5) timezone. Defaults to the current time.
 */
export function getBogotaTimestamp(date: Date = new Date()): string {
  return format(date, TIMESTAMP_FORMAT, { timeZone: BOGOTA_TIME_ZONE });
}

export { BOGOTA_TIME_ZONE };
