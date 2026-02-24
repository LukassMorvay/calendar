// src/components/TaskModal.jsx
import React, { useEffect, useState } from "react";
import { updateTask } from "../api/tasksService";

const defaultForm = {
  id: -1, date: "", createdBy: "", popis: "", customPopis: "", znacka: "", poistovna: "",
  start: "", telefon: "", meno: "", mechanik: "", extraInfo: "", checklist: []
};

export default function TaskModal() {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    function handleOpen(e) {
      const date = e.detail?.date;
      if (date) {
        setForm({ ...defaultForm, date });
        setVisible(true);
        setTimeout(()=>document.getElementById("znacka")?.focus(), 80);
      }
    }
    function handleEdit(e) {
      const { task, date } = e.detail || {};
      if (task) {
        setForm({ ...task, date: task.date || date });
        setVisible(true);
        setTimeout(()=>document.getElementById("znacka")?.focus(), 80);
      }
    }
    window.addEventListener("openDay", handleOpen);
    window.addEventListener("editTask", handleEdit);
    return () => {
      window.removeEventListener("openDay", handleOpen);
      window.removeEventListener("editTask", handleEdit);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "checklist") {
      setForm(prev => {
        const list = prev.checklist || [];
        if (checked) return {...prev, checklist: [...list, value]};
        return {...prev, checklist: list.filter(x=>x!==value)};
      });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const close = () => { setVisible(false); setForm(defaultForm); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.date) {
      alert("Dátum je povinný");
      return;
    }
    await updateTask(form);
    // trigger reload for this date + close
    const ev = new CustomEvent("reloadDate", { detail: { date: form.date }});
    window.dispatchEvent(ev);
    close();
    // also tell calendar to refresh globally
    const ev2 = new CustomEvent("refreshCalendar");
    window.dispatchEvent(ev2);
  };

  if (!visible) return null;
  return (
    <div id="taskModal" className="modal">
      <div className="modal-content">
        <h2><span id="modalDateDisplay">{form.date}</span></h2>
        <h2>Pridať / Upraviť zákazku</h2>
        <form id="taskForm" onSubmit={submit}>
          <input type="hidden" name="id" value={form.id}/>
          <div id="datePickerSection" style={{display: 'none'}}>
            <label>Dátum</label>
            <input type="date" name="date" value={form.date} onChange={handleChange}/>
          </div>

          <label>Vytvoril:</label>
          <select name="createdBy" value={form.createdBy} onChange={handleChange} required>
            <option value="">Vyber:</option>
            <option>Patrik Krutek</option>
            <option>Michal Murin</option>
            <option>Martin Morvay</option>
            <option>Vlastimil Morvay</option>
            <option>Milan Morvay</option>
          </select>

          <label>Popis práce:</label>
          <select name="popis" value={form.popis} onChange={handleChange} required>
            <option value="">Vyber:</option>
            <option>Oprava skla</option>
            <option>Výmena skla</option>
            <option>Ťažné zariadenie</option>
            <option>Žiarovky</option>
            <option>Klimatizácia</option>
            <option>Ostatné</option>
          </select>

          {form.popis === "Ostatné" && <>
            <label>Zadajte popis:</label>
            <input name="customPopis" value={form.customPopis} onChange={handleChange} required />
          </>}

          <label>Značka auta:</label>
          <input id="znacka" name="znacka" value={form.znacka} onChange={handleChange} required />

          <label>Poisťovňa:</label>
          <select name="poistovna" value={form.poistovna} onChange={handleChange} required>
            <option value="">Vyber:</option>
            <option>Bez poisťovne</option>
            <option>Allianz</option>
            <option>ČSOB</option>
            <option>Generali</option>
            <option>Groupama</option>
            <option>Uniqa</option>
            <option>Kooperativa</option>
            <option>Komunálna</option>
            <option>Wüstenrot</option>
            <option>Union</option>
            <option>OD PROGRAM</option>
          </select>

          <label>Začiatok (čas):</label>
          <select name="start" value={form.start} onChange={handleChange} required>
            <option value="">Vyber:</option>
            {["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","Prenocovanie"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <label>Telefónne číslo zákazníka:</label>
          <input name="telefon" value={form.telefon} onChange={handleChange} required />

          <label>Meno zákazníka:</label>
          <input name="meno" value={form.meno} onChange={handleChange} />

          <label>Mechanik:</label>
          <select name="mechanik" value={form.mechanik} onChange={handleChange}>
            <option value="">Vyber:</option>
            <option>Peter Kulich</option>
            <option>Róbert Krutek</option>
            <option>Tomáš Hrašna</option>
          </select>

          <label>Ďalšie informácie (nepovinné):</label>
          <input name="extraInfo" value={form.extraInfo} onChange={handleChange} />

          <div className="checklist-section">
            <h3>Check list</h3>
            {["Dodaný materiál","Zákazka dokončená","Kontaktovaný","Prenocovanie"].map(c => (
              <label key={c}><input type="checkbox" name="checklist" value={c} checked={(form.checklist||[]).includes(c)} onChange={handleChange} /> {c}</label>
            ))}
          </div>

          <div className="modal-buttons">
            <button type="submit">Uložiť</button>
            <button type="button" onClick={close}>Zavrieť</button>
          </div>
        </form>
      </div>
    </div>
  );
}