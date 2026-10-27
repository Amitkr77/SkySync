// The next `count` hours from the current hour, crossing into tomorrow when needed.
export const upcomingHours = (data, count = 24) => {
  const startOfHour = Date.now() / 1000 - 3600;
  return data.days
    .slice(0, 2)
    .flatMap((day) => day.hours ?? [])
    .filter((hour) => hour.datetimeEpoch > startOfHour)
    .slice(0, count);
};

// Soft tint that follows the conditions; used for the page glow and the main card.
export const conditionTint = (icon = "", alpha = 0.22) => {
  let rgb = "148, 163, 184";
  if (icon.includes("thunder")) rgb = "167, 139, 250";
  else if (icon.includes("rain") || icon.includes("showers")) rgb = "56, 189, 248";
  else if (icon.includes("snow")) rgb = "186, 230, 253";
  else if (icon.includes("night")) rgb = "99, 102, 241";
  else if (icon === "clear-day" || icon === "partly-cloudy-day") rgb = "251, 191, 36";
  const strength = icon === "partly-cloudy-day" ? 0.65 : 1;
  return `rgba(${rgb}, ${alpha * strength})`;
};
