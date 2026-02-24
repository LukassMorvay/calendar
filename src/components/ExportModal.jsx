// src/components/ExportModal.jsx
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { fetchTasks, fetchVacations } from "../api";

export default function ExportModal() {
  const [visible, setVisible] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [format, setFormat] = useState("pdf");

  useEffect(() => {
    function o() { setVisible(true); setFrom(""); setTo(""); setFormat("pdf"); }
    window.addEventListener("openExport", o);
    return () => window.removeEventListener("openExport", o);
  }, []);

  const exportTex = async () => {
    if (!from || !to) { alert("Vyplňte dátumy"); return; }
    const fr = new Date(from); const toD = new Date(to);
    if (toD < fr) { alert('Dátum "do" musí byť neskorší alebo rovnaký ako dátum "od".'); return; }
    const dateRange = [];
    const cur = new Date(fr);
    while (cur <= toD) { dateRange.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate()+1); }

    let latex = `\\documentclass[a4paper,12pt]{article}\\usepackage[utf8]{inputenc}\\usepackage[slovak]{babel}\\begin{document}`;
    for (const d of dateRange) {
      const tasks = await fetchTasks(d);
      const vacations = await fetchVacations(d);
      if ((tasks && tasks.length) || (vacations && vacations.length)) {
        latex += `\\section*{${new Date(d).toLocaleDateString('sk-SK',{ weekday:'long', day:'numeric', month:'long', year:'numeric'})}}`;
        if (tasks && tasks.length) {
          latex += "\\begin{tabular}{ll}\n";
          tasks.forEach(t => {
            latex += `${(t.start||'')} & ${t.popis} ${t.znacka} \\\\\n`;
          });
          latex += "\\end{tabular}\n";
        }
        if (vacations && vacations.length) {
          latex += "\\par Absencie:\\\\";
          vacations.forEach(v => { latex += `${v.employee} - ${v.absenceType}\\\\`; });
        }
      }
    }
    latex += "\\end{document}";
    const blob = new Blob([latex], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kalendar_${from}_${to}.tex`;
    document.body.appendChild(a); a.click(); a.remove();
    setVisible(false);
  };

  const exportExcel = async () => {
    if (!from || !to) { alert("Vyplňte dátumy"); return; }
    const fr = new Date(from); const toD = new Date(to);
    if (toD < fr) { alert('Dátum "do" musí byť neskorší alebo rovnaký ako dátum "od".'); return; }
    const rows = [["Dátum","Čas","Popis práce","Značka","Poisťovňa","Meno","Telefón","Mechanik","Ďalšie info","Check list"]];
    const cur = new Date(fr);
    while (cur <= toD) {
      const ds = cur.toISOString().split("T")[0];
      const tasks = await fetchTasks(ds);
      (tasks||[]).forEach(t => rows.push([ds, t.start, t.popis, t.znacka, t.poistovna, t.meno, t.telefon, t.mechanik, t.extraInfo, (t.checklist||[]).join(", ")]));
      cur.setDate(cur.getDate()+1);
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Úlohy");
    XLSX.writeFile(wb, `kalendar_${from}_${to}.xlsx`);
    setVisible(false);
  };

  const submit = (e) => {
    e.preventDefault();
    if (format === "pdf") exportTex(); else exportExcel();
  };

  if (!visible) return null;
  return (
    <div id="exportModal" className="modal">
      <div className="modal-content">
        <h2>Export</h2>
        <form onSubmit={submit}>
          <label>Dátum od:</label><input type="date" value={from} onChange={e=>setFrom(e.target.value)} required/>
          <label>Dátum do:</label><input type="date" value={to} onChange={e=>setTo(e.target.value)} required/>
          <label>Formát:</label>
          <select value={format} onChange={e=>setFormat(e.target.value)}><option value="pdf">PDF (.tex)</option><option value="excel">Excel</option></select>
          <div className="modal-buttons">
            <button type="submit">Exportovať</button>
            <button type="button" onClick={()=>setVisible(false)}>Zavrieť</button>
          </div>
        </form>
      </div>
    </div>
  );
}