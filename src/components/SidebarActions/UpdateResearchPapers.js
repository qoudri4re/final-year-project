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
import {
  Alert,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Input,
  TextField,
} from "@mui/material";
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

function UpdateResearchPapers({ selectedPromotion }) {
  let navigate = useNavigate();

  const [researchPapersDetails, setResearchPapersDetails] = useState([]);
  const [error, setError] = useState([]);
  const [researchPaperFile, setResearchPaperFile] = useState(null);
  const [promotionId, setPromotionId] = useState(null);

  function handleFileUpload(e) {
    setResearchPaperFile(e.target.files[0]);
    setResearchPapersDetails(
      researchPapersDetails.map((item) => {
        if (item.id === fileUploadFor) {
          return {
            ...item,
            original_name: e.target.files[0].name,
          };
        }
        return item;
      })
    );
    toogleClickOpenForm();
  }

  const [openForm, setOpenForm] = useState(false);
  const [fileUploadFor, setFileUploadFor] = useState(null);
  function toogleClickOpenForm(id) {
    setOpenForm(!openForm);
    setFileUploadFor(id);
  }
  useEffect(() => {
    client.get(`/staff/research-papers/${selectedPromotion.id}`).then((res) => {
      if (res.data.error) {
        if ("tokenError" in res.data) {
          navigate("/staff/login");
        }
      } else {
        setPromotionId(res.data.promotionId);
        setResearchPapersDetails(
          res.data.researchPapers.map((item, index) => {
            return {
              ...item,
              countingId: index + 1,
            };
          })
        );
      }
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

  function addResearchPaperRow() {
    let lastRow = researchPapersDetails[researchPapersDetails.length - 1];

    if (lastRow) {
      if (
        lastRow.authors === "" ||
        lastRow.original_name === "" ||
        lastRow.presented_at === "" ||
        lastRow.title === "" ||
        lastRow.year === ""
      ) {
        setError(["Please fill Last row completely"]);
        return;
      }
    }

    setResearchPapersDetails([
      ...researchPapersDetails,
      {
        id: researchPapersDetails.length + 1,
        countingId: researchPapersDetails.length + 1,
        title: "",
        original_name: "",
        authors: "",
        year: "",
        presentedAt: "",
        editing: true,
      },
    ]);
  }

  function save(countingId, saveType) {
    let lastRow = researchPapersDetails[researchPapersDetails.length - 1];

    if (
      lastRow.authors === "" ||
      lastRow.original_name === "" ||
      lastRow.presented_at === "" ||
      lastRow.title === "" ||
      lastRow.year === ""
    ) {
      setError(["Please fill all fields"]);
      return;
    }

    if (saveType === "new") {
      const formData = new FormData();
      formData.append("title", lastRow.title);
      formData.append("copy", lastRow.copy);
      formData.append("presented_at", lastRow.presented_at);
      formData.append("year", lastRow.year);
      formData.append("authors", lastRow.authors);
      formData.append("category", "document");
      formData.append("promotionId", promotionId);
      formData.append("file", researchPaperFile);

      client
        .post("/staff/add-research-papers", formData)
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError([res.data.errorMessage]);
            }
          } else {
            setResearchPapersDetails(
              researchPapersDetails.map((item) => {
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
      let itemToEdit = researchPapersDetails.filter(
        (item) => item.countingId === countingId
      )[0];

      client
        .post("/staff/edit-research-paper", itemToEdit)
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            }
          } else {
            setResearchPapersDetails(
              researchPapersDetails.map((item) => {
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

  function deleteResearchPapersDetails(countingId) {
    let itemToDelete = researchPapersDetails.filter(
      (item) => item.countingId === countingId
    )[0];

    if (!itemToDelete.editing) {
      client
        .delete(`/staff/delete-research-paper/${itemToDelete.id}`)
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError([res.data.errorMessage]);
            }
          } else {
          }
        });
    }

    let filteredData = researchPapersDetails.filter(
      (item) => item.countingId !== countingId
    );

    setResearchPapersDetails(
      filteredData.map((item, index) => {
        return {
          ...item,
          countingId: index + 1,
        };
      })
    );
  }

  function editResearchPapersDetails(countingId) {
    setResearchPapersDetails(
      researchPapersDetails.map((item) => {
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
    setResearchPapersDetails(
      researchPapersDetails.map((item) => {
        if (item.countingId === countingId) {
          if (field === "title") {
            return {
              ...item,
              title: e.target.value,
            };
          } else if (field === "authors") {
            return {
              ...item,
              authors: e.target.value,
            };
          } else if (field === "year") {
            return {
              ...item,
              year: e.target.value,
            };
          } else if (field === "presented-at") {
            return {
              ...item,
              presented_at: e.target.value,
            };
          }
        }
        return item;
      })
    );
  }

  return (
    <div className="update__research__papers">
      <div className="update__research__papers__header">
        <h3>Research Papers</h3>
      </div>
      <div className="research__papers__details">
        {researchPapersDetails.length ? (
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
                      <StyledTableCell align="right">Authors</StyledTableCell>
                      <StyledTableCell align="left">
                        Presented At
                      </StyledTableCell>
                      <StyledTableCell align="left">Copy</StyledTableCell>
                      <StyledTableCell align="right">Year</StyledTableCell>
                      <StyledTableCell align="right">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  {researchPapersDetails.map((item) => {
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
                          <StyledTableCell align="left">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.authors}
                                inputProps={{ "aria-label": "authors" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "authors")
                                }
                              />
                            ) : (
                              item.authors
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.presented_at}
                                inputProps={{ "aria-label": "presented at" }}
                                onChange={(e) =>
                                  editDetails(
                                    e,
                                    item.countingId,
                                    "presented-at"
                                  )
                                }
                              />
                            ) : (
                              item.presented_at
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="left">
                            {item.editing ? (
                              item.original_name !== "" ? (
                                item.original_name
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
                              item.original_name
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="right">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.year}
                                inputProps={{ "aria-label": "year" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "year")
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
                                      deleteResearchPapersDetails(
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
                                      deleteResearchPapersDetails(
                                        item.countingId
                                      )
                                    }
                                  />
                                  <AiOutlineEdit
                                    className="icon edit__icon"
                                    onClick={() =>
                                      editResearchPapersDetails(item.countingId)
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
                    onClick={addResearchPaperRow}
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
            {selectedPromotion.status === "unsubmitted" ? (
              <React.Fragment>
                <p>Click on the "add" button below to add</p>
                <Avatar className="icon__background">
                  <MdOutlineAddCircle
                    className="icon add__icon"
                    onClick={addResearchPaperRow}
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
            Fill in the neccesary field to upload a research paper
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
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UpdateResearchPapers;
