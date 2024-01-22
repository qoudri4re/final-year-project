import React, { useState } from "react";
import { BiCheck } from "react-icons/bi";
import { MdOutlineDelete } from "react-icons/md";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import { styled } from "@mui/material/styles";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineAddCircle } from "react-icons/md";
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Input,
  MenuItem,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import Select from "@mui/material/Select";
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

function UpdateConferencesAttended({ selectedPromotion }) {
  let navigate = useNavigate();
  const [conferenceData, setConferenceData] = useState([]);
  const [error, setError] = useState([]);
  const [promotionId, setPromotionId] = useState(null);
  const [openForm, setOpenForm] = useState(false);

  function toogleClickOpenForm(id) {
    setOpenForm(!openForm);
    setFileUploadFor(id);
  }

  useEffect(() => {
    client
      .get(`/staff/conferences-attended/${selectedPromotion.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError([res.data.error]);
          }
        } else {
          setPromotionId(res.data.promotionId);
          setConferenceData(
            res.data.conferencesAttended.map((item, index) => {
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

  function addConferenceRow() {
    let lastRow = conferenceData[conferenceData.length - 1];

    if (lastRow) {
      if (lastRow.presented_a_paper === "Yes")
        if (
          lastRow.title === "" ||
          lastRow.organizer === "" ||
          lastRow.presented_a_paper === "" ||
          (lastRow.presented_a_paper !== "" && lastRow.paper_file_name !== "")
        ) {
          setError(["Please fill Last row completely"]);
          return;
        }
    }

    setConferenceData([
      ...conferenceData,
      {
        id: conferenceData.length + 1,
        countingId: conferenceData.length + 1,
        title: "",
        editing: true,
        organizer: "",
        presented_a_paper: "No",
        paper_file_name: "",
      },
    ]);
  }

  function save(countingId, saveType) {
    let lastRow = conferenceData[conferenceData.length - 1];

    if (lastRow.title === "") {
      setError(["Please fill all fields"]);
      return;
    }
    if (saveType === "new") {
      let url = "/staff";
      if (lastRow.presented_a_paper === "No") {
        url += "/add-conferences-attended-no-file";
      } else {
        url += "/add-conferences-attended-file";
      }

      const formData = new FormData();
      formData.append("title", lastRow.title);
      formData.append("organizer", lastRow.organizer);
      formData.append("presented_a_paper", lastRow.presented_a_paper);
      formData.append("promotionId", promotionId);
      formData.append("category", "document");
      formData.append("file", paperPresented);

      let requestBody =
        lastRow.presented_a_paper === "No"
          ? { ...lastRow, promotionId }
          : formData;

      client
        .post(url, requestBody)
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError([res.data.errorMessage]);
            }
          } else {
            setConferenceData(
              conferenceData.map((item) => {
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
          console.log(error);
        });
    } else {
      let itemToEdit = conferenceData.filter(
        (item) => item.countingId === countingId
      )[0];

      client
        .post("/staff/edit-conferences-attended", {
          ...itemToEdit,
          promotionId,
        })
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError([res.data.errorMessage]);
            }
          } else {
            setConferenceData(
              conferenceData.map((item) => {
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
          console.log(error);
        });
    }
  }

  function deleteConferenceRow(countingId) {
    let itemToDelete = conferenceData.filter(
      (item) => item.countingId === countingId
    )[0];
    client
      .delete(`/staff/delete-conferences-attended/${itemToDelete.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError([res.data.errorMessage]);
          }
        } else {
          setConferenceData(
            conferenceData.filter((item) => item.countingId !== countingId)
          );
        }
      })
      .catch((error) => console.log(error));
  }

  function editConferenceRow(countingId) {
    setConferenceData(
      conferenceData.map((item) => {
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
    setConferenceData(
      conferenceData.map((item) => {
        if (item.countingId === countingId) {
          if (field === "title") {
            return {
              ...item,
              title: e.target.value,
            };
          } else if (field === "organizer") {
            return {
              ...item,
              organizer: e.target.value,
            };
          } else if (field === "presented-a-paper") {
            return {
              ...item,
              presented_a_paper: e.target.value,
            };
          }
        }
        return item;
      })
    );
  }

  const [paperPresented, setPaperPresented] = useState(null);
  const [fileUploadFor, setFileUploadFor] = useState(null);

  function handleFileUpload(e) {
    setPaperPresented(e.target.files[0]);

    setConferenceData(
      conferenceData.map((item) => {
        if (item.id === fileUploadFor) {
          return {
            ...item,
            paper_file_name: e.target.files[0].name,
          };
        }
        return item;
      })
    );
    toogleClickOpenForm();
  }

  return (
    <div className="update__conferences__attended">
      <div className="update__conferences__attended__header">
        <h3>Conferences Attended</h3>
      </div>
      <div className="conferences__attended__details">
        {conferenceData.length ? (
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
                      <StyledTableCell align="center">Title</StyledTableCell>
                      <StyledTableCell align="center">
                        Organizer
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        Presented a Paper
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        Paper Presented
                      </StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  {conferenceData.map((item) => {
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
                                defaultValue={item.title}
                                inputProps={{ "aria-label": "title" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "title")
                                }
                              />
                            ) : (
                              item.title
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.organizer}
                                inputProps={{ "aria-label": "organizer" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "organizer")
                                }
                              />
                            ) : (
                              item.organizer
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <FormControl size="small">
                                <Select
                                  labelId="demo-simple-select-label"
                                  value={item.presented_a_paper}
                                  label="Age"
                                  onChange={(e) => {
                                    editDetails(
                                      e,
                                      item.countingId,
                                      "presented-a-paper"
                                    );
                                  }}
                                >
                                  <MenuItem value={"Yes"}>Yes</MenuItem>
                                  <MenuItem value={"No"}>No</MenuItem>
                                </Select>
                              </FormControl>
                            ) : (
                              item.presented_a_paper
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.presented_a_paper === "Yes" ? (
                              item.paper_file_name !== "" ? (
                                item.paper_file_name
                              ) : (
                                <Button
                                  variant="contained"
                                  onClick={() =>
                                    toogleClickOpenForm(item.countingId)
                                  }
                                >
                                  Upload paper
                                </Button>
                              )
                            ) : (
                              <Button variant="contained" disabled>
                                Upload paper
                              </Button>
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="left">
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
                                      deleteConferenceRow(item.countingId)
                                    }
                                  />
                                </React.Fragment>
                              ) : selectedPromotion.status === "unsubmitted" ? (
                                <React.Fragment>
                                  <MdOutlineDelete
                                    className="icon delete__icon"
                                    onClick={() =>
                                      deleteConferenceRow(item.countingId)
                                    }
                                  />
                                  <AiOutlineEdit
                                    className="icon edit__icon"
                                    onClick={() =>
                                      editConferenceRow(item.countingId)
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
              <Avatar className="add__icon__background">
                <MdOutlineAddCircle
                  className="icon add__icon"
                  onClick={addConferenceRow}
                />
              </Avatar>
            </div>
            <div className="total__points">
              <h3>TotalPoints: 0</h3>
            </div>
          </div>
        ) : (
          <div className="no__details">
            <h3>No conference details uploaded</h3>
            {selectedPromotion.status === "unsubmitted" ? (
              <React.Fragment>
                <p>Click on the "add" button below to add</p>
                <Avatar className="icon__background">
                  <MdOutlineAddCircle
                    className="icon add__icon"
                    onClick={addConferenceRow}
                  />
                </Avatar>
              </React.Fragment>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
      <Dialog open={openForm}>
        <DialogTitle>Upload Paper</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Fill in the neccesary field to upload a seminar paper
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
          />
          <input type="file" onChange={handleFileUpload} />
        </DialogContent>
        <DialogActions>
          <Button onClick={toogleClickOpenForm}>Cancel</Button>
          <Button onClick={toogleClickOpenForm}>Add Paper</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UpdateConferencesAttended;
