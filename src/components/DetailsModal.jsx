// src/components/DetailsModal.jsx
import React, { useEffect, useState } from "react";
import { deleteTaskApi, saveTask } from "../api";

export default function DetailsModal() {
  const [visible, setVisible] = useState(false);
  const [task, setTask] = useState(null);
  const [date, setDate] = useState(null);
  const [checklist, setChecklist] = useState([]);

  useEffect(() => {
    function open(e) {
      const { task: t, date: d } = e.detail || {};
      if (t) {
        setTask(t);
        setChecklist(t.checklist || []);
        setDate(d);
        setVisible(true);
      }
    }
    window.addEventListener("openDetails", open);
    return () => window.removeEventListener("openDetails", open);
  }, []);

  if (!visible || !task) return null;

  const toggleItem = (val) => {
    setChecklist(prev => prev.includes(val) ? prev.filter(x=>x!==val) : [...prev, val]);
  };

  const saveChecklist = async () => {
    const payload = { ...task, checklist, id: task.id };
    await saveTask(payload);
    // notify reload
    window.dispatchEvent(new CustomEvent("reloadDate", { detail: { date } }));
    setVisible(false);
  };

  const handleDelete = async () => {
    if (!confirm("Naozaj chcete vymazať túto zákazku?")) return;
    await deleteTaskApi(task.id);
    window.dispatchEvent(new CustomEvent("reloadDate", { detail: { date } }));
    setVisible(false);
  };

  const handleEdit = () => {
    // emit an event to open the TaskModal in edit mode
    window.dispatchEvent(new CustomEvent("editTask", { detail: { task, date } }));
    setVisible(false);
  };

  return (
    <div id="detailsModal" className="modal">
      <div className="modal-content">
        <h2>Detail zákazky</h2>
        <div id="detailsContent">
          <p><strong>Vytvoril:</strong> {task.createdBy || '—'}</p>
          <p><strong>Popis práce:</strong> {task.popis || '—'}</p>
          <p><strong>Značka auta:</strong> {task.znacka || '—'}</p>
          <p><strong>Poisťovňa:</strong> {task.poistovna || '—'}</p>
          <p><strong>Čas:</strong> {task.start}</p>
          <p><strong>Meno:</strong> {task.meno || '—'}</p>
          <p><strong>Telefón:</strong> {task.telefon || '—'}</p>
          <p><strong>Mechanik:</strong> {task.mechanik || '—'}</p>
          {task.extraInfo && <p><strong>Ďalšie info:</strong> {task.extraInfo}</p>}
        </div>

        <div id="detailsChecklist" className="checklist-section">
          <h3>Check list</h3>
          {["Dodaný materiál","Zákazka dokončená","Kontaktovaný","Prenocovanie"].map(c=> (
            <label key={c}><input type="checkbox" checked={checklist.includes(c)} onChange={()=>toggleItem(c)} /> {c}</label>
          ))}
        </div>

        <div className="modal-buttons">
          <button onClick={handleDelete}>🗑️ Zmazať</button>
          <button onClick={saveChecklist}>Uložiť</button>
          <button onClick={handleEdit}>Editovať</button>
          <button onClick={()=>setVisible(false)}>Zavrieť</button>
        </div>
      </div>
    </div>
  );
}