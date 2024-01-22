import React, { useEffect, useState } from "react";
import default_image from "../images/default__image.png";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Skeleton,
  TextField,
} from "@mui/material";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { client } from "../config/axios-request";
import { useNavigate } from "react-router-dom";

function StaffDetails({ changeDisplay, selectedPromotion }) {
  let navigate = useNavigate();
  // const [uploadedImage, setUploadedImage] = useState(null);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState([]);
  const [staffData, setStaffData] = useState(null);
  const [displayNextButton, setDisplayNextButton] = useState(false);

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

  useEffect(() => {
    let timeoutId;
    if (message) {
      timeoutId = setTimeout(() => {
        setMessage([]);
      }, 6000);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [message]);

  // useEffect(() => {
  //   client
  //     .get("/staff/applied-promotion-status")
  //     .then((res) => {
  //       if (res.data.error) {
  //         if ("tokenError" in res.data) {
  //           navigate("/staff/login");
  //         } else if ("serverError" in res.data) {
  //           setError([res.data.serverError]);
  //         }
  //       } else {
  //         res.data.data.map((item) => {
  //           if (item.status === "submitted") {
  //             setMessage(["You have a submitted promotion details"]);
  //           }
  //           return item;
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       setError(["Something went wrong, please try again"]);
  //     });
  // }, []);

  useEffect(() => {
    client.get(`/staff/staff-data/${selectedPromotion.id}`).then((res) => {
      if (res.data.error) {
        if ("tokenError" in res.data) {
          navigate("/staff/login");
        } else if ("serverError" in res.data) {
          setError([res.data.serverError]);
        }
      } else {
        setStaffData(res.data.data);
        if (res.data.data.rank_being_applied_for !== null) {
          setDisplayNextButton(true);
        }
      }
    });
  }, [selectedPromotion.id]);

  function clickFileUploadInput() {
    if (selectedPromotion.status !== "unsubmitted") {
      setError([
        "You can no longer edit this submitted promotional application",
      ]);
      return;
    }
    document.getElementById("upload").click();
  }

  function handleOnchange(e) {
    setStaffData({ ...staffData, [e.target.name]: e.target.value });
  }

  function submit() {
    if (selectedPromotion.status !== "submitted") {
      setError([
        "You can no longer edit this submitted promotional application",
      ]);
      return;
    }
    let data = {
      alternate_email: staffData.alternate_email,
      linkedin_id: staffData.linkedin_id,
      area_of_specialization: staffData.area_of_specialization,
      date_of_assumption_of_duty: staffData.date_of_assumption_of_duty,
      date_of_resumption_of_duty_after_study_leave:
        staffData.date_of_resumption_of_duty_after_study_leave,
      rank_being_applied_for: staffData.rank_being_applied_for,
      promotionId: selectedPromotion.id,
      // first_name: staffData.first_name,
      // last_name: staffData.last_name,
    };

    client
      .post("/staff/update-staff-data", {
        ...data,
      })
      .then((res) => {
        if (res.data.error) {
          if ("tokenError") {
            navigate("/staff/login");
          }
        } else {
          setMessage(["Details uploaded successfully."]);
          setDisplayNextButton(true);
        }
      })
      .catch((error) => {
        setError(["Something went wrong please try again"]);
      });
  }

  function profileImageError(e) {
    e.target.src = default_image;
  }

  function fileOnchange(e) {
    if (e.target.length !== 0) {
      const split_filename = e.target.files[0].name.split(".");
      const extension = split_filename[split_filename.length - 1];
      if (extension !== "jpg" && extension !== "png" && extension !== "jpeg") {
        e.target.value = "";
        setError(["please upload an image file"]);
      } else {
        setLoading(true);
        const formData = new FormData();
        formData.append("category", "image");
        formData.append("file", e.target.files[0]);

        client
          .post("/staff/upload-profile-picture", formData)
          .then((res) => {
            if (res.data.error) {
              if ("tokenError" in res.data) {
                navigate("/staff/login");
              } else {
                setError([res.data.errorMessage]);
              }
            } else {
              setLoading(false);
              setStaffData({
                ...staffData,
                image_filename: res.data.image_filename,
                image_path: res.data.image_path,
              });
            }
          })
          .catch((error) =>
            setError(["Something went wrong please try again"])
          );
      }
    }
  }

  return (
    <div className="staff__details">
      {error.length ? (
        <Alert variant="filled" severity="error" className="error__popup popup">
          {error[0]}
        </Alert>
      ) : (
        ""
      )}
      {message.length ? (
        <Alert variant="filled" severity="success" className="popup">
          {message[0]}
        </Alert>
      ) : (
        ""
      )}
      <div className="staff__details__header">
        <h3>Staff Details</h3>
      </div>
      {staffData ? (
        <div className="main__content">
          <div className="profile__image">
            <h3>Profile Image</h3>
            <div className="image__background">
              {loading ? (
                <Skeleton
                  variant="circular"
                  width={40}
                  height={40}
                  className="skeleton__image"
                />
              ) : (
                <React.Fragment>
                  <img
                    src={`http://localhost:3001/files/images/${staffData.image_filename}`}
                    alt=""
                    onError={(e) => profileImageError(e)}
                  />
                  <Avatar className="upload__icon">
                    <AiOutlineCloudUpload onClick={clickFileUploadInput} />
                  </Avatar>
                </React.Fragment>
              )}
            </div>
          </div>
          <div className="staff__data">
            <div className="group">
              <div className="input__field">
                <TextField
                  id="outlined-basic"
                  name="first_name"
                  label="First Name"
                  variant="outlined"
                  defaultValue={staffData.first_name}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
              <div className="input__field">
                <TextField
                  id="outlined-basic"
                  name="last_name"
                  label="Last Name"
                  variant="outlined"
                  defaultValue={staffData.last_name}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
              <div className="input__field">
                <TextField
                  id="outlined-basic"
                  label="SP number"
                  variant="outlined"
                  defaultValue={staffData.sp_number}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
            </div>
            <div className="group">
              <div className="input__field">
                <TextField
                  id="outlined-basic"
                  label="Department"
                  name="department"
                  variant="outlined"
                  defaultValue={staffData.department}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
              <div className="input__field">
                <TextField
                  id="outlined-basic"
                  label="Faculty"
                  variant="outlined"
                  name="faculty"
                  defaultValue={staffData.faculty}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </div>
              <div className="input__field">
                <TextField
                  id="outlined-basic"
                  label="Institutional Email"
                  variant="outlined"
                  name="institutional_email"
                  defaultValue={staffData.institutional_email}
                  onChange={(e) => {
                    handleOnchange(e);
                  }}
                />
              </div>
            </div>
            <div className="group">
              <div className="input__field">
                <TextField
                  id="outlined-basic"
                  label="Alternate Email"
                  variant="outlined"
                  name="alternate_email"
                  defaultValue={staffData.alternate_email}
                  onChange={(e) => {
                    handleOnchange(e);
                  }}
                />
              </div>
              <div className="input__field">
                <TextField
                  id="outlined-basic"
                  label="Linkedin ID"
                  variant="outlined"
                  name="linkedin_id"
                  defaultValue={staffData.linkedin_id}
                  onChange={(e) => {
                    handleOnchange(e);
                  }}
                />
              </div>
              <div className="input__field">
                <TextField
                  id="outlined-basic"
                  label="Area of Specialization"
                  variant="outlined"
                  defaultValue={staffData.area_of_specialization}
                  name="area_of_specialization"
                  onChange={(e) => {
                    handleOnchange(e);
                  }}
                />
              </div>
            </div>
            <div className="group">
              <div className="input__field">
                <TextField
                  id="outlined-basic"
                  label="Date of assumption of duty"
                  variant="outlined"
                  defaultValue={staffData.date_of_assumption_of_duty}
                  name="date_of_assumption_of_duty"
                  onChange={(e) => {
                    handleOnchange(e);
                  }}
                />
              </div>
              <div className="input__field">
                <TextField
                  id="outlined-basic"
                  label="Date of resumption after study leave"
                  variant="outlined"
                  defaultValue={
                    staffData.date_of_resumption_of_duty_after_study_leave
                  }
                  name="date_of_resumption_of_duty_after_study_leave"
                  onChange={(e) => {
                    handleOnchange(e);
                  }}
                />
              </div>

              <div className="input__field">
                <TextField
                  id="outlined-basdic"
                  label="Rank being applied for"
                  variant="outlined"
                  defaultValue={staffData.rank_being_applied_for}
                  name="rank_being_applied_for"
                  onChange={(e) => {
                    handleOnchange(e);
                  }}
                />
              </div>
            </div>

            <div className="group">
              <div className="action__buttons">
                <Button variant="contained" onClick={submit}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading__background">
          <Box>
            <CircularProgress />
          </Box>
        </div>
      )}
      <input
        className="hide"
        type="file"
        id="upload"
        name="image"
        onChange={fileOnchange}
      />
    </div>
  );
}

export default StaffDetails;
