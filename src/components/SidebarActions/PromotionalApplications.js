import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  TextField,
} from "@mui/material";
import { IoMdEye } from "react-icons/io";
import { MdOutlineAddCircle, MdOutlineModeEdit } from "react-icons/md";
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

let applicationStatusLableColor = {
  unsubmitted: "primary",
  rejected: "error",
  approved: "success",
  submitted: "secondary",
  "department rejected": "error",
  "department approved": "success",
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function PromotionalApplications({ setSelectedPromotion }) {
  let navigate = useNavigate();
  const [error, setError] = useState([]);
  const [promotionalApplications, setPromotionalApplications] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  // const [newPromotionData, setNewPromotionData] = useState({ rank_name: "" });
  const [newPromotionDataError, setNewPromotionDataError] = useState(false);
  const [nextRank, setNextRank] = useState(null);

  function toogleClickOpenForm() {
    if (!openForm) {
      getNextRank();
    } else {
      setOpenForm(!openForm);
    }
  }

  function getNextRank() {
    client
      .get("/staff/get-staff-next-rank")
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError([res.data.errorMessage]);
          }
        } else {
          setNextRank(res.data.newRank.rank_name);
          setOpenForm(!openForm);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // function handleChanges(e) {
  //   if (e.target.value === "") {
  //     setNewPromotionDataError(true);
  //   } else {
  //     setNewPromotionDataError(false);
  //   }
  //   setNewPromotionData({
  //     ...newPromotionData,
  //     [e.target.name]: e.target.value,
  //   });
  // }

  function viewApplication(id) {
    let itemSelected = promotionalApplications.filter(
      (item) => item.id === id
    )[0];

    setSelectedPromotion(itemSelected);
  }

  useEffect(() => {
    client
      .get("/staff/promotional-applications")
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError([res.data.errorMessage]);
          }
        } else {
          setPromotionalApplications(
            res.data.promotionalApplications.map((item, index) => {
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
  }, [navigate]);

  function createPromotionalApplication() {
    if (nextRank !== "") {
      client
        .post("/staff/new-promotion-application", { rank_name: nextRank })
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError([res.data.errorMessage]);
            }
          } else {
            setPromotionalApplications(
              res.data.promotionalApplications.map((item, index) => {
                return {
                  ...item,
                  countingId: index + 1,
                };
              })
            );
            toogleClickOpenForm();
          }
        })
        .catch((error) => console.log(error));
    } else {
      setNewPromotionDataError(true);
    }
  }

  const [openSubmitApplicationDialog, setOpenSubmitApplicationDialog] =
    useState(false);
  const [applicationToSubmitPromotionId, setApplicationToSubmitPromotionId] =
    useState(null);

  function toogleSubmitApplicationDialog(id) {
    setApplicationToSubmitPromotionId(id);
    setOpenSubmitApplicationDialog(!openSubmitApplicationDialog);
  }

  function submitApplication() {
    client
      .post("/staff/submit-application", {
        promotionId: applicationToSubmitPromotionId,
      })
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError([res.data.errorMessage]);
          }
        } else {
          setPromotionalApplications(
            promotionalApplications.map((item) => {
              if (item.id === applicationToSubmitPromotionId) {
                return {
                  ...item,
                  status: "submitted",
                };
              }
              return item;
            })
          );
        }
      })
      .catch((error) => console.log(error));
    toogleSubmitApplicationDialog(null);
  }

  return (
    <div className="promotional__applications">
      <div className="sub__header">
        <h3>Promotional Applications</h3>
      </div>
      {error.length ? (
        <Alert variant="filled" severity="error" className="error__popup">
          {error[0]}
        </Alert>
      ) : (
        ""
      )}
      {promotionalApplications.length ? (
        <div className="applications">
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell width={1}>S/N</StyledTableCell>
                  <StyledTableCell align="center">Rank Name</StyledTableCell>
                  <StyledTableCell align="center">
                    Application Date
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    Rank Application status
                  </StyledTableCell>
                  <StyledTableCell align="center">Actions</StyledTableCell>
                </TableRow>
              </TableHead>

              {promotionalApplications.map((item) => {
                return (
                  <TableBody className="table__row" key={item.countingId}>
                    <StyledTableRow>
                      <StyledTableCell component="th" scope="row">
                        {item.countingId}.
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {item.rank_name}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {item.application_date}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Chip
                          label={item.status}
                          color={applicationStatusLableColor[item.status]}
                        />
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <div className="action__buttons">
                          <Chip
                            onClick={() => viewApplication(item.id)}
                            icon={<IoMdEye />}
                            label="View Application"
                            className="icon"
                          />
                          {item.status === "unsubmitted" ? (
                            <Chip
                              icon={<MdOutlineModeEdit />}
                              label="Edit Application"
                              variant=""
                              className="icon"
                            />
                          ) : (
                            <Chip
                              icon={<MdOutlineModeEdit />}
                              label="Edit Application"
                              variant=""
                              className="not__allowed"
                            />
                          )}
                          {item.status === "unsubmitted" ? (
                            <Chip
                              icon={<MdOutlineModeEdit />}
                              label="Submit Application"
                              variant=""
                              className="icon"
                              onClick={() =>
                                toogleSubmitApplicationDialog(item.id)
                              }
                            />
                          ) : (
                            <Chip
                              icon={<MdOutlineModeEdit />}
                              label="Submit Application"
                              variant=""
                              className="not__allowed"
                            />
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
              onClick={toogleClickOpenForm}
            />
          </Avatar>
        </div>
      ) : (
        <div className="no__details">
          <h3>You have no promotional application</h3>
          <p>Click on the "add" button below to begin</p>
          <Avatar className="icon__background">
            <MdOutlineAddCircle
              className="icon add__icon"
              onClick={toogleClickOpenForm}
            />
          </Avatar>
        </div>
      )}
      <Dialog open={openForm} fullWidth>
        <DialogTitle>Apply for promotion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your next rank is calulated based on your previous rank
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rank_name"
            name="rank_name"
            label="Rank being applied for"
            type="text"
            fullWidth
            variant="standard"
            defaultValue={nextRank}
            InputProps={{
              readOnly: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={toogleClickOpenForm}>Cancel</Button>
          <Button onClick={createPromotionalApplication}>Continue</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openSubmitApplicationDialog}
        TransitionComponent={Transition}
        keepMounted
        // onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Submit Application?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Please be informed that upon submission of your application, editing
            privileges will no longer be available. We strongly advise reviewing
            your application thoroughly before final submission to ensure
            accuracy and completeness. Once submitted, changes cannot be made.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={toogleSubmitApplicationDialog}>Cancel</Button>
          <Button onClick={submitApplication}>Submit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default PromotionalApplications;
