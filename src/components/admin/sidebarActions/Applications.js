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
  // Alert,
  // Avatar,
  // Button,
  Chip,
  // Dialog,
  // DialogActions,
  // DialogContent,
  // DialogContentText,
  // DialogTitle,
  // Slide,
  // TextField,
} from "@mui/material";
import { IoMdEye } from "react-icons/io";
import { FcApproval } from "react-icons/fc";
import { ImCancelCircle } from "react-icons/im";
import { client } from "../../../config/axios-request";
import { useNavigate } from "react-router-dom";
import axios from "axios";
// import { MdOutlineAddCircle, MdOutlineModeEdit } from "react-icons/md";
// import { useNavigate } from "react-router-dom";

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

function Applications() {
  let navigate = useNavigate();
  const [errors, setErrors] = useState([]);
  const [promotionalApplications, setPromotionalApplications] = useState([]);

  useEffect(() => {
    client
      .get("admin/all-promotional-applications")
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/admin/login");
          } else {
            setErrors([res.data.errorMessage]);
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
      .catch((error) => console.log(error));
  }, []);

  function viewApplication(promotionId, sp_number) {
    navigate(`/admin/view-application/${sp_number}/${promotionId}`);
  }

  return (
    <div className="promotional__applications">
      <div className="sub__header">
        <h3>Applications</h3>
      </div>
      {promotionalApplications.length ? (
        <div className="applications__table">
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell width={1}>S/N</StyledTableCell>
                  <StyledTableCell align="center">Staff Name</StyledTableCell>
                  <StyledTableCell align="center">
                    Rank applied for
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    Application date
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    Application status
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
                      <StyledTableCell align="center">{`${item.first_name} ${item.last_name}`}</StyledTableCell>
                      <StyledTableCell align="center">
                        {item.rank_being_applied_for}
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
                          {item.status.includes("approved") ||
                          item.status.includes("rejected") ? (
                            <Chip
                              icon={<IoMdEye />}
                              label="View application"
                              variant=""
                              className="icon"
                              onClick={() =>
                                viewApplication(item.id, item.sp_number)
                              }
                            />
                          ) : (
                            <React.Fragment>
                              <Chip
                                icon={<IoMdEye />}
                                label="View application"
                                variant=""
                                className="icon"
                                onClick={() =>
                                  viewApplication(item.id, item.sp_number)
                                }
                              />
                              <Chip
                                icon={<FcApproval />}
                                label="Approve"
                                variant=""
                                className="icon"
                                color="success"
                              />
                              <Chip
                                icon={<ImCancelCircle />}
                                label="Reject"
                                variant=""
                                className="icon"
                                color="error"
                              />
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
        </div>
      ) : (
        <div className="no__details">
          <h3>No promotional applications has been submitted at this time</h3>
        </div>
      )}
    </div>
  );
}

export default Applications;
