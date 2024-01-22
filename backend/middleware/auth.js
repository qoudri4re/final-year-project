const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.send({
      error: true,
      tokenError: "No token",
    });
  }

  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) {
      return res.send({
        error: true,
        tokenError: "Invalid token",
      });
    }
    req.decoded = decoded;
    next();
  });
};

const isAdmin = (req, res, next) => {
  const role = req.cookies.role;
  if (!role) {
    return res.send({
      error: true,
      roleError: "no role defined",
    });
  } else {
    if (role === "admin") {
      return;
    } else {
      return res.send({
        error: true,
        roleError: "Unauthorized",
      });
    }
  }
};

const isStaff = (req, res, next) => {
  const role = req.cookies.role;
  if (!role) {
    return res.send({
      error: true,
      roleError: "no role defined",
    });
  } else {
    if (role === "staff") {
      return;
    } else {
      return res.send({
        error: true,
        roleError: "Unauthorized",
      });
    }
  }
};

module.exports = verifyToken;
