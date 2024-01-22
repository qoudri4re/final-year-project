import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import StaffDetails from "./StaffDetails";
import UpdateCommunityService from "./SidebarActions/UpdateCommunityService";
import UpdateComputerLiteracy from "./SidebarActions/UpdateComputerLiteracy";
import UpdateConferencesAttended from "./SidebarActions/UpdateConferencesAttended";
import UpdateEducation from "./SidebarActions/UpdateEducation";
import UpdatePublications from "./SidebarActions/UpdatePublications";
import UpdateResearchPapers from "./SidebarActions/UpdateResearchPapers";
import UpdateSupervision from "./SidebarActions/UpdateSupervision";
import UpdateExperience from "./SidebarActions/UpdateExperience";
import UpdateCoursesTaught from "./SidebarActions/UpdateCoursesTaught";
import PromotionalApplications from "./SidebarActions/PromotionalApplications";
import { Alert } from "@mui/material";

function UpdateProfile() {
  const [displayBlock, setDisplayBlock] = useState("promotional-applications");
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [error, setError] = useState([]);

  // useEffect(() => {

  // })

  function changeDisplay(display) {
    if (selectedPromotion) {
      if (displayBlock === display) return;
      setDisplayBlock(display);
    } else {
      setError(["Please select a promotional application first"]);
    }
  }

  useEffect(() => {
    let timeoutId;
    if (error) {
      timeoutId = setTimeout(() => {
        setError([]);
      }, 6000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [error]);

  return (
    <>
      <Header />
      <div className="contents">
        {error.length ? (
          <Alert variant="filled" severity="error" className="error__popup">
            {error[0]}
          </Alert>
        ) : (
          ""
        )}
        <Sidebar
          changeDisplay={changeDisplay}
          displayBlock={displayBlock}
          selectedPromotion={selectedPromotion}
        />
        {displayBlock === "staff-details" && (
          <StaffDetails
            changeDisplay={changeDisplay}
            selectedPromotion={selectedPromotion}
          />
        )}
        {displayBlock === "promotional-applications" && (
          <PromotionalApplications
            setSelectedPromotion={setSelectedPromotion}
          />
        )}
        {displayBlock === "community-service" && (
          <UpdateCommunityService selectedPromotion={selectedPromotion} />
        )}
        {displayBlock === "computer-literacy" && (
          <UpdateComputerLiteracy selectedPromotion={selectedPromotion} />
        )}
        {displayBlock === "conferences" && (
          <UpdateConferencesAttended selectedPromotion={selectedPromotion} />
        )}
        {displayBlock === "education" && (
          <UpdateEducation selectedPromotion={selectedPromotion} />
        )}
        {displayBlock === "experience" && (
          <UpdateExperience selectedPromotion={selectedPromotion} />
        )}
        {displayBlock === "publications" && (
          <UpdatePublications selectedPromotion={selectedPromotion} />
        )}
        {displayBlock === "research-papers" && (
          <UpdateResearchPapers selectedPromotion={selectedPromotion} />
        )}
        {displayBlock === "supervision" && (
          <UpdateSupervision selectedPromotion={selectedPromotion} />
        )}
        {displayBlock === "courses-taught" && (
          <UpdateCoursesTaught selectedPromotion={selectedPromotion} />
        )}
      </div>
    </>
  );
}

export default UpdateProfile;
