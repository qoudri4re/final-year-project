import React, { useEffect, useState } from "react";
import default_image from "../images/default__image.png";
import { client } from "../config/axios-request";
import { useNavigate } from "react-router-dom";

function Sidebar({ changeDisplay, displayBlock, selectedPromotion }) {
  let navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    client
      .get("/staff/staff-details")
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          }
        } else {
          setUserData(res.data.data);
        }
      })
      .catch();
  }, []);

  function profileImageError(e) {
    e.target.src = default_image;
  }

  return (
    <div className="sidebar">
      <div className="profile__card">
        <img
          src={
            userData
              ? `http://localhost:3001/files/images/${userData.image_filename}`
              : default_image
          }
          alt=""
          onError={(e) => profileImageError(e)}
        />
        <h2>
          {userData?.first_name} {userData?.last_name}
        </h2>
      </div>
      <div className="navigations">
        <div
          className={`nav__button ${
            displayBlock === `promotional-applications` ? `active` : ``
          }`}
          onClick={() => changeDisplay("promotional-applications")}
        >
          <span>Promotional Applications</span>
        </div>
        <div
          className={`nav__button ${
            displayBlock === `staff-details` ? `active` : ``
          } ${selectedPromotion ? "" : "not__allowed"}`}
          onClick={() => changeDisplay("staff-details")}
        >
          <span>Staff details</span>
        </div>
        <div
          className={`nav__button ${
            displayBlock === `education` ? `active` : ``
          } ${selectedPromotion ? "" : "not__allowed"}`}
          onClick={() => changeDisplay("education")}
        >
          <span>Education</span>
        </div>
        <div
          className={`nav__button ${
            displayBlock === `experience` ? `active` : ``
          } ${selectedPromotion ? "" : "not__allowed"}`}
          onClick={() => changeDisplay("experience")}
        >
          <span>Experience</span>
        </div>
        <div
          className={`nav__button ${
            displayBlock === `supervision` ? `active` : ``
          } ${selectedPromotion ? "" : "not__allowed"}`}
          onClick={() => changeDisplay("supervision")}
        >
          <span>Supervision</span>
        </div>
        <div
          className={`nav__button ${
            displayBlock === `courses-taught` ? `active` : ``
          } ${selectedPromotion ? "" : "not__allowed"}`}
          onClick={() => changeDisplay("courses-taught")}
        >
          <span>Courses Taught</span>
        </div>
        <div
          className={`nav__button ${
            displayBlock === `publications` ? `active` : ``
          } ${selectedPromotion ? "" : "not__allowed"}`}
          onClick={() => changeDisplay("publications")}
        >
          <span>Publications</span>
        </div>
        <div
          className={`nav__button ${
            displayBlock === `research-papers` ? `active` : ``
          } ${selectedPromotion ? "" : "not__allowed"}`}
          onClick={() => changeDisplay("research-papers")}
        >
          <span>Research papers</span>
        </div>
        <div
          className={`nav__button ${
            displayBlock === `computer-literacy` ? `active` : ``
          } ${selectedPromotion ? "" : "not__allowed"}`}
          onClick={() => changeDisplay("computer-literacy")}
        >
          <span>Computer Literacy</span>
        </div>
        <div
          className={`nav__button ${
            displayBlock === `community-service` ? `active` : ``
          } ${selectedPromotion ? "" : "not__allowed"}`}
          onClick={() => changeDisplay("community-service")}
        >
          <span>Community Service</span>
        </div>
        <div
          className={`nav__button ${
            displayBlock === `conferences` ? `active` : ``
          } ${selectedPromotion ? "" : "not__allowed"}`}
          onClick={() => changeDisplay("conferences")}
        >
          <span>Conferences Attended</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
