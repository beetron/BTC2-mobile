// Reformat message date string to "HH:mm (MM/DD)" format

const formatDate = (date: string): string => {
  const parsedDate = new Date(date);
  const time = parsedDate.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = `${parsedDate.getMonth() + 1}/${parsedDate.getDate()}`;
  return `${time} (${formattedDate})`;
};

export default formatDate;
