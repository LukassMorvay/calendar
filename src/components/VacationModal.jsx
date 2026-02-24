// src/components/VacationModal.jsx
import React, { useEffect, useState } from "react";
import { saveVacationApi, deleteVacationApi } from "../api";

const empty = { id: -1, employee: "", absenceType: "", dateFrom: "", dateTo: "", note: "" };

export default function VacationModal() {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    function open() {
      setForm(empty);
      setVisible(true);
    }
    window.addEventListener("openVacation", open);
    return () => window.removeEventListener("openVacation", open);
  }, []);

  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    await saveVacationApi(form);
    window.dispatchEvent(new CustomEvent("reloadDate", { detail: { date: form.dateFrom } }));
    setVisible(false);
  };

  const remove = async () => {
    if (form.id >= 0) {
      if (!confirm("Naozaj zmazať dovolenku?")) return;
      await deleteVacationApi(form.id);
      setVisible(false);
      window.dispatchEvent(new CustomEvent("refreshCalendar"));
    }
  };

  if (!visible) return null;
  return (
    <div id="vacationModal" className="modal">
      <div className="modal-content">
        <h2>Pridanie / Úprava neprítomnosti</h2>
        <form onSubmit={save}>
          <label>Meno zamestnanca:</label>
          <select name="employee" value={form.employee} onChange={change} required>
            <option value="">Vyber:</option>
            <option>Peter Kulich</option>
            <option>Tomáš Hrašna</option>
            <option>Róbert Krutek</option>
            <option>Patrik Krutek</option>
            <option>Michal Murin</option>
            <option>Martin Morvay</option>
            <option>Vlastimil Morvay</option>
            <option>Milan Morvay</option>
            <option>Dominik Levársky</option>
          </select>

          <label>Typ absencie:</label>
          <select name="absenceType" value={form.absenceType} onChange={change} required>
            <option value="">Vyber:</option>
            <option>Dovolenka - celý deň</option>
            <option>Dovolenka do 12:00</option>
            <option>Dovolenka od 12:00</option>
            <option>Doprovod - celý deň</option>
            <option>Návšteva lekára - celý deň</option>
            <option>PN-ka</option>
            <option>OČR</option>
            <option>Služobka</option>
          </select>

          <label>Dátum od:</label>
          <input type="date" name="dateFrom" value={form.dateFrom} onChange={change} required />
          <label>Dátum do:</label>
          <input type="date" name="dateTo" value={form.dateTo} onChange={change} required />
          <label>Poznámka:</label>
          <input name="note" value={form.note} onChange={change} />

          <div className="modal-buttons">
            <button type="submit">Uložiť</button>
            <button type="button" onClick={remove} className="delete-vacation-btn">🗑️ Zmazať</button>
            <button type="button" onClick={()=>setVisible(false)}>Zavrieť</button>
          </div>
        </form>
      </div>
    </div>
  );
}