import React, { useState } from "react";
import Header from "../Header";
import Sidebar from "./Sidebar";
import ApplicationsFad from "./ApplicationsFad";

function FacultyAdminHome() {
  const [displayBlock, setDisplayBlock] = useState("applications");

  function changeDisplay(display) {
    if (displayBlock === display) return;
    setDisplayBlock(display);
  }

  return (
    <div className="homepage">
      <Header />
      <div className="contents">
        <Sidebar changeDisplay={changeDisplay} />
        {displayBlock === "applications" && <ApplicationsFad />}
      </div>
    </div>
  );
}

export default FacultyAdminHome;
