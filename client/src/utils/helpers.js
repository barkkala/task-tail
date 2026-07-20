export function getUserName(user) {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return fullName || user.login;
}

export function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}