import React, { useEffect, useState } from "react";
import { client } from "../../config/axios-request";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import { styled } from "@mui/material/styles";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { MdOutlineDelete } from "react-icons/md";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineAddCircle } from "react-icons/md";
import { Alert, Avatar, Input } from "@mui/material";
import { BiCheck } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));
function UnderGraduateSupervisionTable() {
  let navigate = useNavigate();
  let undergraduateSupervisionData = [
    {
      id: 1,
      name: "Ibrahim Ahmad",
      admissionNumber: "1610310063",
      projectTitle:
        "Time Series analysis and forecast on seasonality of human Birth(2021)",
      editing: false,
    },
  ];
  const [undergraduateSupervisionDetails, setUnderGraduateSupervisionDetails] =
    useState([]);
  const [underGraduateTableError, setUnderGraduateTableError] = useState([]);

  function addUndergraduateSupervisionRow() {
    let lastRow =
      undergraduateSupervisionDetails[
        undergraduateSupervisionDetails.length - 1
      ];

    if (
      lastRow.admissionNumber === "" ||
      lastRow.name === "" ||
      lastRow.projectTitle === ""
    ) {
      setUnderGraduateTableError(["Please fill last row completely"]);
      return;
    }

    setUnderGraduateSupervisionDetails([
      ...undergraduateSupervisionDetails,
      {
        id: undergraduateSupervisionDetails.length + 1,
        name: "",
        admissionNumber: "",
        projectTitle: "",
        editing: true,
      },
    ]);
  }

  function saveUndergraduateSupervisionData(id) {
    let lastRow =
      undergraduateSupervisionDetails[
        undergraduateSupervisionDetails.length - 1
      ];

    if (
      lastRow.admissionNumber === "" ||
      lastRow.name === "" ||
      lastRow.projectTitle === ""
    ) {
      setUnderGraduateTableError(["Please fill all Fields"]);
      return;
    }

    setUnderGraduateSupervisionDetails(
      undergraduateSupervisionDetails.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            editing: false,
          };
        }
        return item;
      })
    );
  }

  function deleteUndergraduateSupervisionData(id) {
    setUnderGraduateSupervisionDetails(
      undergraduateSupervisionDetails.filter((item) => item.id !== id)
    );
  }

  function editUndergraduateSupervisionData(id) {
    setUnderGraduateSupervisionDetails(
      undergraduateSupervisionDetails.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            editing: true,
          };
        }
        return item;
      })
    );
  }

  function editUndergraduateSupervisionDataActual(e, id, field) {
    setUnderGraduateSupervisionDetails(
      undergraduateSupervisionDetails.map((item) => {
        if (item.id === id) {
          if (field === "name") {
            return {
              ...item,
              name: e.target.value,
            };
          } else if (field === "admission-number") {
            return {
              ...item,
              admissionNumber: e.target.value,
            };
          } else if (field === "project-title") {
            return {
              ...item,
              projectTitle: e.target.value,
            };
          }
        }
        return item;
      })
    );
  }

  useEffect(() => {
    let timeoutId;
    if (underGraduateTableError) {
      timeoutId = setTimeout(() => {
        setUnderGraduateTableError([]);
      }, 6000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [underGraduateTableError]);

  useEffect(() => {
    client
      .get("/staff/undergraduate-supervision")
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setUnderGraduateTableError([
              "Something went wrong, please try again",
            ]);
          }
        } else {
          setUnderGraduateSupervisionDetails(
            res.data.data.map((item, index) => {
              return {
                ...item,
                countingId: index + 1,
              };
            })
          );
        }
      })
      .catch((error) => {
        setUnderGraduateTableError(["Something went wrong, please try again"]);
      });
  }, []);
  return (
    <div>
      {undergraduateSupervisionData.length ? (
        <div className="uploaded__details">
          {underGraduateTableError.length ? (
            <Alert variant="filled" severity="error" className="error__popup">
              {underGraduateTableError[0]}
            </Alert>
          ) : (
            ""
          )}
          <div className="details__table">
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell width={1}>S/N</StyledTableCell>
                    <StyledTableCell align="left">Name</StyledTableCell>
                    <StyledTableCell align="right">
                      Admission Number
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      Project Title
                    </StyledTableCell>
                    <StyledTableCell align="right">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                {undergraduateSupervisionDetails.map((item) => {
                  return (
                    <TableBody key={item.id} className="table__row">
                      <StyledTableRow>
                        <StyledTableCell component="th" scope="row">
                          {item.id}.
                        </StyledTableCell>
                        <StyledTableCell align="left">
                          {item.editing ? (
                            <Input
                              className="input"
                              defaultValue={item.name}
                              inputProps={{ "aria-label": "name" }}
                              onChange={(e) =>
                                editUndergraduateSupervisionDataActual(
                                  e,
                                  item.id,
                                  "name"
                                )
                              }
                            />
                          ) : (
                            item.name
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {item.editing ? (
                            <Input
                              className="input"
                              defaultValue={item.admissionNumber}
                              inputProps={{
                                "aria-label": "admission number",
                              }}
                              onChange={(e) =>
                                editUndergraduateSupervisionDataActual(
                                  e,
                                  item.id,
                                  "admission-number"
                                )
                              }
                            />
                          ) : (
                            item.admissionNumber
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {item.editing ? (
                            <Input
                              className="input"
                              defaultValue={item.projectTitle}
                              inputProps={{ "aria-label": "project title" }}
                              onChange={(e) =>
                                editUndergraduateSupervisionDataActual(
                                  e,
                                  item.id,
                                  "project-title"
                                )
                              }
                            />
                          ) : (
                            item.projectTitle
                          )}
                        </StyledTableCell>
                        <StyledTableCell>
                          <div className="action__buttons">
                            {item.editing ? (
                              <>
                                <BiCheck
                                  className="icon check__icon"
                                  onClick={() =>
                                    saveUndergraduateSupervisionData(item.id)
                                  }
                                />
                                <MdOutlineDelete
                                  className="icon delete__icon"
                                  onClick={() =>
                                    deleteUndergraduateSupervisionData(item.id)
                                  }
                                />
                              </>
                            ) : (
                              <>
                                <MdOutlineDelete
                                  className="icon delete__icon"
                                  onClick={() =>
                                    deleteUndergraduateSupervisionData(item.id)
                                  }
                                />
                                <AiOutlineEdit
                                  className="icon edit__icon"
                                  onClick={() =>
                                    editUndergraduateSupervisionData(item.id)
                                  }
                                />
                              </>
                            )}
                          </div>
                        </StyledTableCell>
                      </StyledTableRow>
                    </TableBody>
                  );
                })}
              </Table>
            </TableContainer>
            <Avatar className="add__icon__background">
              <MdOutlineAddCircle
                className="icon add__icon"
                onClick={addUndergraduateSupervisionRow}
              />
            </Avatar>
          </div>
          <div className="total__points">
            <h3>TotalPoints: 0</h3>
          </div>
        </div>
      ) : (
        <div className="no__details">
          <h3>No Undergraduate supervision details uploaded</h3>
          <p>Click on the "add" button below to add</p>
        </div>
      )}
    </div>
  );
}

export default UnderGraduateSupervisionTable;
