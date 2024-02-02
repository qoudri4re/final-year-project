import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { client } from "../../config/axios-request";
import { useNavigate } from "react-router-dom";
import { Alert, Button, TextField } from "@mui/material";

function OverallAdminLogin() {
  let navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleOnchange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function login() {
    if (formData.email !== "" && formData.password !== "") {
      client
        .post("/admin/overall-admin/login", formData)
        .then((res) => {
          if (res.data.error) {
            setErrors([res.data.errorMessage]);
          } else {
            navigate("/super-admin/index");
          }
        })
        .catch((error) => console.log(error));
    } else {
      setErrors(["All input fields must be filled"]);
    }
  }

  return (
    <div className="form__background">
      <div className="login__form form">
        <div className="form__header">
          <p>Login</p>
        </div>
        {errors.length !== 0 ? (
          <div className="error__messages">
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
          id="outlined-basic"
          label="Institutional Email"
          variant="outlined"
          name="email"
          value={formData.institutionalEmail}
          onChange={(e) => {
            handleOnchange(e);
          }}
        />
        <TextField
          id="outlined-basic"
          label="Password"
          variant="outlined"
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => {
            handleOnchange(e);
          }}
        />
        <Button variant="contained" size="large" onClick={login}>
          Login
        </Button>
      </div>
    </div>
  );
}

export default OverallAdminLogin;
