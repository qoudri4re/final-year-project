import React, { useEffect, useState } from "react";
import Header from "./Header";
import { Link, useNavigate } from "react-router-dom";
import StaffDetails from "./StaffDetails";
import HomeSidebar from "./HomeSidebar";
import { client } from "../config/axios-request";

function Home() {
  let navigate = useNavigate();
  const [updateBasicProfile, setUpdateBasicProfile] = useState(false);
  const [userData, setUserData] = useState(null);

  function toogleUpdateBasicProfile() {
    setUpdateBasicProfile(!updateBasicProfile);
  }

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

  return (
    <div className="homepage">
      <Header />
      <div className="content">
        <div className="sidebar">
          <Link to={"/staff/apply-for-promotion"} className="nav__button">
            <span>Apply for promotion</span>
          </Link>
        </div>
        {updateBasicProfile ? (
          <StaffDetails />
        ) : (
          <div className="welcome__page">
            <div className="left__content">
              <div className="welcome__page__header">
                <h2>
                  Welcome, {userData?.first_name} {userData?.last_name}
                </h2>
              </div>
            </div>
            <HomeSidebar userData={userData} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
