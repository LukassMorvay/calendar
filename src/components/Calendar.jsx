import React, { useContext, useEffect, useState } from "react";
import { CalendarContext } from "../context/CalendarContext";

import { getTasksByDate } from "../api/tasksService";
import { fetchVacations } from "../api/vacationsService";
import { fetchNotes } from "../api/notesService";

// small helpers copied/converted from script.js
function sanitizeClassName(name='') {
  return String(name)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
}
function getChecklistIcons(checklist=[]) {
  const allItems = ['Dodaný materiál', 'Zákazka dokončená', 'Kontaktovaný', 'Prenocovanie'];
  return allItems.map(item => {
    const checked = Array.isArray(checklist) && checklist.includes(item);
    const color = checked ? '#0d820dc4' : '#ff0000';
    if (item === 'Kontaktovaný') {
      return `<span class="checklist-icon kontaktovany"><svg width="16" height="16" viewBox="0 0 24 24" fill="${color}" stroke="none"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.2 2.2z"/></svg></span>`;
    } else if (item === 'Dodaný materiál') {
      return `<span class="checklist-icon dodany-material"><svg width="16" height="16" viewBox="0 0 24 24" fill="${color}" stroke="none"><path d="M2 18V6h20v12H2zm2-10l8 4 8-4"/></svg></span>`;
    } else if (item === 'Zákazka dokončená') {
      return `<span class="checklist-icon zakazka-dokoncena"><svg width="16" height="16" viewBox="0 0 24 24" fill="${color}" stroke="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></span>`;
    } else return '';
  }).join('');
}

