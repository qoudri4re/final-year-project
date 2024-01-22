import React from "react";
import default_image from "../images/default__image.png";

function HomeSidebar({ userData }) {
  return (
    <div className="home__sidebar">
      <div className="profile__image">
        <div className="image__background">
          <img src={default_image} alt="" />
        </div>
      </div>
      <div className="staff__data">
        <div className="row">
          <h4>Name: </h4>
          <p>
            {userData?.first_name} {userData?.last_name}
          </p>
        </div>
        <div className="row">
          <h4>SP Number: </h4>
          <p>{userData?.sp_number}</p>
        </div>
        <div className="row">
          <h4>Institutional Email:</h4>
          <p>{userData?.institutional_email}</p>
        </div>
        <div className="row">
          <h4>Faculty:</h4>
          <p>{userData?.faculty}</p>
        </div>
        <div className="row">
          <h4>Department</h4>
          <p>{userData?.department}</p>
        </div>
      </div>
    </div>
  );
}

export default HomeSidebar;
