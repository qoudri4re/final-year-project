import React, { useEffect, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardActions,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { client } from "../../config/axios-request";
import { useNavigate } from "react-router-dom";
import { MdOutlineAddCircle } from "react-icons/md";

function UpdateComputerLiteracy({ selectedPromotion }) {
  let navigate = useNavigate();

  const [
    computerLiteracyCertificatesData,
    setComputerLiteracyCertificatesData,
  ] = useState([]);
  const [error, setError] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [formDataToSend, setFormDataToSend] = useState({
    title: "",
    year: "",
    file: "",
  });
  const [promotionId, setPromotionId] = useState(null);

  function toogleClickOpenForm() {
    setOpenForm(!openForm);
  }

  function handleOnChange(e, field) {
    if (field === "title") {
      setFormDataToSend({
        ...formDataToSend,
        [e.target.name]: e.target.value,
      });
    } else if (field === "year") {
      setFormDataToSend({
        ...formDataToSend,
        [e.target.name]: e.target.value,
      });
    } else {
      setFormDataToSend({
        ...formDataToSend,
        file: e.target.files[0],
      });
    }
  }

  function deleteCertificate(id) {
    let certificateToDelete = computerLiteracyCertificatesData.filter(
      (item) => item.id === id
    )[0];

    client
      .delete(
        `/staff/delete-computer-literacy/${certificateToDelete.id}/${certificateToDelete.certificate_file_name}`
      )
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError([res.data.errorMessage]);
          }
        } else {
          setComputerLiteracyCertificatesData(
            computerLiteracyCertificatesData.filter((item) => item.id !== id)
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleSubmit() {
    if (
      formDataToSend.file &&
      formDataToSend.title !== "" &&
      formDataToSend.year !== ""
    ) {
      const formData = new FormData();
      formData.append("title", formDataToSend.title);
      formData.append("year", formDataToSend.year);
      formData.append("promotionId", promotionId);
      formData.append("category", "image");
      formData.append("file", formDataToSend.file);
      client
        .post("/staff/add-computer-literacy", formData)
        .then((res) => {
          if (res.data.error) {
            if ("tokenError" in res.data) {
              navigate("/staff/login");
            } else {
              setError([res.data.errorMessage]);
            }
          } else {
            setComputerLiteracyCertificatesData([
              ...computerLiteracyCertificatesData,
              {
                id: res.data.insertId,
                certificate_title: res.data.certificate_title,
                year: res.data.year,
                certificate_file_name: res.data.certificate_file_name,
              },
            ]);
            toogleClickOpenForm();
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setError(["Please fill all fields"]);
    }
  }

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

  useEffect(() => {
    client
      .get(`/staff/computer-literacy/${selectedPromotion.id}`)
      .then((res) => {
        if (res.data.error) {
          if ("tokenError" in res.data) {
            navigate("/staff/login");
          } else {
            setError([res.data.errorMessage]);
          }
        } else {
          setPromotionId(res.data.promotionId);
          setComputerLiteracyCertificatesData(
            res.data.computerLiteracyCertificates.map((item, index) => {
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

  return (
    <div className="update__computer__literacy">
      <div className="update__computer__literacy__header">
        <h3>Computer Literacy</h3>
      </div>
      {error.length ? (
        <Alert variant="filled" severity="error" className="error__popup">
          {error[0]}
        </Alert>
      ) : (
        ""
      )}
      <div className="computer__literacy__details">
        {computerLiteracyCertificatesData.length ? (
          <div className="uploaded__details">
            {computerLiteracyCertificatesData.map((item) => {
              return (
                <Card sx={{ maxWidth: 345 }} className="card" key={item.id}>
                  <CardMedia
                    sx={{ height: 140 }}
                    image={`http://localhost:3001/files/images/${item.certificate_file_name}`}
                    title={item.certificate_title}
                  />
                  <div className="card__content">
                    <h4>{item.certificate_title}</h4>
                    <p> {item.year} </p>
                  </div>
                  <CardActions>
                    <Button
                      size="small"
                      disabled={selectedPromotion.status !== "unsubmitted"}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      disabled={selectedPromotion.status !== "unsubmitted"}
                      onClick={() => deleteCertificate(item.id)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
            {selectedPromotion.status === "unsubmitted" ? (
              <div className="add__container">
                <Avatar>
                  <AiOutlinePlus onClick={toogleClickOpenForm} />
                </Avatar>
              </div>
            ) : (
              ""
            )}
          </div>
        ) : (
          <div className="no__details">
            <h3>No certificate uploaded</h3>
            {selectedPromotion.status === "unsubmitted" ? (
              <React.Fragment>
                <p>Click on the "add" button below to add</p>
                <Avatar className="icon__background">
                  <MdOutlineAddCircle
                    className="icon add__icon"
                    onClick={toogleClickOpenForm}
                  />
                </Avatar>
              </React.Fragment>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
      {
        <Dialog open={openForm}>
          <DialogTitle>Upload Certificate</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Fill in the neccesary field to upload a computer literacy
              certificate
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="title"
              name="title"
              label="Title"
              type="text"
              fullWidth
              variant="standard"
              onChange={(e) => handleOnChange(e, "title")}
            />
            <TextField
              autoFocus
              margin="dense"
              id="year"
              name="year"
              label="Year"
              type="text"
              fullWidth
              variant="standard"
              onChange={(e) => handleOnChange(e, "year")}
            />
            <input
              type="file"
              name="file"
              onChange={(e) => handleOnChange(e, "file")}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={toogleClickOpenForm}>Cancel</Button>
            <Button onClick={handleSubmit}>Add Certificate</Button>
          </DialogActions>
        </Dialog>
      }
    </div>
  );
}

export default UpdateComputerLiteracy;