export default function Calendar() {
  const { currentDate, view, reloadDateData, tasksCache, vacationsCache, notesCache } = useContext(CalendarContext);
  const [days, setDays] = useState([]);
  const [rendering, setRendering] = useState(false);

  // produce days for current view
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    if (view === "month") {
      const len = new Date(year, month + 1, 0).getDate();
      const cells = [];
      for (let d = 1; d <= len; d++) cells.push(new Date(year, month, d));
      setDays(cells);
    } else if (view === "week") {
      const monday = new Date(currentDate);
      const day = currentDate.getDay();
      const offset = day === 0 ? -6 : 1 - day;
      monday.setDate(currentDate.getDate() + offset);
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dd = new Date(monday);
        dd.setDate(monday.getDate() + i);
        week.push(dd);
      }
      setDays(week);
    } else {
      setDays([currentDate]);
    }
  }, [currentDate, view]);

  // helper to format ISO date
  const iso = (d) => d.toISOString().split("T")[0];

  // ensure data is loaded for visible dates
  useEffect(() => {
    if (!days.length) return;
    (async () => {
      setRendering(true);
      await Promise.all(days.map(day => reloadDateData(iso(day))));
      setRendering(false);
    })();
  // eslint-disable-next-line
  }, [days.join ? days.join(",") : days, reloadDateData]); // days is array - coarse dependency

  // handlers
  const openDay = (d) => {
    // mimic original behaviour: clicking a day in month/week switches to day view
    // We'll dispatch a custom event so other components (TaskModal) can open — simple approach: window events
    const ds = iso(d);
    const ev = new CustomEvent("openDay", { detail: { date: ds } });
    window.dispatchEvent(ev);
  };

  const handleTaskClick = (task, date) => {
    const ev = new CustomEvent("openDetails", { detail: { task, date } });
    window.dispatchEvent(ev);
  };

  const handleDeleteTask = async (id, dateStr) => {
    if (!confirm("Naozaj chcete vymazať túto zákazku?")) return;
    await deleteTaskApi(id);
    await reloadDateData(dateStr);
  };

  return (
    <div id="calendar" className={`${view}-view`}>
      {rendering && <p>Načítavam...</p>}
      {view === "month" && (
        <>
          {/* render offset blanks to match original calendar (first day alignment) */}
          <div className="month-grid">
            {(() => {
              const first = new Date(days[0]?.getFullYear() || currentDate.getFullYear(), days[0]?.getMonth() || currentDate.getMonth(), 1);
              const idx = first.getDay();
              const startOffset = idx === 0 ? 6 : idx - 1;
              const blanks = Array.from({length: startOffset}).map((_,i)=> <div key={`b${i}`} className="day-container blank"></div>);
              return blanks;
            })()}
            {days.map(d => {
              const dateStr = iso(d);
              const tasks = tasksCache[dateStr] || [];
              const vacations = vacationsCache[dateStr] || [];
              const notes = notesCache[dateStr] || [];
              return (
                <div key={dateStr} className="day-container" onClick={() => openDay(d)}>
                  <div className={`day ${d.getDay()===0||d.getDay()===6?'weekend':''}`}>
                    <div className="header">
                      <div className="date">{d.getDate()}.{d.getMonth()+1}.</div>
                    </div>
                    {/* vacations */}
                    {vacations.length>0 && (
                      <div className="vacation-container">
                        {vacations.map(v=>(
                          <div key={v.id} className="vacation-badge">
                            <span>{v.employee} | {v.absenceType}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* notes */}
                    {notes.length>0 && (
                      <div className="note-container">
                        {notes.map(n=>(
                          <div key={n.id} className="note-badge">{n.note}</div>
                        ))}
                      </div>
                    )}
                    {/* task badges (month view: compact) */}
                    {tasks.map(t => {
                      const styleClass = sanitizeClassName(t.popis || 'Ostatne');
                      const mechClass = sanitizeClassName(t.mechanik || 'Bez_mechanika');
                      return (
                        <div
                          key={t.id}
                          className={`task-badge ${mechClass} ${styleClass}`}
                          onClick={(e)=>{ e.stopPropagation(); handleTaskClick(t, dateStr); }}
                        >
                          {t.popis} | {t.znacka}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {view === "week" && (
        <div className="week-grid">
          {days.map(d => {
            const dateStr = iso(d);
            const tasks = tasksCache[dateStr] || [];
            const vacations = vacationsCache[dateStr] || [];
            return (
              <div key={dateStr} className="day-container" onClick={() => openDay(d)}>
                <div className="day">
                  <div className="header">
                    <div className="date">{d.toLocaleString('sk-SK',{ weekday: 'short', day: 'numeric', month: 'numeric' })}</div>
                  </div>

                  {/* small counter logic simplified: count by category */}
                  <div className="task-counter">
                    {(() => {
                      const counts = {};
                      tasks.forEach(t => {
                        const cat = ['Oprava skla','Výmena skla','Prelepenie skla','Ťažné zariadenie','Žiarovky','Klimatizácia'].includes(t.popis) ? t.popis : 'Ostatné';
                        counts[cat] = (counts[cat]||0) + 1;
                      });
                      return Object.entries(counts).map(([k,v]) => <div key={k} className={`counter-circle ${sanitizeClassName(k)}`}>{v}</div>);
                    })()}
                  </div>

                  {vacations.map(v=> <div key={v.id} className="vacation-badge">{v.employee}</div>)}

                  {tasks.map(t => (
                    <div key={t.id} className={`task-badge ${sanitizeClassName(t.mechanik||'Bez_mechanika')} ${sanitizeClassName(t.popis||'Ostatne')}`} onClick={(e)=>{ e.stopPropagation(); handleTaskClick(t, dateStr); }}>
                      <div dangerouslySetInnerHTML={{__html: `${t.start} | ${t.popis} | ${t.znacka} ${getChecklistIcons(t.checklist)}`}} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "day" && (
        <div className="day-single">
          {days.map(d => {
            const dateStr = iso(d);
            const tasks = tasksCache[dateStr] || [];
            const vacations = vacationsCache[dateStr] || [];
            return (
              <div key={dateStr} className="day-container">
                <div className="day">
                  <div className="date-title">{d.toLocaleString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>

                  {/* counters */}
                  <div className="task-counter">
                    {(() => {
                      const types = ['Oprava skla','Výmena skla','Prelepenie skla','Ťažné zariadenie','Žiarovky','Klimatizácia','Ostatné','Prenocovanie'];
                      const counts = {};
                      types.forEach(t => counts[t]=0);
                      tasks.forEach(t => {
                        const cat = ['Oprava skla','Výmena skla','Prelepenie skla','Ťažné zariadenie','Žiarovky','Klimatizácia'].includes(t.popis) ? t.popis : 'Ostatné';
                        counts[cat] = (counts[cat]||0)+1;
                        if (Array.isArray(t.checklist) && t.checklist.includes('Prenocovanie')) counts['Prenocovanie']++;
                      });
                      return Object.entries(counts).filter(([,v])=>v>0).map(([k,v]) => <div key={k} className={`counter-circle ${sanitizeClassName(k)}`}>{v}</div>);
                    })()}
                  </div>

                  {/* time slots */}
                  <div className="time-slots">
                    {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"].map(slot => (
                      <div key={slot} className="hour-block">
                        <div className="hour-label">{slot}</div>
                        <div className="hour-slot">
                          {tasks.filter(t => t.start && t.start.startsWith(slot.split(':')[0])).map(t => (
                            <div key={t.id} className={`task-badge ${sanitizeClassName(t.mechanik||'Bez_mechanika')} ${sanitizeClassName(t.popis||'Ostatne')}`} onClick={(e)=>{e.stopPropagation(); handleTaskClick(t, dateStr);}}>
                              <div dangerouslySetInnerHTML={{__html: `${t.start} | ${t.popis} | ${t.znacka} ${getChecklistIcons(t.checklist)}`}} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {/* Prenocovanie */}
                    {tasks.some(t => t.start === 'Prenocovanie' || (Array.isArray(t.checklist) && t.checklist.includes('Prenocovanie'))) && (
                      <div className="hour-block">
                        <div className="hour-label">Noc</div>
                        <div className="hour-slot">
                          {tasks.filter(t => t.start === 'Prenocovanie' || (Array.isArray(t.checklist) && t.checklist.includes('Prenocovanie'))).map(t => (
                            <div key={t.id} className={`task-badge prenocovanie-badge ${sanitizeClassName(t.mechanik||'Bez_mechanika')}`} onClick={(e)=>{e.stopPropagation(); handleTaskClick(t, dateStr);}}>
                              {t.popis} | {t.znacka}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* vacations */}
                  {vacations.length>0 && <div className="vacation-section">{vacations.map(v=> <div key={v.id} className="vacation-badge">{v.employee} | {v.absenceType}</div>)}</div>}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
