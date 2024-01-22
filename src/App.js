import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Register from "./components/Register";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline, createTheme } from "@mui/material";
import Home from "./components/Home";
import UpdateProfile from "./components/UpdateProfile";
import AdminLogin from "./components/admin/AdminLogin";
import AdminHome from "./components/admin/AdminHome";
import AdminViewApplication from "./components/admin/AdminViewApplication";
import FacultyAdminLogin from "./components/faculty-admin/FacultyAdminLogin";
import FacultyAdminHome from "./components/faculty-admin/FacultyAdminHome";
import FadAdminViewApplication from "./components/faculty-admin/FadAdminViewApplication";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route exact path="/staff/login" element={<Login />} />
            <Route exact path="/staff/register" element={<Register />} />
            <Route
              exact
              path="/staff/apply-for-promotion"
              element={<UpdateProfile />}
            />
            <Route exact path="/staff/index" element={<Home />} />
            <Route exact path="/admin/login" element={<AdminLogin />} />
            <Route exact path="/admin/index" element={<AdminHome />} />
            <Route exact path="/fad/index" element={<FacultyAdminHome />} />
            <Route
              exact
              path="/admin/view-application/:spNumber/:promotionId"
              element={<AdminViewApplication />}
            />
            <Route
              exact
              path="/fad/view-application/:spNumber/:promotionId"
              element={<FadAdminViewApplication />}
            />
            <Route exact path="/fad/login" element={<FacultyAdminLogin />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
