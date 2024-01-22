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

function UpdatePublications({ selectedPromotion }) {
  const [publicationDetails, setPublicationDetails] = useState([]);
  const [error, setError] = useState([]);
  const [promotionId, setPromotionId] = useState(null);

  let navigate = useNavigate();

  useEffect(() => {
    client.get(`/staff/publications/${selectedPromotion.id}`).then((res) => {
      if (res.data.error) {
        if ("tokenError" in res.data) {
          navigate("/staff/login");
        }
      } else {
        setPromotionId(res.data.promotionId);
        setPublicationDetails(
          res.data.publications.map((item, index) => {
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

  function addPublicationRow() {
    let lastRow = publicationDetails[publicationDetails.length - 1];

    if (lastRow) {
      if (
        lastRow.issn === "" ||
        lastRow.number_of_authors === "" ||
        lastRow.doi === "" ||
        lastRow.title === "" ||
        lastRow.year === "" ||
        lastRow.type_of_publication === "" ||
        lastRow.publisher === "" ||
        lastRow.position === ""
      ) {
        setError(["Please fill last row completely"]);
        return;
      }
    }

    setPublicationDetails([
      ...publicationDetails,
      {
        id: publicationDetails.length + 1,
        countingId: publicationDetails.length + 1,
        title: "",
        issn: "",
        doi: "",
        number_of_authors: "",
        publisher: "",
        position: "",
        year: "",
        type_of_publication: "",
        editing: true,
      },
    ]);
  }

  function save(countingId, saveType) {
    let lastRow = publicationDetails[publicationDetails.length - 1];

    if (
      lastRow.issn === "" ||
      lastRow.number_of_authors === "" ||
      lastRow.doi === "" ||
      lastRow.title === "" ||
      lastRow.year === "" ||
      lastRow.type_of_publication === "" ||
      lastRow.publisher === "" ||
      lastRow.position === ""
    ) {
      setError(["Please fill all fields"]);
      return;
    }

    if (saveType === "new") {
      client
        .post("/staff/add-publication", { ...lastRow, promotionId })
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError([res.data.error]);
            }
          } else {
            setPublicationDetails(
              publicationDetails.map((item) => {
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
      let itemToEdit = publicationDetails.filter(
        (item) => item.countingId === countingId
      )[0];
      client.post("/staff/edit-publication", itemToEdit).then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError([res.data.errorMessage]);
          }
        } else {
          setPublicationDetails(
            publicationDetails.map((item) => {
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

  function deletePublicationDetails(countingId) {
    let itemToDelete = publicationDetails.filter(
      (item) => item.countingId === countingId
    )[0];

    client
      .delete(`/staff/delete-publication/${itemToDelete.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError") {
            navigate("/staff/login");
          } else {
            setError([res.data.errorMessage]);
          }
        } else {
          let filteredData = publicationDetails.filter(
            (item) => item.countingId !== countingId
          );

          setPublicationDetails(
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

  function editPublicationDetails(countingId) {
    setPublicationDetails(
      publicationDetails.map((item) => {
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
    setPublicationDetails(
      publicationDetails.map((item) => {
        if (item.countingId === countingId) {
          if (field === "title") {
            return {
              ...item,
              title: e.target.value,
            };
          } else if (field === "issn") {
            return {
              ...item,
              issn: e.target.value,
            };
          } else if (field === "doi") {
            return {
              ...item,
              doi: e.target.value,
            };
          } else if (field === "no-of-authors") {
            return {
              ...item,
              number_of_authors: e.target.value,
            };
          } else if (field === "year") {
            return {
              ...item,
              year: e.target.value,
            };
          } else if (field === "position") {
            return {
              ...item,
              position: e.target.value,
            };
          } else if (field === "publisher") {
            return {
              ...item,
              publisher: e.target.value,
            };
          } else if (field === "type-of-publication") {
            return {
              ...item,
              type_of_publication: e.target.value,
            };
          }
        }
        return item;
      })
    );
  }

  return (
    <div className="update__publication">
      <div className="update__publication__header">
        <h3>Publications</h3>
      </div>
      <div className="publication__details">
        {publicationDetails.length ? (
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
                      <StyledTableCell align="center">ISSN</StyledTableCell>
                      <StyledTableCell align="center">DOI</StyledTableCell>
                      <StyledTableCell align="center">
                        Publisher
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        Type Of Publication
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        No of Authors
                      </StyledTableCell>
                      <StyledTableCell align="center">Position</StyledTableCell>
                      <StyledTableCell align="right">Year</StyledTableCell>
                      <StyledTableCell align="right">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  {publicationDetails.map((item) => {
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
                                defaultValue={item.issn}
                                inputProps={{ "aria-label": "ISSN" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "issn")
                                }
                              />
                            ) : (
                              item.issn
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.doi}
                                inputProps={{ "aria-label": "DOI" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "doi")
                                }
                              />
                            ) : (
                              item.doi
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.publisher}
                                inputProps={{ "aria-label": "publisher" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "publisher")
                                }
                              />
                            ) : (
                              item.publisher
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.type_of_publication}
                                inputProps={{
                                  "aria-label": "Type of Publication",
                                }}
                                onChange={(e) =>
                                  editDetails(
                                    e,
                                    item.countingId,
                                    "type-of-publication"
                                  )
                                }
                              />
                            ) : (
                              item.type_of_publication
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.number_of_authors}
                                inputProps={{ "aria-label": "no of Authors" }}
                                onChange={(e) =>
                                  editDetails(
                                    e,
                                    item.countingId,
                                    "no-of-authors"
                                  )
                                }
                              />
                            ) : (
                              item.number_of_authors
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.position}
                                inputProps={{ "aria-label": "position" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "position")
                                }
                              />
                            ) : (
                              item.position
                            )}
                          </StyledTableCell>

                          <StyledTableCell align="center">
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
                                      deletePublicationDetails(item.countingId)
                                    }
                                  />
                                </React.Fragment>
                              ) : selectedPromotion.status === "unsubmitted" ? (
                                <React.Fragment>
                                  <MdOutlineDelete
                                    className="icon delete__icon"
                                    onClick={() =>
                                      deletePublicationDetails(item.countingId)
                                    }
                                  />
                                  <AiOutlineEdit
                                    className="icon edit__icon"
                                    onClick={() =>
                                      editPublicationDetails(item.countingId)
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
                    onClick={addPublicationRow}
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
            <h3>No Publication details uploaded</h3>
            {selectedPromotion.status === "unsubmitted" ? (
              <React.Fragment>
                <p>Click on the "add" button below to add</p>
                <Avatar className="icon__background">
                  <MdOutlineAddCircle
                    className="icon add__icon"
                    onClick={addPublicationRow}
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

export default UpdatePublications;
