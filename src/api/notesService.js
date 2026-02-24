const BASE_URL = "http://192.168.1.10/Kalendár/api/notes.php";

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("API error (notes):", url, err);
    throw err;
  }
}

// ✅ Get all notes for a specific date
export async function fetchNotes(date) {
  return safeFetch(`${BASE_URL}?date=${encodeURIComponent(date)}`);
}

// ✅ Add a new note
export async function addNote(note) {
  return safeFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(note),
  });
}

// ✅ Update a note
export async function updateNote(note) {
  return safeFetch(BASE_URL, {
    method: "PUT",
    body: JSON.stringify(note),
  });
}

// ✅ Delete a note
export async function deleteNote(id) {
  return safeFetch(`${BASE_URL}?id=${id}`, {
    method: "DELETE",
  });
}