import React from "react";

function Sidebar({ changeDisplay }) {
  return (
    <div className="sidebar">
      <div className="navigations">
        <div
          className="nav__button"
          onClick={() => changeDisplay("applications")}
        >
          <span>Staff Promotional Applications</span>
        </div>
        <div className="nav__button" onClick={() => changeDisplay("points")}>
          <span>Promotional Points</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
