import { TableContainer } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MdOutlineDelete } from "react-icons/md";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineAddCircle } from "react-icons/md";
import { Alert, Avatar, Input } from "@mui/material";
import { BiCheck } from "react-icons/bi";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import { styled } from "@mui/material/styles";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { useNavigate } from "react-router-dom";
import { client } from "../../config/axios-request";

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

function UpdateExperience({ selectedPromotion }) {
  let navigate = useNavigate();

  const [experienceDetails, setExperienceDetails] = useState([]);
  const [error, setError] = useState([]);
  const [promotionId, setPromotionId] = useState([]);

  useEffect(() => {
    client
      .get(`/staff/experience/${selectedPromotion.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError(["Something went wrong, please try again"]);
          }
        } else {
          setPromotionId(res.data.promotionId);
          setExperienceDetails(
            res.data.data.map((item, index) => {
              return {
                ...item,
                countingId: index + 1,
              };
            })
          );
        }
      })
      .catch((err) => {
        setError(["Something went wrong, please try again"]);
      });
  }, []);

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

  function addExperienceRow() {
    let lastRow = experienceDetails[experienceDetails.length - 1];
    if (lastRow) {
      if (
        lastRow.designation === "" ||
        lastRow.start_date === "" ||
        lastRow.end_date === "" ||
        lastRow.institution === "" ||
        lastRow.nature_of_duty === ""
      ) {
        setError(["Please fill last row completely"]);
        return;
      }
    }

    setExperienceDetails([
      ...experienceDetails,
      {
        id: experienceDetails.length + 1,
        countingId: experienceDetails.length + 1,
        designation: "",
        institution: "",
        nature_of_duty: "",
        start_date: "",
        end_date: "",
        editing: true,
      },
    ]);
  }

  function save(countingId, saveType) {
    let lastRow = experienceDetails[experienceDetails.length - 1];
    if (
      lastRow.designation === "" ||
      lastRow.start_date === "" ||
      lastRow.end_date === "" ||
      lastRow.institution === "" ||
      lastRow.nature_of_duty === ""
    ) {
      setError(["Please fill all fields"]);
      return;
    }

    if (saveType === "new") {
      client
        .post("/staff/add-experience-details", { ...lastRow, promotionId })
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError([res.data.errorMessage]);
            }
          } else {
            setExperienceDetails(
              experienceDetails.map((item) => {
                if (item.countingId === countingId) {
                  return {
                    ...item,
                    id: res.data.insertId,
                    editing: false,
                  };
                }
                return item;
              })
            );
          }
        })
        .catch((error) => {
          setError(["Something went wrong please try again"]);
        });
    } else {
      let itemToEdit = experienceDetails.filter(
        (item) => item.countingId === countingId
      )[0];

      client
        .post("/staff/edit-experience-details", itemToEdit)
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError(["Something went wrong please try again"]);
            }
          } else {
            setExperienceDetails(
              experienceDetails.map((item) => {
                if (item.countingId === countingId) {
                  return {
                    ...item,
                    editing: false,
                  };
                }
                return item;
              })
            );
          }
        })
        .catch((error) => {
          setError(["Something went wrong please try again"]);
        });
    }
  }

  function deleteExperienceDetails(countingId) {
    let itemToDelete = experienceDetails.filter(
      (item) => item.countingId === countingId
    )[0];
    client
      .delete(`/staff/delete-experience-details/${itemToDelete.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError([res.data.errorMessage]);
          }
        } else {
          let filteredData = experienceDetails.filter(
            (item) => item.countingId !== countingId
          );
          setExperienceDetails(
            filteredData.map((item, index) => {
              return {
                ...item,
                countingId: index + 1,
              };
            })
          );
        }
      })
      .catch((error) => {
        setError(["Something went wrong please try again"]);
      });
  }

  function editExperienceDetails(countingId) {
    setExperienceDetails(
      experienceDetails.map((item) => {
        if (item.countingId === countingId) {
          return {
            ...item,
            editing: true,
            saveType: "edit",
          };
        }
        return item;
      })
    );
  }

  function editDetails(e, countingId, field) {
    setExperienceDetails(
      experienceDetails.map((item) => {
        if (item.countingId === countingId) {
          if (field === "designation") {
            return {
              ...item,
              designation: e.target.value,
            };
          } else if (field === "start-date") {
            return {
              ...item,
              start_date: e.target.value,
            };
          } else if (field === "end-date") {
            return {
              ...item,
              end_date: e.target.value,
            };
          } else if (field === "institution") {
            return {
              ...item,
              institution: e.target.value,
            };
          } else if (field === "nature-of-duty") {
            return {
              ...item,
              nature_of_duty: e.target.value,
            };
          }
        }
        return item;
      })
    );
  }
  return (
    <div className="update__experience">
      <div className="update__experience__header">
        <h3>Experience</h3>
      </div>
      <div className="experience__details">
        {experienceDetails.length ? (
          <div className="uploaded__details">
            {error.length ? (
              <Alert variant="filled" severity="error" className="error__popup">
                {error[0]}
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
                      <StyledTableCell align="left">
                        Designation
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        Institution
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        Nature of Duty
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        Start Date
                      </StyledTableCell>
                      <StyledTableCell align="center">End Date</StyledTableCell>
                      <StyledTableCell align="right">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  {experienceDetails.map((item) => {
                    return (
                      <TableBody key={item.countingId} className="table__row">
                        <StyledTableRow>
                          <StyledTableCell component="th" scope="row">
                            {item.countingId}.
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.designation}
                                inputProps={{ "aria-label": "designation" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "designation")
                                }
                              />
                            ) : (
                              item.designation
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.institution}
                                inputProps={{ "aria-label": "class of degree" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "institution")
                                }
                              />
                            ) : (
                              item.institution
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.nature_of_duty}
                                inputProps={{ "aria-label": "nature of duty" }}
                                onChange={(e) =>
                                  editDetails(
                                    e,
                                    item.countingId,
                                    "nature-of-duty"
                                  )
                                }
                              />
                            ) : (
                              item.nature_of_duty
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.start_date}
                                inputProps={{ "aria-label": "Start Date" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "start-date")
                                }
                              />
                            ) : (
                              item.start_date
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.end_date}
                                inputProps={{ "aria-label": "End Date" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "end-date")
                                }
                              />
                            ) : (
                              item.end_date
                            )}
                          </StyledTableCell>
                          <StyledTableCell>
                            <div className="action__buttons">
                              {item.editing ? (
                                <React.Fragment>
                                  {item.saveType === "edit" ? (
                                    <BiCheck
                                      className="icon check__icon"
                                      onClick={() =>
                                        save(item.countingId, "edit")
                                      }
                                    />
                                  ) : (
                                    <BiCheck
                                      className="icon check__icon"
                                      onClick={() =>
                                        save(item.countingId, "new")
                                      }
                                    />
                                  )}
                                  <MdOutlineDelete
                                    className="icon delete__icon"
                                    onClick={() =>
                                      deleteExperienceDetails(item.countingId)
                                    }
                                  />
                                </React.Fragment>
                              ) : selectedPromotion.status === "unsubmitted" ? (
                                <React.Fragment>
                                  <MdOutlineDelete
                                    className="icon delete__icon"
                                    onClick={() =>
                                      deleteExperienceDetails(item.countingId)
                                    }
                                  />
                                  <AiOutlineEdit
                                    className="icon edit__icon"
                                    onClick={() =>
                                      editExperienceDetails(item.countingId)
                                    }
                                  />
                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  <MdOutlineDelete className="delete__icon fade__icon" />
                                  <AiOutlineEdit className="fade__icon edit__icon" />
                                </React.Fragment>
                              )}
                            </div>
                          </StyledTableCell>
                        </StyledTableRow>
                      </TableBody>
                    );
                  })}
                </Table>
              </TableContainer>
              {selectedPromotion.status === "unsubmitted" ? (
                <Avatar className="add__icon__background">
                  <MdOutlineAddCircle
                    className="icon add__icon"
                    onClick={addExperienceRow}
                  />
                </Avatar>
              ) : (
                ""
              )}
            </div>
            <div className="total__points">
              <h3>TotalPoints: 0</h3>
            </div>
          </div>
        ) : (
          <div className="no__details">
            <h3>No educational details uploaded</h3>
            <p>Click on the "add" button below to add</p>
            <Avatar className="icon__background">
              <MdOutlineAddCircle
                className="icon add__icon"
                onClick={addExperienceRow}
              />
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateExperience;
