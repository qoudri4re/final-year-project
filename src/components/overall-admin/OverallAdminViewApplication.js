import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TextField,
} from "@mui/material";
import { MdOutlineAddCircle } from "react-icons/md";
import { ImCancelCircle } from "react-icons/im";
import { FcApproval } from "react-icons/fc";
import { IoMdEye } from "react-icons/io";
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

function OverallAdminViewApplication() {
  let navigate = useNavigate();
  const { promotionId } = useParams();
  const { spNumber } = useParams();

  const [pageData, setPageData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  function downloadFile(filePath, fileName) {
    filePath = filePath.replace(/\\/g, "/");
    client
      .post("/download", { filePath, fileName }, { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }

  useEffect(() => {
    let timeoutId;
    if (errors) {
      timeoutId = setTimeout(() => {
        setErrors([]);
      }, 6000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [errors]);

  useEffect(() => {
    let timeoutId;
    if (successMessage) {
      timeoutId = setTimeout(() => {
        setSuccessMessage([]);
      }, 6000);
    }

    return () => {
      clearTimeout(timeoutId);
    };
  }, [successMessage]);

  function getPage() {
    client
      .get(`/admin/promotional-data/${spNumber}/${promotionId}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/super-admin/login");
          } else {
            setErrors([res.data.errorMessage]);
          }
        } else {
          setPageData(res.data);
        }
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getPage();
  }, [promotionId, spNumber]);

  const [openApprovePromotionDialog, setOpenApprovePromotionDialog] =
    useState(false);
  let rejectionReason = "";

  function handleRejectionReasonTextChange(e) {
    rejectionReason = e.target.value;
  }
  function toogleApprovePromotionDialog() {
    setOpenApprovePromotionDialog(!openApprovePromotionDialog);
  }

  const [openRejectPromotionDialog, setOpenRejectPromotionDialog] =
    useState(false);

  function rejectApplication() {
    client
      .post("/admin/super-admin/reject-promotion", {
        promotionId,
        rejectionMessage: rejectionReason,
      })
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/super-admin/login");
          } else {
            setErrors([res.data.errorMessage]);
          }
        } else {
          getPage();
          toogleOpenRejectPromotionDialog();
        }
      })
      .catch((err) => {
        console.log(err);
        setErrors(["Something went wrong"]);
      });
  }

  function toogleOpenRejectPromotionDialog() {
    setOpenRejectPromotionDialog(!openRejectPromotionDialog);
  }

  function approveApplication() {
    client
      .post("/admin/super-admin/approve-application", { promotionId, spNumber })
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/admin/login");
          } else {
            setErrors([res.data.errorMessage]);
          }
        } else {
          setPageData({
            ...pageData,
            promotionData: res.data.promotionData,
          });
          setPageData(null);
          getPage();
          toogleApprovePromotionDialog();
        }
      })
      .catch((error) => setErrors(["Something went wrong"]));
  }

  if (pageData) {
    return (
      <div className="application">
        {errors.length ? (
          <Alert variant="filled" severity="error" className="error__popup">
            {errors[0]}
          </Alert>
        ) : (
          ""
        )}
        {successMessage ? (
          <Alert variant="filled" severity="success" className="popup">
            {successMessage}
          </Alert>
        ) : (
          ""
        )}
        <div className="contents">
          <div className="sub__header action__header">
            <h3>
              {pageData.staffData.first_name} {pageData.staffData.last_name},
              Application details
            </h3>
            <div className="application__actions">
              <Chip
                label={pageData.promotionData.status}
                variant=""
                className="icon"
                color={
                  pageData.promotionData.status.includes("approved")
                    ? "success"
                    : "error"
                }
              />

              {pageData.promotionData.status === "approved" ||
              pageData.promotionData.status === "rejected" ? (
                ""
              ) : (
                <React.Fragment>
                  <Chip
                    icon={<FcApproval />}
                    label="Approve application"
                    variant=""
                    className="icon"
                    color="success"
                    onClick={toogleApprovePromotionDialog}
                  />

                  <Chip
                    icon={<ImCancelCircle />}
                    label="Reject appliation"
                    variant=""
                    className="icon"
                    color="error"
                    onClick={toogleOpenRejectPromotionDialog}
                  />
                </React.Fragment>
              )}
            </div>
          </div>
          <div className="education application__data">
            <div className="sub__header">
              <h3>Education</h3>
            </div>
            <div className="application__data__contents">
              {pageData.education.length ? (
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
                        <StyledTableCell align="center">
                          Institution
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Date of Award
                        </StyledTableCell>
                        <StyledTableCell align="center">Point</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    {pageData.education.map((item, index) => {
                      return (
                        <TableBody className="table__row" key={item.id}>
                          <StyledTableRow>
                            <StyledTableCell component="th" scope="row">
                              {index + 1}.
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.degree}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.class_of_degree}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.institution}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.date_of_award}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.point ? item.point : 0}
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableBody>
                      );
                    })}
                  </Table>
                </TableContainer>
              ) : (
                <div className="no__details">
                  <h3>No educational details uploaded</h3>
                </div>
              )}
              <div className="total__points">
                <h3>Total Points: 0</h3>
              </div>
            </div>
          </div>
          <div className="experience application__data">
            <div className="sub__header">
              <h3>Experience </h3>
            </div>
            <div className="application__data__contents">
              {pageData.teaching_experience.length ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell width={1}>S/N</StyledTableCell>
                        <StyledTableCell align="center">
                          Designation
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Institution
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Nature Of Duty
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Duration
                        </StyledTableCell>
                        <StyledTableCell align="center">Point</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    {pageData.teaching_experience.map((item, index) => {
                      return (
                        <TableBody className="table__row" key={item.id}>
                          <StyledTableRow>
                            <StyledTableCell component="th" scope="row">
                              {index + 1}.
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.designation}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.institution}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.nature_of_duty}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.start_date}-{item.end_date}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.point ? item.point : 0}
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableBody>
                      );
                    })}
                  </Table>
                </TableContainer>
              ) : (
                <div className="no__details">
                  <h3>No experience details submitted</h3>
                </div>
              )}
              <div className="total__points">
                <h3>Total Points: 0</h3>
              </div>
            </div>
          </div>
          <div className="courses__taught application__data">
            <div className="sub__header">
              <h3>Courses taught </h3>
            </div>
            <div className="application__data__contents">
              {pageData.courses_taught.length ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell width={1}>S/N</StyledTableCell>
                        <StyledTableCell align="center">
                          Course Code
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Course Title
                        </StyledTableCell>
                        <StyledTableCell align="center">Unit</StyledTableCell>
                        <StyledTableCell align="center">
                          Semester
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Contribution
                        </StyledTableCell>
                        <StyledTableCell align="center">Load</StyledTableCell>
                        <StyledTableCell align="center">Point</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    {pageData.courses_taught.map((item, index) => {
                      return (
                        <TableBody className="table__row" key={index + 1}>
                          <StyledTableRow>
                            <StyledTableCell component="th" scope="row">
                              {index + 1}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.course_code}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.course_title}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.unit}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.semester}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.contribution}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.teaching_load}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.point ? item.point : 0}
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableBody>
                      );
                    })}
                  </Table>
                </TableContainer>
              ) : (
                <div className="no__details">
                  <h3>No details submitted for this section</h3>
                </div>
              )}
              <div className="total__points">
                <h3>Total Points: 0</h3>
              </div>
            </div>
          </div>
          <div className="supervision application__data">
            <div className="sub__header">
              <h3>Post Graduate Supervision</h3>
            </div>
            <div className="application__data__contents">
              {pageData.post_graduate_supervision.length ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell width={1}>S/N</StyledTableCell>
                        <StyledTableCell align="center">Name</StyledTableCell>
                        <StyledTableCell align="center">
                          Admission Number
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Thesis/Dissertation Title
                        </StyledTableCell>
                        <StyledTableCell align="center">Degree</StyledTableCell>
                        <StyledTableCell align="center">Status</StyledTableCell>
                        <StyledTableCell align="center">
                          Institution
                        </StyledTableCell>
                        <StyledTableCell align="center">Year</StyledTableCell>
                        <StyledTableCell align="center">Point</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    {pageData.post_graduate_supervision.map((item, index) => {
                      return (
                        <TableBody className="table__row" key={index + 1}>
                          <StyledTableRow>
                            <StyledTableCell component="th" scope="row">
                              {index + 1}.
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.name}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.admission_number}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.thesis_title}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.degree}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.status}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.institution}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.year}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.point ? item.point : 0}
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableBody>
                      );
                    })}
                  </Table>
                </TableContainer>
              ) : (
                <div className="no__details">
                  <h3>No supervision details submitted</h3>
                </div>
              )}
              <div className="total__points">
                <h3>Total Points: 0</h3>
              </div>
            </div>
          </div>
          <div className="supervision application__data">
            <div className="sub__header">
              <h3>Undergraduate Supervision </h3>
            </div>
            <div className="application__data__contents">
              {pageData.undergraduate_supervision.length ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell width={1}>S/N</StyledTableCell>
                        <StyledTableCell align="center">Name</StyledTableCell>
                        <StyledTableCell align="center">
                          Admission Number
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Project Title
                        </StyledTableCell>
                        <StyledTableCell align="center">Point</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    {pageData.undergraduate_supervision.map((item, index) => {
                      return (
                        <TableBody className="table__row" key={index + 1}>
                          <StyledTableRow>
                            <StyledTableCell component="th" scope="row">
                              {index + 1}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.name}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.admission_number}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.project_title}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.point ? item.point : 0}
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableBody>
                      );
                    })}
                  </Table>
                </TableContainer>
              ) : (
                <div className="no__details">
                  <h3>No post graduate supervision details submitted</h3>
                </div>
              )}
              <div className="total__points">
                <h3>Total Points: 0</h3>
              </div>
            </div>
          </div>
          <div className="research__papers application__data">
            <div className="sub__header">
              <h3>Research papers</h3>
            </div>
            <div className="application__data__contents">
              {pageData.research_papers.length ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell width={1}>S/N</StyledTableCell>
                        <StyledTableCell align="center">Title</StyledTableCell>
                        <StyledTableCell align="center">
                          authors
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Presented At
                        </StyledTableCell>
                        <StyledTableCell align="center">Paper</StyledTableCell>
                        <StyledTableCell align="center">Year</StyledTableCell>
                        <StyledTableCell align="center">Point</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    {pageData.research_papers.map((item, index) => {
                      return (
                        <TableBody className="table__row" key={index + 1}>
                          <StyledTableRow>
                            <StyledTableCell component="th" scope="row">
                              {index + 1}.
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.title}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.authors}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.presented_at}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Button
                                variant="contained"
                                onClick={() =>
                                  downloadFile(
                                    item.research_paper_file_path,
                                    item.research_paper_filename
                                  )
                                }
                              >
                                View Paper
                              </Button>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.year}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.point ? item.point : 0}
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableBody>
                      );
                    })}
                  </Table>
                </TableContainer>
              ) : (
                <div className="no__details">
                  <h3>No research research paper submitted</h3>
                </div>
              )}
              <div className="total__points">
                <h3>Total Points: 0</h3>
              </div>
            </div>
          </div>
          <div className="publications application__data">
            <div className="sub__header">
              <h3>Publications </h3>
            </div>
            <div className="application__data__contents">
              {pageData.publications.length ? (
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
                        <StyledTableCell align="center">Year</StyledTableCell>
                        <StyledTableCell align="center">Point</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    {pageData.publications.map((item, index) => {
                      return (
                        <TableBody className="table__row" key={index + 1}>
                          <StyledTableRow>
                            <StyledTableCell component="th" scope="row">
                              {index + 1}.
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.title}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.issn}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.doi}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.publisher}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.year}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.point ? item.point : 0}
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableBody>
                      );
                    })}
                  </Table>
                </TableContainer>
              ) : (
                <div className="no__details">
                  <h3>No publication details submitted</h3>
                </div>
              )}
              <div className="total__points">
                <h3>Total Points: 0</h3>
              </div>
            </div>
          </div>
          <div className="computer__literacy application__data">
            <div className="sub__header">
              <h3>Computer Literacy </h3>
            </div>
            <div className="application__data__contents">
              {pageData.computer_literacy.length ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell width={1}>S/N</StyledTableCell>
                        <StyledTableCell align="center">
                          Certificate Title
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Certificate
                        </StyledTableCell>
                        <StyledTableCell align="center">Year</StyledTableCell>
                        <StyledTableCell align="center">Point</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="table__row">
                      {pageData.computer_literacy.map((item, index) => {
                        return (
                          <StyledTableRow key={index + 1}>
                            <StyledTableCell component="th" scope="row">
                              {index + 1}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.certificate_title}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Button
                                variant="contained"
                                onClick={() =>
                                  downloadFile(
                                    item.certificate_file_path,
                                    item.certificate_file_name
                                  )
                                }
                              >
                                View Certificate
                              </Button>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.year}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.point ? item.point : 0}
                            </StyledTableCell>
                          </StyledTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div className="no__details">
                  <h3>No educational details uploaded</h3>
                </div>
              )}
              <div className="total__points">
                <h3>Total Points: 0</h3>
              </div>
            </div>
          </div>
          <div className="administrative__and__organizational__experience application__data">
            <div className="sub__header">
              <h3>Administrative and Organization experience </h3>
            </div>
            <div className="application__data__contents">
              {pageData.administrativeAndOrganizationalExperience.length ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell width={1}>S/N</StyledTableCell>
                        <StyledTableCell align="center">Title</StyledTableCell>
                        <StyledTableCell align="center">
                          Start Date
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          End Date
                        </StyledTableCell>
                        <StyledTableCell align="center">Point</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="table__row">
                      {pageData.administrativeAndOrganizationalExperience.map(
                        (item, index) => {
                          return (
                            <StyledTableRow key={index + 1}>
                              <StyledTableCell component="th" scope="row">
                                {index}.
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {item.title}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {item.start_date}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {item.end_date}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {item.point ? item.point : 0}
                              </StyledTableCell>
                            </StyledTableRow>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div className="no__details">
                  <h3>No details submitted for this section</h3>
                </div>
              )}
              <div className="total__points">
                <h3>Total Points: 0</h3>
              </div>
            </div>
          </div>
          <div className="community__service application__data">
            <div className="sub__header">
              <h3>Community Service </h3>
            </div>
            <div className="application__data__contents">
              {pageData.communityService.length ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell width={1}>S/N</StyledTableCell>
                        <StyledTableCell align="center">
                          Position
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Organization
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          Start Date
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          End Date
                        </StyledTableCell>
                        <StyledTableCell align="center">Point</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody className="table__row">
                      {pageData.communityService.map((item, index) => {
                        return (
                          <StyledTableRow key={index + 1}>
                            <StyledTableCell component="th" scope="row">
                              {index + 1}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.position}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.organization}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.start_date}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.end_date}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.point ? item.point : 0}
                            </StyledTableCell>
                          </StyledTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <div className="no__details">
                  <h3>No educational details uploaded</h3>
                </div>
              )}
              <div className="total__points">
                <h3>Total Points: 0</h3>
              </div>
            </div>
          </div>
          <div className="hod__assessment application__data">
            <div className="sub__header">
              <h3>Hod's assessment</h3>
            </div>
            <div className="application__data__contents">
              {pageData.hod_assessment.length ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell width={1}>S/N</StyledTableCell>
                        <StyledTableCell align="left">ITEM</StyledTableCell>
                        <StyledTableCell align="center">Score</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    {pageData.hod_assessment.map((item, index) => {
                      return (
                        <TableBody className="table__row" key={index + 1}>
                          <StyledTableRow>
                            <StyledTableCell component="th" scope="row">
                              {index + 1}.
                            </StyledTableCell>
                            <StyledTableCell align="left">
                              {item.item}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {item.score}
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableBody>
                      );
                    })}
                  </Table>
                </TableContainer>
              ) : (
                <div className="no__details">
                  <h3>No assessment added, click the add button to add</h3>
                  <Avatar className="icon__background">
                    <MdOutlineAddCircle className="icon add__icon" />
                  </Avatar>
                </div>
              )}
              <div className="total__points">
                <h3>Total Points: 0</h3>
              </div>
            </div>
          </div>
          <div className="total__points grand__total">
            <h3>Grand Total Points: 0</h3>
          </div>
        </div>

        <Dialog
          open={openApprovePromotionDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Accept Application</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to approve this application?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={toogleApprovePromotionDialog}>Cancel</Button>
            <Button onClick={approveApplication} autoFocus>
              Yes
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={openRejectPromotionDialog}
          onClose={toogleOpenRejectPromotionDialog}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>Reject promotion application</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Please enter a reason for the rejection
            </DialogContentText>
            <TextField
              autoFocus
              required
              margin="dense"
              id="rejection-reason"
              name="rejection-reason"
              label="Rejection Reason"
              type="text"
              fullWidth
              variant="standard"
              onChange={(e) => handleRejectionReasonTextChange(e)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={toogleOpenRejectPromotionDialog}>Cancel</Button>
            <Button onClick={rejectApplication}>Reject</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
  return (
    <div className="loading__background">
      <Box>
        <CircularProgress />
      </Box>
    </div>
  );
}

export default OverallAdminViewApplication;
