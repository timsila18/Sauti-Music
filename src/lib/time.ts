export function relativeTime(value: string, now = Date.now()) {
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  if (seconds < 172800) return "Yesterday";
  return new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", timeZone: "Africa/Nairobi" }).format(date);
}

export function kenyaDate(value: string) {
  return new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Nairobi" }).format(new Date(value));
}

export function kenyaDateTime(value: string) {
  return new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" }).format(new Date(value));
}
