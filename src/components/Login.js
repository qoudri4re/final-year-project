import { Alert, Button, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import Link from "@mui/material/Link";
import { v4 as uuidv4 } from "uuid";
import { client } from "../config/axios-request";
import { useNavigate } from "react-router-dom";

function Login() {
  let navigate = useNavigate();
  const [formData, setFormData] = useState({
    institutionalEmail: "",
    password: "",
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

  function login() {
    if (formData.institutionalEmail === "" || formData.password === "") {
      setErrors([...errors, "All input fields must be field"]);
    } else {
      client.post("/staff/login", formData).then((res) => {
        if (res.data.error) {
          setErrors([res.data.errorMessage]);
        } else {
          navigate("/staff/index");
        }
      });
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
          id="outlined-basic"
          label="Institutional Email"
          variant="outlined"
          name="institutionalEmail"
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
        <span className="info__text">
          Don't have an account?
          <Link href="/staff/register" underline="hover">
            {" "}
            Register
          </Link>
        </span>
        <Button variant="contained" size="large" onClick={login}>
          Login
        </Button>
      </div>
    </div>
  );
}

export default Login;
