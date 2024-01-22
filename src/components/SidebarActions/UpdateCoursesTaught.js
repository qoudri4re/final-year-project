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

function UpdateCoursesTaught({ selectedPromotion }) {
  let navigate = useNavigate();

  const [secondSemesterCoursesTaught, setSecondSemesterCoursesTaught] =
    useState([]);
  const [firstSemesterCoursesTaught, setFirstSemesterCoursesTaught] = useState(
    []
  );
  const [firstSemesterTableError, setFirstSemesterTableError] = useState([]);
  const [secondSemesterTableError, setSecondSemesterTableError] = useState([]);
  const [promotionId, setPromotionId] = useState(null);

  useEffect(() => {
    client
      .get(`/staff/courses-taught/${selectedPromotion.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          }
        } else {
          setPromotionId(res.data.promotionId);
          let firstSemesterData = res.data.data.filter(
            (item) => item.semester === "first"
          );
          let secondSemesterData = res.data.data.filter(
            (item) => item.semester === "second"
          );

          setFirstSemesterCoursesTaught(
            firstSemesterData.map((item, index) => {
              return {
                ...item,
                countingId: index + 1,
              };
            })
          );
          setSecondSemesterCoursesTaught(
            secondSemesterData.map((item, index) => {
              return {
                ...item,
                countingId: index + 1,
              };
            })
          );
        }
      })
      .catch((error) => {
        console.log(error);
        setFirstSemesterTableError(["something went wrong"]);
      });
  }, []);

  useEffect(() => {
    let timeoutId;
    if (firstSemesterTableError) {
      timeoutId = setTimeout(() => {
        setFirstSemesterTableError([]);
      }, 6000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [firstSemesterTableError]);

  useEffect(() => {
    let timeoutId;
    if (secondSemesterTableError) {
      timeoutId = setTimeout(() => {
        setSecondSemesterTableError([]);
      }, 6000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [secondSemesterTableError]);

  function addfirstSemesterRow() {
    let lastRow =
      firstSemesterCoursesTaught[firstSemesterCoursesTaught.length - 1];

    if (lastRow) {
      if (
        lastRow.course_code === "" ||
        lastRow.course_title === "" ||
        lastRow.contribution === "" ||
        lastRow.teaching_load === ""
      ) {
        setFirstSemesterTableError(["Please fill last row completely"]);
        return;
      }
    }

    setFirstSemesterCoursesTaught([
      ...firstSemesterCoursesTaught,
      {
        id: firstSemesterCoursesTaught.length + 1,
        countingId: firstSemesterCoursesTaught.length + 1,
        course_code: "",
        course_title: "",
        contribution: "",
        teaching_load: "",
        unit: "",
        editing: true,
        semester: "first",
      },
    ]);
  }

  function addSecondSemesterRow() {
    let lastRow =
      secondSemesterCoursesTaught[secondSemesterCoursesTaught.length - 1];

    if (lastRow) {
      if (
        lastRow.course_code === "" ||
        lastRow.course_title === "" ||
        lastRow.contribution === "" ||
        lastRow.teaching_load === ""
      ) {
        setSecondSemesterTableError(["Please fill last row completely"]);
        return;
      }
    }

    setSecondSemesterCoursesTaught([
      ...secondSemesterCoursesTaught,
      {
        id: secondSemesterCoursesTaught.length + 1,
        countingId: secondSemesterCoursesTaught.length + 1,
        course_code: "",
        course_title: "",
        contribution: "",
        teaching_load: "",
        unit: "",
        editing: true,
        semester: "second",
      },
    ]);
  }

  function saveFirstSemesterData(countingId, saveType) {
    let lastRow =
      firstSemesterCoursesTaught[firstSemesterCoursesTaught.length - 1];

    if (
      lastRow.course_code === "" ||
      lastRow.course_title === "" ||
      lastRow.contribution === "" ||
      lastRow.teaching_load === ""
    ) {
      setFirstSemesterTableError(["Please fill fields"]);
      return;
    }

    if (saveType === "new") {
      client
        .post("/staff/add-courses-taught-details", { ...lastRow, promotionId })
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setSecondSemesterTableError([res.data.error]);
            }
          } else {
            setFirstSemesterCoursesTaught(
              firstSemesterCoursesTaught.map((item) => {
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
        });
    } else {
      let itemToEdit = firstSemesterCoursesTaught.filter(
        (item) => item.countingId === countingId
      )[0];
      client
        .post("/staff/edit-courses-taught", itemToEdit)
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setFirstSemesterTableError([res.data.errorMessage]);
            }
          } else {
            setFirstSemesterCoursesTaught(
              firstSemesterCoursesTaught.map((item) => {
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
          setFirstSemesterTableError(["something went wrong"]);
        });
    }
  }

  function saveSecondSemesterData(countingId, saveType) {
    let lastRow =
      secondSemesterCoursesTaught[secondSemesterCoursesTaught.length - 1];

    if (
      lastRow.course_code === "" ||
      lastRow.course_title === "" ||
      lastRow.contribution === "" ||
      lastRow.teaching_load === ""
    ) {
      setSecondSemesterTableError(["Please fill all Fields"]);
      return;
    }

    if (saveType === "new") {
      client
        .post("/staff/add-courses-taught-details", { ...lastRow, promotionId })
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setSecondSemesterTableError([res.data.error]);
            }
          } else {
            setSecondSemesterCoursesTaught(
              secondSemesterCoursesTaught.map((item) => {
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
        });
    } else {
      let itemToEdit = secondSemesterCoursesTaught.filter(
        (item) => item.countingId === countingId
      )[0];

      client.post("/staff/edit-courses-taught", itemToEdit).then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setSecondSemesterTableError([res.data.errorMessage]);
          }
        } else {
          setSecondSemesterCoursesTaught(
            secondSemesterCoursesTaught.map((item) => {
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
      });
    }
  }

  function deleteFirstSemesterData(countingId) {
    let itemToDelete = firstSemesterCoursesTaught.filter(
      (item) => item.countingId === countingId
    )[0];

    client
      .delete(`/staff/delete-courses-taught/${itemToDelete.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setFirstSemesterTableError([res.data.errorMessage]);
          }
        } else {
          let filteredData = firstSemesterCoursesTaught.filter(
            (item) => item.countingId !== countingId
          );

          setFirstSemesterCoursesTaught(
            filteredData.map((item, index) => {
              return {
                ...item,
                countingId: index + 1,
              };
            })
          );
        }
      });
  }

  function deleteSecondSemesterData(countingId) {
    let itemToDelete = secondSemesterCoursesTaught.filter(
      (item) => item.countingId === countingId
    )[0];

    client
      .delete(`/staff/delete-courses-taught/${itemToDelete.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError") {
            navigate("/staff/login");
          } else {
            setSecondSemesterTableError([res.data.errorMessage]);
          }
        } else {
          let filteredData = secondSemesterCoursesTaught.filter(
            (item) => item.countingId !== countingId
          );

          setSecondSemesterCoursesTaught(
            filteredData.map((item, index) => {
              return {
                ...item,
                countingId: index + 1,
              };
            })
          );
        }
      });
  }

  function editFirstSemesterData(countingId) {
    setFirstSemesterCoursesTaught(
      firstSemesterCoursesTaught.map((item) => {
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

  function editSecondSemesterData(countingId) {
    setSecondSemesterCoursesTaught(
      secondSemesterCoursesTaught.map((item) => {
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

  function editSecondSemesterDataActual(e, countingId, field) {
    setSecondSemesterCoursesTaught(
      secondSemesterCoursesTaught.map((item) => {
        if (item.countingId === countingId) {
          if (field === "course-code") {
            return {
              ...item,
              course_code: e.target.value,
            };
          } else if (field === "course-title") {
            return {
              ...item,
              course_title: e.target.value,
            };
          } else if (field === "contribution") {
            return {
              ...item,
              contribution: e.target.value,
            };
          } else if (field === "teaching-load") {
            return {
              ...item,
              teaching_load: e.target.value,
            };
          } else if (field === "unit") {
            return {
              ...item,
              unit: e.target.value,
            };
          }
        }
        return item;
      })
    );
  }
  function editFirstSemesterDataActual(e, countingId, field) {
    setFirstSemesterCoursesTaught(
      firstSemesterCoursesTaught.map((item) => {
        if (item.countingId === countingId) {
          if (field === "course-code") {
            return {
              ...item,
              course_code: e.target.value,
            };
          } else if (field === "course-title") {
            return {
              ...item,
              course_title: e.target.value,
            };
          } else if (field === "contribution") {
            return {
              ...item,
              contribution: e.target.value,
            };
          } else if (field === "teaching-load") {
            return {
              ...item,
              teaching_load: e.target.value,
            };
          } else if (field === "unit") {
            return {
              ...item,
              unit: e.target.value,
            };
          }
        }
        return item;
      })
    );
  }

  return (
    <div className="update__supervision">
      <div className="update__supervision__header">
        <h3>Courses Taught</h3>
      </div>
      <div className="sub__header">First Semester</div>
      <div className="supervision__details">
        {firstSemesterCoursesTaught.length ? (
          <div className="uploaded__details">
            {firstSemesterTableError.length ? (
              <Alert variant="filled" severity="error" className="error__popup">
                {firstSemesterTableError[0]}
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
                        Course Code
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        Course Title
                      </StyledTableCell>
                      <StyledTableCell align="center">Unit</StyledTableCell>
                      <StyledTableCell align="center">
                        Contribution
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        Teaching Load
                      </StyledTableCell>
                      <StyledTableCell align="right">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  {firstSemesterCoursesTaught.map((item) => {
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
                                defaultValue={item.course_code}
                                inputProps={{ "aria-label": "Course Code" }}
                                onChange={(e) =>
                                  editFirstSemesterDataActual(
                                    e,
                                    item.countingId,
                                    "course-code"
                                  )
                                }
                              />
                            ) : (
                              item.course_code
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.course_title}
                                inputProps={{
                                  "aria-label": "Course Title",
                                }}
                                onChange={(e) =>
                                  editFirstSemesterDataActual(
                                    e,
                                    item.countingId,
                                    "course-title"
                                  )
                                }
                              />
                            ) : (
                              item.course_title
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.unit}
                                inputProps={{
                                  "aria-label": "unit",
                                }}
                                onChange={(e) =>
                                  editFirstSemesterDataActual(
                                    e,
                                    item.countingId,
                                    "unit"
                                  )
                                }
                              />
                            ) : (
                              item.unit
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.contribution}
                                inputProps={{ "aria-label": "contribution" }}
                                onChange={(e) =>
                                  editFirstSemesterDataActual(
                                    e,
                                    item.countingId,
                                    "contribution"
                                  )
                                }
                              />
                            ) : (
                              item.contribution
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.teaching_load}
                                inputProps={{ "aria-label": "Teaching Load" }}
                                onChange={(e) =>
                                  editFirstSemesterDataActual(
                                    e,
                                    item.countingId,
                                    "teaching-load"
                                  )
                                }
                              />
                            ) : (
                              item.teaching_load
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
                                        saveFirstSemesterData(
                                          item.countingId,
                                          "edit"
                                        )
                                      }
                                    />
                                  ) : (
                                    <BiCheck
                                      className="icon check__icon"
                                      onClick={() =>
                                        saveFirstSemesterData(
                                          item.countingId,
                                          "new"
                                        )
                                      }
                                    />
                                  )}
                                  <MdOutlineDelete
                                    className="icon delete__icon"
                                    onClick={() =>
                                      deleteFirstSemesterData(item.countingId)
                                    }
                                  />
                                </React.Fragment>
                              ) : selectedPromotion.status === "unsubmitted" ? (
                                <React.Fragment>
                                  <MdOutlineDelete
                                    className="icon delete__icon"
                                    onClick={() =>
                                      deleteFirstSemesterData(item.countingId)
                                    }
                                  />
                                  <AiOutlineEdit
                                    className="icon edit__icon"
                                    onClick={() =>
                                      editFirstSemesterData(item.countingId)
                                    }
                                  />
                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  <MdOutlineDelete className="delete__icon fade__icon" />
                                  <AiOutlineEdit className="edit__icon fade__icon" />
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
                    onClick={addfirstSemesterRow}
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
            <h3>No Undergraduate supervision details uploaded</h3>
            {selectedPromotion.status === "unsubmitted" ? (
              <React.Fragment>
                <p>Click on the "add" button below to add</p>
                <Avatar className="icon__background">
                  <MdOutlineAddCircle
                    className="icon add__icon"
                    onClick={addfirstSemesterRow}
                  />
                </Avatar>
              </React.Fragment>
            ) : (
              ""
            )}
          </div>
        )}
        <div className="sub__header post__sub__header">Second Semester</div>
        {secondSemesterCoursesTaught.length ? (
          <React.Fragment>
            <div className="uploaded__details">
              {secondSemesterTableError.length ? (
                <Alert
                  variant="filled"
                  severity="error"
                  className="error__popup"
                >
                  {secondSemesterTableError[0]}
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
                          Course Code
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          Course Title
                        </StyledTableCell>
                        <StyledTableCell align="center">Unit</StyledTableCell>
                        <StyledTableCell align="center">
                          Contribution
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          Teaching Load
                        </StyledTableCell>
                        <StyledTableCell align="right">Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    {secondSemesterCoursesTaught.map((item) => {
                      return (
                        <TableBody key={item.countingId} className="table__row">
                          <StyledTableRow>
                            <StyledTableCell component="th" scope="row">
                              {item.id}.
                            </StyledTableCell>
                            <StyledTableCell align="left">
                              {item.editing ? (
                                <Input
                                  className="input"
                                  defaultValue={item.course_code}
                                  inputProps={{ "aria-label": "Course Code" }}
                                  onChange={(e) =>
                                    editSecondSemesterDataActual(
                                      e,
                                      item.countingId,
                                      "course-code"
                                    )
                                  }
                                />
                              ) : (
                                item.course_code
                              )}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {item.editing ? (
                                <Input
                                  className="input"
                                  defaultValue={item.course_title}
                                  inputProps={{
                                    "aria-label": "Course Title",
                                  }}
                                  onChange={(e) =>
                                    editSecondSemesterDataActual(
                                      e,
                                      item.countingId,
                                      "course-title"
                                    )
                                  }
                                />
                              ) : (
                                item.course_title
                              )}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {item.editing ? (
                                <Input
                                  className="input"
                                  defaultValue={item.unit}
                                  inputProps={{
                                    "aria-label": "unit",
                                  }}
                                  onChange={(e) =>
                                    editSecondSemesterDataActual(
                                      e,
                                      item.countingId,
                                      "unit"
                                    )
                                  }
                                />
                              ) : (
                                item.unit
                              )}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {item.editing ? (
                                <Input
                                  className="input"
                                  defaultValue={item.contribution}
                                  inputProps={{ "aria-label": "contribution" }}
                                  onChange={(e) =>
                                    editSecondSemesterDataActual(
                                      e,
                                      item.countingId,
                                      "contribution"
                                    )
                                  }
                                />
                              ) : (
                                item.contribution
                              )}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {item.editing ? (
                                <Input
                                  className="input"
                                  defaultValue={item.teaching_load}
                                  inputProps={{ "aria-label": "Teaching Load" }}
                                  onChange={(e) =>
                                    editSecondSemesterDataActual(
                                      e,
                                      item.countingId,
                                      "teaching-load"
                                    )
                                  }
                                />
                              ) : (
                                item.teaching_load
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
                                          saveSecondSemesterData(
                                            item.countingId,
                                            "edit"
                                          )
                                        }
                                      />
                                    ) : (
                                      <BiCheck
                                        className="icon check__icon"
                                        onClick={() =>
                                          saveSecondSemesterData(
                                            item.countingId,
                                            "new"
                                          )
                                        }
                                      />
                                    )}
                                    <MdOutlineDelete
                                      className="icon delete__icon"
                                      onClick={() =>
                                        deleteSecondSemesterData(
                                          item.countingId
                                        )
                                      }
                                    />
                                  </React.Fragment>
                                ) : selectedPromotion.status ===
                                  "unsubmitted" ? (
                                  <React.Fragment>
                                    <MdOutlineDelete
                                      className="icon delete__icon"
                                      onClick={() =>
                                        deleteSecondSemesterData(
                                          item.countingId
                                        )
                                      }
                                    />
                                    <AiOutlineEdit
                                      className="icon edit__icon"
                                      onClick={() =>
                                        editSecondSemesterData(item.countingId)
                                      }
                                    />
                                  </React.Fragment>
                                ) : (
                                  <React.Fragment>
                                    <MdOutlineDelete className="delete__icon fade__icon" />
                                    <AiOutlineEdit className="edit__icon fade__icon" />
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
                      onClick={addSecondSemesterRow}
                    />
                  </Avatar>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="total__points">
              <h3>TotalPoints: 0</h3>
            </div>
          </React.Fragment>
        ) : (
          <div className="no__details">
            <h3>No Undergraduate supervision details uploaded</h3>
            {selectedPromotion.status === "unsubmitted" ? (
              <React.Fragment>
                <p>Click on the "add" button below to add</p>
                <Avatar className="icon__background">
                  <MdOutlineAddCircle
                    className="icon add__icon"
                    onClick={addSecondSemesterRow}
                  />
                </Avatar>
              </React.Fragment>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UpdateCoursesTaught;
