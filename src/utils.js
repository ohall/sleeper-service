// Get the current week number
const currentWeek = Math.ceil(
  (new Date() - new Date(new Date().getFullYear(), 0, 1)) /
    (7 * 24 * 60 * 60 * 1000),
);

const currentYear = new Date().getFullYear();

export { currentWeek, currentYear };
