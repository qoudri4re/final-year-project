import {
  Alert,
  Button,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import Link from "@mui/material/Link";
import { client } from "../config/axios-request";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

function Register() {
  let navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    sp_no: "",
    phoneNumber: "",
    institutionalEmail: "",
    alternateEmail: "",
    department: "",
    faculty: "",
    password: "",
    initialRank: "",
  });

  const [errors, setErrors] = useState([]);

  useEffect(() => {
    let timeoutId;
    if (errors) {
      timeoutId = setTimeout(() => {
        setErrors([]);
      }, 4000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [errors]);

  function handleOnchange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function register() {
    if (
      formData.firstName === "" ||
      formData.lastName === "" ||
      formData.sp_no === "" ||
      formData.phoneNumber === "" ||
      formData.institutionalEmail === "" ||
      formData.alternateEmail === "" ||
      formData.department === "" ||
      formData.faculty === "" ||
      formData.password === "" ||
      formData.initialRank === ""
    ) {
      setErrors([...errors, "All input fields must be filled!"]);
      return;
    }
    client.post("/staff/register", formData).then((res) => {
      if (res.data.error) {
        setErrors(res.data.errors);
      } else {
        navigate("/staff/index");
      }
    });
  }

  function handleRankChange(e) {
    setFormData({ ...formData, initialRank: e.target.value });
  }

  return (
    <div className="form__background">
      <div className="register__form form">
        <div className="form__header">
          <p>Register</p>
        </div>
        {errors.length !== 0 ? (
          <div className="error__messages">
            {" "}
            {errors.map((item) => {
              return (
                <Alert variant="filled" severity="error" key={uuidv4()}>
                  {item}
                </Alert>
              );
            })}
          </div>
        ) : (
          ""
        )}
        <TextField
          label="First Name"
          variant="outlined"
          name="firstName"
          value={formData.firstName}
          onChange={(e) => {
            handleOnchange(e);
          }}
        />
        <TextField
          label="Last Name"
          variant="outlined"
          value={formData.lastName}
          name="lastName"
          onChange={(e) => {
            handleOnchange(e);
          }}
        />
        <div className="row">
          <TextField
            label="SP No"
            variant="outlined"
            value={formData.sp_no}
            name="sp_no"
            onChange={(e) => {
              handleOnchange(e);
            }}
          />
          <TextField
            label="Phone Number"
            variant="outlined"
            value={formData.phoneNumber}
            name="phoneNumber"
            onChange={(e) => {
              handleOnchange(e);
            }}
          />
        </div>

        <div className="row">
          <TextField
            label="Institutional Email"
            variant="outlined"
            value={formData.institutionalEmail}
            name="institutionalEmail"
            onChange={(e) => {
              handleOnchange(e);
            }}
          />
          <TextField
            label="Alternate Email"
            variant="outlined"
            value={formData.alternateEmail}
            name="alternateEmail"
            onChange={(e) => {
              handleOnchange(e);
            }}
          />
        </div>

        <div className="row">
          <TextField
            label="Department"
            variant="outlined"
            value={formData.department}
            name="department"
            onChange={(e) => {
              handleOnchange(e);
            }}
          />
          <TextField
            label="Faculty"
            variant="outlined"
            value={formData.faculty}
            name="faculty"
            onChange={(e) => {
              handleOnchange(e);
            }}
          />
        </div>
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => {
            handleOnchange(e);
          }}
        />
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={formData.initialRank}
          label="Age"
          onChange={(e) => handleRankChange(e)}
        >
          <MenuItem value={"Graduate Assistant"}>Graduate assistant</MenuItem>
          <MenuItem value={"Assistant Lecturer"}>Assistant lecturer</MenuItem>
          <MenuItem value={"Lecturer II"}>Lecturer II</MenuItem>
          <MenuItem value={"Lecturer I"}>Lecturer I</MenuItem>
          <MenuItem value={"Senior Lecturer"}>Senior Lecturer</MenuItem>
          <MenuItem value={"Associate professor"}>Associate professor</MenuItem>
          <MenuItem value={"Professor"}>professor</MenuItem>
        </Select>
        <span className="info__text">
          Already have an account?
          <Link href="/staff/login" underline="hover">
            {" "}
            Login
          </Link>
        </span>
        <Button variant="contained" size="large" onClick={register}>
          Register
        </Button>
      </div>
    </div>
  );
}

export default Register;
