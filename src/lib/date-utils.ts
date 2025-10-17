export function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    from: firstDay,
    to: lastDay
  };
}

export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}
