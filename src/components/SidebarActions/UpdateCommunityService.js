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

function UpdateCommunityService({ selectedPromotion }) {
  let navigate = useNavigate();

  const [communityServiceDetails, setCommunityServiceDetails] = useState([]);
  const [promotionId, setPromotionId] = useState([]);
  const [error, setError] = useState([]);

  useEffect(() => {
    client
      .get(`/staff/community-service/${selectedPromotion.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          }
        } else {
          setPromotionId(res.data.promotionId);
          setCommunityServiceDetails(
            res.data.communityServices.map((item, index) => {
              return {
                ...item,
                countingId: index + 1,
              };
            })
          );
        }
      })
      .catch((err) => {
        console.log(err);
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

  function addCommunityServiceRow() {
    let lastRow = communityServiceDetails[communityServiceDetails.length - 1];

    if (lastRow) {
      if (
        lastRow.endYear === "" ||
        lastRow.organization === "" ||
        lastRow.position === "" ||
        lastRow.startYear === ""
      ) {
        setError(["Please fill Last row completely"]);
        return;
      }
    } else {
      setCommunityServiceDetails([
        ...communityServiceDetails,
        {
          id: communityServiceDetails.length + 1,
          countingId: communityServiceDetails.length + 1,
          position: "",
          organization: "",
          start_date: "",
          end_date: "",
          editing: true,
        },
      ]);
    }
  }

  function save(countingId, saveType) {
    let lastRow = communityServiceDetails[communityServiceDetails.length - 1];

    if (
      lastRow.end_date === "" ||
      lastRow.organization === "" ||
      lastRow.position === "" ||
      lastRow.start_date === ""
    ) {
      setError(["Please fill all fields"]);
      return;
    }

    if (saveType === "new") {
      client
        .post("/staff/add-community-service", { ...lastRow, promotionId })
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError(["Something went wrong, please try again"]);
            }
          } else {
            setCommunityServiceDetails(
              communityServiceDetails.map((item) => {
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
        .catch((err) => {
          console.log(err);
        });
    } else {
      let itemToEdit = communityServiceDetails.filter(
        (item) => item.countingId === countingId
      )[0];
      client
        .post("/staff/edit-community-service", itemToEdit)
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError(["Something went wrong"]);
            }
          } else {
            setCommunityServiceDetails(
              communityServiceDetails.map((item) => {
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
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function deleteCommunityServiceDetails(countingId) {
    let itemToDelete = communityServiceDetails.filter(
      (item) => item.countingId === countingId
    )[0];

    client
      .delete(`/staff/delete-community-service/${itemToDelete.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError([res.data.errorMessage]);
          }
        } else {
          setCommunityServiceDetails(
            communityServiceDetails.filter(
              (item) => item.countingId !== countingId
            )
          );
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function editCommunityServiceDetails(countingId) {
    setCommunityServiceDetails(
      communityServiceDetails.map((item) => {
        if (item.countingId === countingId) {
          return {
            ...item,
            editing: true,
          };
        }
        return item;
      })
    );
  }

  function editDetails(e, countingId, field) {
    setCommunityServiceDetails(
      communityServiceDetails.map((item) => {
        if (item.countingId === countingId) {
          if (field === "position") {
            return {
              ...item,
              position: e.target.value,
            };
          } else if (field === "organization") {
            return {
              ...item,
              organization: e.target.value,
            };
          } else if (field === "start-year") {
            return {
              ...item,
              start_date: e.target.value,
            };
          } else if (field === "end-year") {
            return {
              ...item,
              end_date: e.target.value,
            };
          }
        }
        return item;
      })
    );
  }

  return (
    <div className="update__community__service">
      <div className="update__community__service__header">
        <h3>Community Service</h3>
      </div>
      <div className="community__service__details">
        {communityServiceDetails.length ? (
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
                      <StyledTableCell align="center">Position</StyledTableCell>
                      <StyledTableCell align="center">
                        Organization
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        Start Year
                      </StyledTableCell>
                      <StyledTableCell align="center">End Year</StyledTableCell>
                      <StyledTableCell align="center">Actions</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  {communityServiceDetails.map((item) => {
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
                                defaultValue={item.organization}
                                inputProps={{ "aria-label": "organization" }}
                                onChange={(e) =>
                                  editDetails(
                                    e,
                                    item.countingId,
                                    "organization"
                                  )
                                }
                              />
                            ) : (
                              item.organization
                            )}
                          </StyledTableCell>
                          <StyledTableCell align="center">
                            {item.editing ? (
                              <Input
                                className="input"
                                defaultValue={item.start_date}
                                inputProps={{ "aria-label": "Start Year" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "start-year")
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
                                inputProps={{ "aria-label": "End Year" }}
                                onChange={(e) =>
                                  editDetails(e, item.countingId, "end-year")
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
                                      deleteCommunityServiceDetails(
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
                                      deleteCommunityServiceDetails(
                                        item.countingId
                                      )
                                    }
                                  />
                                  <AiOutlineEdit
                                    className="icon edit__icon"
                                    onClick={() =>
                                      editCommunityServiceDetails(
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
                    onClick={addCommunityServiceRow}
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
            <h3>No Community Service details uploaded</h3>
            {selectedPromotion.status === "unsubmitted" ? (
              <React.Fragment>
                <p>Click on the "add" button below to add</p>
                <Avatar className="icon__background">
                  <MdOutlineAddCircle
                    className="icon add__icon"
                    onClick={addCommunityServiceRow}
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

export default UpdateCommunityService;
