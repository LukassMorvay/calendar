const BASE_URL = "http://192.168.1.10/Kalendár/api/vacations.php";

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
    console.error("API error (vacations):", url, err);
    throw err;
  }
}

// ✅ Get all vacations for a specific date
export async function fetchVacations(date) {
  return safeFetch(`${BASE_URL}?date=${encodeURIComponent(date)}`);
}

// ✅ Add a vacation
export async function addVacation(vacation) {
  return safeFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(vacation),
  });
}

// ✅ Update vacation
export async function updateVacation(vacation) {
  return safeFetch(BASE_URL, {
    method: "PUT",
    body: JSON.stringify(vacation),
  });
}

// ✅ Delete vacation
export async function deleteVacation(id) {
  return safeFetch(`${BASE_URL}?id=${id}`, {
    method: "DELETE",
  });
}