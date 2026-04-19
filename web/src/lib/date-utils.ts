export const formatDate = (date: any) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return isNaN(d.getTime()) ? 'Pending' : d.toLocaleString();
};
