import React, { useState } from "react";
import Header from "../Header";
import Sidebar from "./Sidebar";
import OverallAdminApplications from "./OverallAdminApplications";

function OverallAdminHome() {
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
        {displayBlock === "applications" && <OverallAdminApplications />}
      </div>
    </div>
  );
}

export default OverallAdminHome;
