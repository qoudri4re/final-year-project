import React, { useEffect, useState } from "react";
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
import { client } from "../../config/axios-request";
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

function UpdateEducation({ selectedPromotion }) {
  let navigate = useNavigate();

  const [educationalDetails, setEducationalDetails] = useState([]);
  const [error, setError] = useState([]);
  const [promotionId, setPromotionId] = useState(null);

  useEffect(() => {
    client
      .get(`/staff/education/${selectedPromotion.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          }
        } else {
          setPromotionId(res.data.promotionId);
          setEducationalDetails(
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
        setError(["Something went wrong please try again"]);
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

  function addEducationRow() {
    let lastRow = educationalDetails[educationalDetails.length - 1];

    if (lastRow) {
      if (
        lastRow.class_of_degree === "" ||
        lastRow.date_of_award === "" ||
        lastRow.degree === "" ||
        lastRow.institution === ""
      ) {
        setError(["Please fill Last row completely"]);
        return;
      }
    }
    setEducationalDetails([
      ...educationalDetails,
      {
        id: educationalDetails.length + 1,
        countingId: educationalDetails.length + 1,
        degree: "",
        class_of_degree: "",
        institution: "",
        date_of_award: "",
        editing: true,
      },
    ]);
  }

  function save(countingId, saveType) {
    let lastRow = educationalDetails[educationalDetails.length - 1];
    if (
      lastRow.class_of_degree === "" ||
      lastRow.date_of_award === "" ||
      lastRow.degree === "" ||
      lastRow.institution === ""
    ) {
      setError(["Please fill all fields"]);
      return;
    }

    if (saveType === "new") {
      client
        .post("/staff/add-education-details", { ...lastRow, promotionId })
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError([res.data.errorMessage]);
            }
          } else {
            setEducationalDetails(
              educationalDetails.map((item) => {
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
      let itemToEdit = educationalDetails.filter(
        (item) => item.countingId === countingId
      )[0];
      client
        .post("/staff/edit-education-details", itemToEdit)
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError(["Something went wrong please try again"]);
            }
          } else {
            setEducationalDetails(
              educationalDetails.map((item) => {
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

  function deleteEducationalDetails(countingId) {
    let itemToDelete = educationalDetails.filter(
      (item) => item.countingId === countingId
    )[0];
    client
      .delete(`/staff/delete-education-details/${itemToDelete.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError([res.data.errorMessage]);
          }
        } else {
          let filteredData = educationalDetails.filter(
            (item) => item.countingId !== countingId
          );
          setEducationalDetails(
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

  function editEducationalDetails(countingId) {
    setEducationalDetails(
      educationalDetails.map((item) => {
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
    setEducationalDetails(
      educationalDetails.map((item) => {
        if (item.countingId === countingId) {
          if (field === "degree") {
            return {
              ...item,
              degree: e.target.value,
            };
          } else if (field === "class-of-degree") {
            return {
              ...item,
              class_of_degree: e.target.value,
            };
          } else if (field === "institution") {
            return {
              ...item,
              institution: e.target.value,
            };
          } else if (field === "date-of-award") {
            return {
              ...item,
              date_of_award: e.target.value,
            };
          }
        }
        return item;
      })
    );
  }

  return (
    <div className="update__education">
      <div className="update__education__header">
        <h3>Education</h3>
      </div>
      <div className="education__details">
        {educationalDetails.length ? (
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
                      <StyledTableCell align="center">
                        University Degree
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        Class of Degree
                      </StyledTableCell>
                      <StyledTableCell align="left">
                        Institution
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        Date of Award
                      </StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  {educationalDetails.map((item) => {
                    return (
                      <TableBody key={item.countingId} className="table__row">
                        <StyledTableRow>
                          <StyledTableCell component="th" scope="row">
                            {item.countingId}.
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.degree}
                                inputProps={{ "aria-label": "degree" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "degree")
                                }
                              />
                            ) : (
                              item.degree
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.class_of_degree}
                                inputProps={{ "aria-label": "class of degree" }}
                                onChange={(e) =>
                                  editDetails(
                                    e,
                                    item.countingId,
                                    "class-of-degree"
                                  )
                                }
                              />
                            ) : (
                              item.class_of_degree
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.institution}
                                inputProps={{ "aria-label": "institution" }}
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
                                defaultValue={item.date_of_award}
                                inputProps={{ "aria-label": "date of award" }}
                                onChange={(e) =>
                                  editDetails(
                                    e,
                                    item.countingId,
                                    "date-of-award"
                                  )
                                }
                              />
                            ) : (
                              item.date_of_award
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            {item?.pastData ? (
                              ""
                            ) : (
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
                                        deleteEducationalDetails(
                                          item.countingId
                                        )
                                      }
                                    />
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment>
                                    {selectedPromotion.status ===
                                    "unsubmitted" ? (
                                      <MdOutlineDelete
                                        className="icon delete__icon"
                                        onClick={() =>
                                          deleteEducationalDetails(
                                            item.countingId
                                          )
                                        }
                                      />
                                    ) : (
                                      <MdOutlineDelete className="delete__icon fade__icon" />
                                    )}
                                    {selectedPromotion.status ===
                                    "unsubmitted" ? (
                                      <AiOutlineEdit
                                        className="icon edit__icon"
                                        onClick={() =>
                                          editEducationalDetails(
                                            item.countingId
                                          )
                                        }
                                      />
                                    ) : (
                                      <AiOutlineEdit className="edit__icon fade__icon" />
                                    )}
                                  </React.Fragment>
                                )}
                              </div>
                            )}
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
                    onClick={addEducationRow}
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
            <p>Click on the "add icon" button below to add</p>
            <Avatar className="icon__background">
              <MdOutlineAddCircle
                className="icon add__icon"
                onClick={addEducationRow}
              />
            </Avatar>
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateEducation;
