import React from "react";
import Header from "./components/Header";
import Controls from "./components/Controls";
import Calendar from "./components/Calendar";
import TaskModal from "./components/TaskModal";
import DetailsModal from "./components/DetailsModal";
import VacationModal from "./components/VacationModal";
import NoteModal from "./components/NoteModal";
import ExportModal from "./components/ExportModal";
import "./App.css";

export default function App(){
  return (
    <div>
      <Header />
      <Controls />
      <div id="dayPicker" className="hidden"></div>
      <Calendar />
      <div className="add-vacation-button">
        <button onClick={() => window.dispatchEvent(new Event("openNote"))}>Pridanie poznámky</button>
        <button onClick={() => window.dispatchEvent(new Event("openVacation"))}>Pridanie neprítomnosti</button>
        <button onClick={() => window.dispatchEvent(new Event("openExport"))}>Export</button>
      </div>
      <div className="footer-text">created by Martin&Lukas for Autoglas 2025</div>

      <TaskModal />
      <DetailsModal />
      <VacationModal />
      <NoteModal />
      <ExportModal />
    </div>
  );
}