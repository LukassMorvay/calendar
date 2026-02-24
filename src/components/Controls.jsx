// src/components/Controls.jsx
import React, { useContext } from "react";
import { CalendarContext } from "../context/CalendarContext";

export default function Controls() {
  const { currentDate, setCurrentDate, view, setView } = useContext(CalendarContext);

  const changeMonth = (dir) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + dir);
    setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  return (
    <>
      <div id="calendar-controls">
        <button onClick={() => changeMonth(-1)}>‹</button>
        <div id="monthYear">
          {currentDate.toLocaleString("sk-SK", { month: "long", year: "numeric" })}
        </div>
        <button onClick={() => changeMonth(1)}>›</button>
      </div>

      <div id="viewControls">
        <button id="todayBtn" onClick={() => setCurrentDate(new Date())}>Dnes</button>
        <button data-view="day" className={view === "day" ? "active" : ""} onClick={() => setView("day")}>Deň</button>
        <button data-view="week" className={view === "week" ? "active" : ""} onClick={() => setView("week")}>Týždeň</button>
        <button data-view="month" className={view === "month" ? "active" : ""} onClick={() => setView("month")}>Mesiac</button>
      </div>
    </>
  );
}