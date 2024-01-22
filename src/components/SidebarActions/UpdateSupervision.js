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

function UpdateSupervision({ selectedPromotion }) {
  let navigate = useNavigate();

  useEffect(() => {
    client
      .get(`/staff/supervision/${selectedPromotion.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            underGraduateTableError(["Something went wrong, please try again"]);
          }
        } else {
          setPostGraduateSupervisionDetails(
            res.data.postGraduateData.map((item, index) => {
              return {
                ...item,
                countingId: index + 1,
              };
            })
          );
          setUnderGraduateSupervisionDetails(
            res.data.underGraduateData.map((item, index) => {
              return {
                ...item,
                countingId: index + 1,
              };
            })
          );
          setPromotionId(res.data.promotionId);
        }
      })
      .catch((error) => {
        setUnderGraduateTableError(["Something went wrong, please try again"]);
      });
  }, []);

  const [postGraduateSupervisionDetails, setPostGraduateSupervisionDetails] =
    useState([]);
  const [undergraduateSupervisionDetails, setUnderGraduateSupervisionDetails] =
    useState([]);
  const [underGraduateTableError, setUnderGraduateTableError] = useState([]);
  const [postGraduateTableError, setPostGraduateTableError] = useState([]);
  const [promotionId, setPromotionId] = useState(null);

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
    let timeoutId;
    if (postGraduateTableError) {
      timeoutId = setTimeout(() => {
        setPostGraduateTableError([]);
      }, 6000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [postGraduateTableError]);

  function addPostGraduateSupervisionRow() {
    let lastRow =
      postGraduateSupervisionDetails[postGraduateSupervisionDetails.length - 1];

    if (lastRow) {
      if (
        lastRow.admission_number === "" ||
        lastRow.degree === "" ||
        lastRow.name === "" ||
        lastRow.institution === "" ||
        lastRow.thesis_title === "" ||
        lastRow.status === "" ||
        lastRow.year === ""
      ) {
        setPostGraduateTableError(["Please fill last row completely"]);
        return;
      }
    }
    setPostGraduateSupervisionDetails([
      ...postGraduateSupervisionDetails,
      {
        id: postGraduateSupervisionDetails.length + 1,
        countingId: postGraduateSupervisionDetails.length + 1,
        name: "",
        admission_number: "",
        thesis_title: "",
        year: "",
        degree: "",
        institution: "",
        status: "",
        editing: true,
      },
    ]);
  }

  function addUndergraduateSupervisionRow() {
    let lastRow =
      undergraduateSupervisionDetails[
        undergraduateSupervisionDetails.length - 1
      ];

    if (lastRow) {
      if (
        lastRow.admission_number === "" ||
        lastRow.name === "" ||
        lastRow.project_title === ""
      ) {
        setUnderGraduateTableError(["Please fill last row completely"]);
        return;
      }
    }

    setUnderGraduateSupervisionDetails([
      ...undergraduateSupervisionDetails,
      {
        id: undergraduateSupervisionDetails.length + 1,
        countingId: undergraduateSupervisionDetails.length + 1,
        name: "",
        admission_number: "",
        project_title: "",
        editing: true,
      },
    ]);
  }

  function savePostGraduateSupervisionData(countingId, saveType) {
    let lastRow =
      postGraduateSupervisionDetails[postGraduateSupervisionDetails.length - 1];

    if (
      lastRow.name === "" ||
      lastRow.admission_number === "" ||
      lastRow.thesis_title === "" ||
      lastRow.year === "" ||
      lastRow.degree === "" ||
      lastRow.institution === "" ||
      lastRow.status === ""
    ) {
      setPostGraduateTableError(["Please fill fields"]);
      return;
    }

    if (saveType === "new") {
      client
        .post("/staff/add-postgraduate-supervision", {
          ...lastRow,
          promotionId,
        })
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              postGraduateTableError([res.data.errorMessage]);
            }
          } else {
            setPostGraduateSupervisionDetails(
              postGraduateSupervisionDetails.map((item) => {
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
      let itemToEdit = postGraduateSupervisionDetails.filter(
        (item) => item.countingId === countingId
      )[0];
      client
        .post("/staff/edit-postgraduate-supervision", itemToEdit)
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setPostGraduateTableError([res.data.errorMessage]);
            }
          } else {
            setPostGraduateSupervisionDetails(
              postGraduateSupervisionDetails.map((item) => {
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
          setPostGraduateTableError(["Something went wrong, please try again"]);
        });
    }
  }

  function saveUndergraduateSupervisionData(countingId, saveType) {
    let lastRow =
      undergraduateSupervisionDetails[
        undergraduateSupervisionDetails.length - 1
      ];

    if (
      lastRow.admission_number === "" ||
      lastRow.name === "" ||
      lastRow.project_title === ""
    ) {
      setUnderGraduateTableError(["Please fill all Fields"]);
      return;
    }

    if (saveType === "new") {
      client
        .post("/staff/add-undergraduate-supervision", {
          ...lastRow,
          promotionId,
        })
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setUnderGraduateTableError([res.data.errorMessage]);
            }
          } else {
            setUnderGraduateSupervisionDetails(
              undergraduateSupervisionDetails.map((item) => {
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
      let itemToEdit = undergraduateSupervisionDetails.filter(
        (item) => item.countingId === countingId
      )[0];
      client
        .post("/staff/edit-undergraduate-supervision", itemToEdit)
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setUnderGraduateTableError([res.data.errorMessage]);
            }
          } else {
            setUnderGraduateSupervisionDetails(
              undergraduateSupervisionDetails.map((item) => {
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
          setUnderGraduateTableError(["something went wrong"]);
        });
    }
  }

  function deletePostGraduateSupervisionData(countingId) {
    let itemToDelete = postGraduateSupervisionDetails.filter(
      (item) => item.countingId === countingId
    )[0];

    client
      .delete(`/staff/delete-postgraduate-supervision/${itemToDelete.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setPostGraduateTableError([res.data.errorMessage]);
          }
        } else {
          let filteredData = postGraduateSupervisionDetails.filter(
            (item) => item.countingId !== countingId
          );

          setPostGraduateSupervisionDetails(
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
        setPostGraduateTableError(["Something went wrong, please try again"]);
      });
  }

  function deleteUndergraduateSupervisionData(countingId) {
    let itemToDelete = undergraduateSupervisionDetails.filter(
      (item) => item.countingId === countingId
    )[0];

    client
      .delete(`/staff/delete-undergraduate-supervision/${itemToDelete.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setUnderGraduateTableError([res.data.errorMessage]);
          }
        } else {
          let filteredData = undergraduateSupervisionDetails.filter(
            (item) => item.countingId !== countingId
          );
          setUnderGraduateSupervisionDetails(
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
        setUnderGraduateTableError(["something went wrong, please try again"]);
      });
  }

  function editPostGraduateSupervisionData(countingId) {
    setPostGraduateSupervisionDetails(
      postGraduateSupervisionDetails.map((item) => {
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

  function editUndergraduateSupervisionData(countingId) {
    setUnderGraduateSupervisionDetails(
      undergraduateSupervisionDetails.map((item) => {
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

  function editPostGraduateSupervisionDataActual(e, countingId, field) {
    setPostGraduateSupervisionDetails(
      postGraduateSupervisionDetails.map((item) => {
        if (item.countingId === countingId) {
          if (field === "name") {
            return {
              ...item,
              name: e.target.value,
            };
          } else if (field === "admission-number") {
            return {
              ...item,
              admission_number: e.target.value,
            };
          } else if (field === "thesis-title") {
            return {
              ...item,
              thesis_title: e.target.value,
            };
          } else if (field === "year") {
            return {
              ...item,
              year: e.target.value,
            };
          } else if (field === "degree") {
            return {
              ...item,
              degree: e.target.value,
            };
          } else if (field === "institution") {
            return {
              ...item,
              institution: e.target.value,
            };
          } else if (field === "status") {
            return {
              ...item,
              status: e.target.value,
            };
          }
        }
        return item;
      })
    );
  }
  function editUndergraduateSupervisionDataActual(e, countingId, field) {
    setUnderGraduateSupervisionDetails(
      undergraduateSupervisionDetails.map((item) => {
        if (item.countingId === countingId) {
          if (field === "name") {
            return {
              ...item,
              name: e.target.value,
            };
          } else if (field === "admission-number") {
            return {
              ...item,
              admission_number: e.target.value,
            };
          } else if (field === "project-title") {
            return {
              ...item,
              project_title: e.target.value,
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
        <h3>Supervision</h3>
      </div>
      <div className="sub__header">Undergraduate Supervision</div>
      <div className="supervision__details">
        {undergraduateSupervisionDetails.length ? (
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
                            {item.countingId}.
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
                                    item.countingId,
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
                                defaultValue={item.admission_number}
                                inputProps={{
                                  "aria-label": "admission number",
                                }}
                                onChange={(e) =>
                                  editUndergraduateSupervisionDataActual(
                                    e,
                                    item.countingId,
                                    "admission-number"
                                  )
                                }
                              />
                            ) : (
                              item.admission_number
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.project_title}
                                inputProps={{ "aria-label": "project title" }}
                                onChange={(e) =>
                                  editUndergraduateSupervisionDataActual(
                                    e,
                                    item.countingId,
                                    "project-title"
                                  )
                                }
                              />
                            ) : (
                              item.project_title
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
                                        saveUndergraduateSupervisionData(
                                          item.countingId,
                                          "edit"
                                        )
                                      }
                                    />
                                  ) : (
                                    <BiCheck
                                      className="icon check__icon"
                                      onClick={() =>
                                        saveUndergraduateSupervisionData(
                                          item.countingId,
                                          "new"
                                        )
                                      }
                                    />
                                  )}
                                  <MdOutlineDelete
                                    className="icon delete__icon"
                                    onClick={() =>
                                      deleteUndergraduateSupervisionData(
                                        item.id
                                      )
                                    }
                                  />
                                </React.Fragment>
                              ) : selectedPromotion.status === "unsubmitted" ? (
                                <React.Fragment>
                                  <MdOutlineDelete
                                    className="icon delete__icon"
                                    onClick={() =>
                                      deleteUndergraduateSupervisionData(
                                        item.countingId
                                      )
                                    }
                                  />
                                  <AiOutlineEdit
                                    className="icon edit__icon"
                                    onClick={() =>
                                      editUndergraduateSupervisionData(item.id)
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
                    onClick={addUndergraduateSupervisionRow}
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
                <Avatar className="icon__background">
                  <MdOutlineAddCircle
                    className="icon add__icon"
                    onClick={addUndergraduateSupervisionRow}
                  />
                </Avatar>
                <p>Click on the "add" button below to add</p>
              </React.Fragment>
            ) : (
              ""
            )}
          </div>
        )}
        <div className="sub__header post__sub__header">
          PostGraduate Supervision
        </div>
        {postGraduateSupervisionDetails.length ? (
          <div className="uploaded__details">
            {postGraduateTableError.length ? (
              <Alert variant="filled" severity="error" className="error__popup">
                {postGraduateTableError[0]}
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
                        Thesis/Dissertation Title
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        Institution
                      </StyledTableCell>
                      <StyledTableCell align="right">Degree</StyledTableCell>
                      <StyledTableCell align="right">Status</StyledTableCell>
                      <StyledTableCell align="right">year</StyledTableCell>
                      <StyledTableCell align="right">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  {postGraduateSupervisionDetails.map((item) => {
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
                                defaultValue={item.name}
                                inputProps={{ "aria-label": "name" }}
                                onChange={(e) =>
                                  editPostGraduateSupervisionDataActual(
                                    e,
                                    item.countingId,
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
                                defaultValue={item.admission_number}
                                inputProps={{
                                  "aria-label": "admission number",
                                }}
                                onChange={(e) =>
                                  editPostGraduateSupervisionDataActual(
                                    e,
                                    item.countingId,
                                    "admission-number"
                                  )
                                }
                              />
                            ) : (
                              item.admission_number
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.thesis_title}
                                inputProps={{ "aria-label": "thesis title" }}
                                onChange={(e) =>
                                  editPostGraduateSupervisionDataActual(
                                    e,
                                    item.countingId,
                                    "thesis-title"
                                  )
                                }
                              />
                            ) : (
                              item.thesis_title
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.institution}
                                inputProps={{ "aria-label": "institution" }}
                                onChange={(e) =>
                                  editPostGraduateSupervisionDataActual(
                                    e,
                                    item.countingId,
                                    "institution"
                                  )
                                }
                              />
                            ) : (
                              item.institution
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.degree}
                                inputProps={{ "aria-label": "degree" }}
                                onChange={(e) =>
                                  editPostGraduateSupervisionDataActual(
                                    e,
                                    item.countingId,
                                    "degree"
                                  )
                                }
                              />
                            ) : (
                              item.degree
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.status}
                                inputProps={{ "aria-label": "status" }}
                                onChange={(e) =>
                                  editPostGraduateSupervisionDataActual(
                                    e,
                                    item.countingId,
                                    "status"
                                  )
                                }
                              />
                            ) : (
                              item.status
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.year}
                                inputProps={{ "aria-label": "year" }}
                                onChange={(e) =>
                                  editPostGraduateSupervisionDataActual(
                                    e,
                                    item.id,
                                    "year"
                                  )
                                }
                              />
                            ) : (
                              item.year
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
                                        savePostGraduateSupervisionData(
                                          item.countingId,
                                          "edit"
                                        )
                                      }
                                    />
                                  ) : (
                                    <BiCheck
                                      className="icon check__icon"
                                      onClick={() =>
                                        savePostGraduateSupervisionData(
                                          item.countingId,
                                          "new"
                                        )
                                      }
                                    />
                                  )}
                                  <MdOutlineDelete
                                    className="icon delete__icon"
                                    onClick={() =>
                                      deletePostGraduateSupervisionData(
                                        item.countingId
                                      )
                                    }
                                  />
                                </React.Fragment>
                              ) : selectedPromotion.status === "unsubmitted" ? (
                                <React.Fragment>
                                  <MdOutlineDelete
                                    className="icon delete__icon"
                                    onClick={() =>
                                      deletePostGraduateSupervisionData(
                                        item.countingId
                                      )
                                    }
                                  />
                                  <AiOutlineEdit
                                    className="icon edit__icon"
                                    onClick={() =>
                                      editPostGraduateSupervisionData(
                                        item.countingId
                                      )
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
                    onClick={addPostGraduateSupervisionRow}
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
                <Avatar className="icon__background">
                  <MdOutlineAddCircle
                    className="icon add__icon"
                    onClick={addPostGraduateSupervisionRow}
                  />
                </Avatar>
                <p>Click on the "add" button below to add</p>
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

export default UpdateSupervision;
