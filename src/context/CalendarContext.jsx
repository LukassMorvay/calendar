// src/context/CalendarContext.jsx
import React, { createContext, useEffect, useState, useCallback } from "react";
import { getTasksByDate } from "../api/tasksService";
import { fetchVacations } from "../api/vacationsService";
import { fetchNotes } from "../api/notesService";

export const CalendarContext = createContext();

export const CalendarProvider = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });
  const [view, setView] = useState("month"); // month | week | day
  const [tasksCache, setTasksCache] = useState({});    // keyed by date
  const [vacationsCache, setVacationsCache] = useState({});
  const [notesCache, setNotesCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const reloadDateData = useCallback(async (dateStr) => {
    setIsLoading(true);
    const [t, v, n] = await Promise.all([
      getTasksByDate(dateStr),
      fetchVacations(dateStr),
      fetchNotes(dateStr),
    ]);
    setTasksCache(prev => ({ ...prev, [dateStr]: t || [] }));
    setVacationsCache(prev => ({ ...prev, [dateStr]: v || [] }));
    setNotesCache(prev => ({ ...prev, [dateStr]: n || [] }));
    setIsLoading(false);
  }, []);

  // reload whenever selected date changes; components may call reloadDateData for other dates too
  useEffect(() => {
    const ds = currentDate.toISOString().split("T")[0];
    reloadDateData(ds);
  }, [currentDate, reloadDateData]);

  return (
    <CalendarContext.Provider value={{
      currentDate, setCurrentDate,
      view, setView,
      tasksCache, setTasksCache,
      vacationsCache, setVacationsCache,
      notesCache, setNotesCache,
      reloadDateData,
      isLoading
    }}>
      {children}
    </CalendarContext.Provider>
  );
};