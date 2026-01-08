export const formatDate = (
  isoString: string | undefined,
  lang: string = "th"
): string => {
  if (!isoString) {
    return "";
  }
  const locale = lang === "th" ? "th-TH" : "en-US";
  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.toLocaleString(locale, { month: "long" });
  const year = lang === "th" ? date.getFullYear() + 543 : date.getFullYear();

  return `${day} ${month} ${year}`;
};

export const formatDateTime = (
  isoString: string | undefined,
  lang: string = "th"
): string => {
  if (!isoString) {
    return "";
  }

  const locale = lang === "th" ? "th-TH" : "en-US";
  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.toLocaleString(locale, { month: "long" });
  const year = lang === "th" ? date.getFullYear() + 543 : date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day} ${month} ${year} ${
    lang === "th" ? "เวลา" : "at"
  } ${hours}:${minutes}`;
};

export const formatDurationAbbreviated = (
  totalSeconds: number,
  lang: string = "th"
): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ${lang === "th" ? "ชม." : "h."}`);
  if (minutes > 0) parts.push(`${minutes} ${lang === "th" ? "นาที" : "min."}`);
  if (seconds > 0) parts.push(`${seconds} ${lang === "th" ? "วินาที" : "s."}`);

  return parts.join(" ");
};
