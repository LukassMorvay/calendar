const API_URL = "http://192.168.1.10/tasks.php";

export async function getTasksByDate(date) {
  const res = await fetch(`${API_URL}?date=${date}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

export async function addTask(task) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function updateTask(task) {
  const res = await fetch(API_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_URL}?id=${id}`, { method: "DELETE" });
  return res.json();
}