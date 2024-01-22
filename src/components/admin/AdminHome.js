import React, { useState } from "react";
import Header from "../Header";
import Sidebar from "./Sidebar";
import Applications from "./sidebarActions/Applications";

function AdminHome() {
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
        {displayBlock === "applications" && <Applications />}
      </div>
    </div>
  );
}

export default AdminHome;
