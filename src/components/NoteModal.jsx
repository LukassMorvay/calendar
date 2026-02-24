// src/components/NoteModal.jsx
import React, { useEffect, useState } from "react";
import { saveNoteApi, deleteNoteApi } from "../api";

const empty = { id: -1, date: "", note: "" };

export default function NoteModal() {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    function open() { setForm(empty); setVisible(true); }
    window.addEventListener("openNote", open);
    return () => window.removeEventListener("openNote", open);
  }, []);

  const change = (e) => setForm(f=>({ ...f, [e.target.name]: e.target.value}));

  const save = async (e) => {
    e.preventDefault();
    await saveNoteApi(form);
    window.dispatchEvent(new CustomEvent("reloadDate", { detail: { date: form.date } }));
    setVisible(false);
  };

  const remove = async () => {
    if (form.id >= 0) {
      if (!confirm("Naozaj zmazať poznámku?")) return;
      await deleteNoteApi(form.id);
      window.dispatchEvent(new CustomEvent("reloadDate", { detail: { date: form.date } }));
      setVisible(false);
    }
  };

  if (!visible) return null;
  return (
    <div id="noteModal" className="modal">
      <div className="modal-content">
        <h2>Pridanie / Úprava poznámky</h2>
        <form onSubmit={save}>
          <input type="hidden" name="id" value={form.id}/>
          <label>Dátum:</label>
          <input type="date" name="date" value={form.date} onChange={change} required />
          <label>Poznámka:</label>
          <textarea name="note" value={form.note} onChange={change} rows={4} required/>
          <div className="modal-buttons">
            <button type="submit">Uložiť</button>
            <button type="button" onClick={remove}>🗑️ Zmazať</button>
            <button type="button" onClick={()=>setVisible(false)}>Zavrieť</button>
          </div>
        </form>
      </div>
    </div>
  );
}