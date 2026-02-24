// // src/api.js
// const BASE = "http://192.168.1.10/Kalendár/api";

// async function safeFetch(url, opts) {
//   try {
//     const res = await fetch(url, opts);
//     if (!res.ok) {
//       const text = await res.text();
//       throw new Error(`${res.status} ${text}`);
//     }
//     const json = await res.json();
//     return json;
//   } catch (err) {
//     console.error("API error:", url, err);
//     return null;
//   }
// }

// export async function fetchTasks(date) {
//   const r = await safeFetch(`${BASE}/tasks.php?date=${date}`);
//   return r || [];
// }
// export async function fetchVacations(date) {
//   const r = await safeFetch(`${BASE}/vacations.php?date=${date}`);
//   return r || [];
// }
// export async function fetchNotes(date) {
//   const r = await safeFetch(`${BASE}/notes.php?date=${date}`);
//   return r || [];
// }

// export async function saveTask(task) {
//   const method = task.id >= 0 ? "PUT" : "POST";
//   const url = method === "POST" ? `${BASE}/tasks.php?date=${task.date}` : `${BASE}/tasks.php`;
//   return await safeFetch(url, {
//     method,
//     headers: { "Content-Type": "application/json; charset=utf-8" },
//     body: JSON.stringify(task),
//   });
// }

// export async function deleteTaskApi(id) {
//   return await safeFetch(`${BASE}/tasks.php?id=${id}`, { method: "DELETE" });
// }

// export async function saveVacationApi(vacation) {
//   const method = vacation.id >= 0 ? "PUT" : "POST";
//   return await safeFetch(`${BASE}/vacations.php`, {
//     method,
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(vacation),
//   });
// }
// export async function deleteVacationApi(id) {
//   return await safeFetch(`${BASE}/vacations.php?id=${id}`, { method: "DELETE" });
// }

// export async function saveNoteApi(note) {
//   const method = note.id >= 0 ? "PUT" : "POST";
//   return await safeFetch(`${BASE}/notes.php`, {
//     method,
//     headers: { "Content-Type": "application/json; charset=utf-8" },
//     body: JSON.stringify(note),
//   });
// }
// export async function deleteNoteApi(id) {
//   return await safeFetch(`${BASE}/notes.php?id=${id}`, { method: "DELETE" });
// }
