const express = require("express");
const { query } = require("../Database/DB");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
const fileUploadMiddleware = require("../middleware/fileUpload");
const fs = require("fs");
const path = require("path");

router.post("/login", async (req, res) => {
  const { institutionalEmail, password } = req.body;

  let staffDetails = await query(
    "SELECT * FROM staff_details WHERE institutional_email = ?",
    [institutionalEmail]
  );

  if (staffDetails.length) {
    if (staffDetails[0].password === password) {
      let sp_number = staffDetails[0].sp_number;
      jwt.sign(
        { sp_number },
        "secretKey",
        { expiresIn: "1h" },
        async (err, token) => {
          if (err) {
            res.send({
              error: true,
              errorMessage: "Something went wrong, please try again",
            });
          } else {
            res.cookie("token", token, { httpOnly: true }).send({
              error: false,
              data: staffDetails[0],
            });
          }
        }
      );
    } else {
      res.send({
        error: true,
        errorMessage: "Invalid email or password",
      });
    }
  } else {
    res.send({
      error: true,
      errorMessage: "Invalid email or password",
    });
  }
  // const token = req.cookies.token;

  // if (!token) {
  //   console.log("bad token redirect to auth");
  //   return;
  // }

  // try {
  //   const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  // } catch (er) {
  //   // console.log("err", er);
  //   //Incase of expired jwt or invalid token kill the token and clear the cookie
  //   // res.clearCookie("token");
  //   // return res.status(400).send(er.message);
  // }
});
router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    sp_no,
    phoneNumber,
    institutionalEmail,
    alternateEmail,
    department,
    faculty,
    password,
    initialRank,
  } = req.body;

  let errors = [];

  let checkIfSPNumExist = await query(
    "SELECT * FROM 	staff_details WHERE sp_number = ?",
    [sp_no]
  );
  let checkIfPhoneNumberExist = await query(
    "SELECT * FROM staff_details WHERE phone_number = ?",
    [phoneNumber]
  );
  let checkIfInstitutionalEmailExist = await query(
    "SELECT * FROM staff_details WHERE institutional_email = ?",
    [institutionalEmail]
  );
  let checkIfAlternateEmailExist = await query(
    "SELECT * FROM staff_details WHERE alternate_email = ?",
    [alternateEmail]
  );

  if (checkIfAlternateEmailExist.length) {
    errors.push("Alternate Email already exists");
  }

  if (checkIfInstitutionalEmailExist.length) {
    errors.push("Institutional Email already exists");
  }

  if (checkIfPhoneNumberExist.length) {
    errors.push("Phone number already exists");
  }

  if (checkIfSPNumExist.length) {
    errors.push("SP Number already exists");
  }

  if (errors.length) {
    res.send({
      error: true,
      errors,
    });
    return;
  }

  jwt.sign(
    { sp_number: sp_no },
    "secretKey",
    { expiresIn: "1h" },
    async (err, token) => {
      if (err) {
        res.send({
          error: true,
          errors: ["Something went wrong, please try again"],
        });
      } else {
        let insertData = await query(
          "INSERT INTO staff_details " +
            "(sp_number, department, faculty, first_name, last_name, institutional_email, alternate_email, phone_number, password, initial_rank)" +
            "VALUES (?,?,?,?,?,?,?,?,?,?)",
          [
            sp_no,
            department,
            faculty,
            firstName,
            lastName,
            institutionalEmail,
            alternateEmail,
            phoneNumber,
            password,
            initialRank,
          ]
        );

        if (insertData) {
          res.cookie("token", token, { httpOnly: true }).send({
            error: false,
            data: {
              firstName,
              lastName,
              sp_no,
              phoneNumber,
              institutionalEmail,
              alternateEmail,
              department,
              faculty,
              password,
              token,
            },
          });
        } else {
          res.send({
            error: true,
            errors: ["Something went wrong, please try again"],
          });
        }
      }
    }
  );
});

router.get("/promotional-applications", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  let promotionalApplications = await query(
    "SELECT * FROM staff_rank INNER JOIN promotion ON staff_rank.rank_id=promotion.rank_id WHERE staff_id=?",
    [sp_number]
  );

  res.send({
    error: false,
    promotionalApplications,
  });
});

router.get("/education/:promotionId", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  let previousEducationData = [];
  let checkIfStaffHasAnActiveRankInTheStaffRankTable = await query(
    "SELECT * from staff_rank join promotion on promotion.rank_id=staff_rank.rank_id where active=? and staff_id=?",
    [1, sp_number]
  );
  if (checkIfStaffHasAnActiveRankInTheStaffRankTable.length) {
    let currentPromotionId =
      checkIfStaffHasAnActiveRankInTheStaffRankTable[0].id;

    //application has been approved or something went wrong
    if (currentPromotionId !== req.params.promotionId) {
      previousEducationData = await query(
        "SELECT * FROM education where promotion_id=?",
        [currentPromotionId]
      );
      previousEducationData = previousEducationData.map((item) => {
        return {
          ...item,
          pastData: true,
        };
      });
    }
  }

  let data = await query(
    `
      SELECT promotion.* 
      FROM staff_details 
      JOIN staff_rank ON staff_details.sp_number = staff_rank.staff_id 
      JOIN promotion ON staff_rank.rank_id = promotion.rank_id 
      WHERE staff_details.sp_number = ? AND promotion.id=?`,
    [sp_number, req.params.promotionId]
  );
  let promotionId = data[0].id;
  let educationData = await query(
    "SELECT * FROM education where promotion_id=?",
    [promotionId]
  );
  res.send({
    error: false,
    data: [...educationData, ...previousEducationData],
    promotionId,
  });
});

router.post("/edit-education-details", verifyToken, async (req, res) => {
  const { degree, class_of_degree, institution, date_of_award, id } = req.body;
  let updateData = await query(
    "UPDATE education SET degree = ?, class_of_degree = ?, institution = ?, date_of_award = ? WHERE id = ?",
    [degree, class_of_degree, institution, date_of_award, id]
  );
  if (updateData.affectedRows === 1) {
    res.send({
      error: false,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "something went wrong, please try again",
    });
  }
});

router.post("/add-education-details", verifyToken, async (req, res) => {
  const { degree, class_of_degree, institution, date_of_award, promotionId } =
    req.body;
  let insertData = await query(
    "INSERT INTO education(degree, class_of_degree, institution, date_of_award, promotion_id) VALUES (?,?,?,?,?)",
    [degree, class_of_degree, institution, date_of_award, promotionId]
  );

  if (insertData) {
    res.send({
      error: false,
      insertId: insertData.insertId,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "something went wrong, please try again",
    });
  }
});

router.delete(
  "/delete-education-details/:id",
  verifyToken,
  async (req, res) => {
    let deleteOperation = await query("DELETE FROM education WHERE id = ?", [
      req.params.id,
    ]);
    if (deleteOperation.affectedRows === 1) {
      res.send({ error: false });
    } else {
      res.send({
        error: true,
        errorMessage: "something went wrong, please try again",
      });
    }
  }
);

router.get("/supervision/:promotionId", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  let previousUndergraduateData = [];
  let previousPostGraduateData = [];

  let checkIfStaffHasAnActiveRankInTheStaffRankTable = await query(
    "SELECT * from staff_rank join promotion on promotion.rank_id=staff_rank.rank_id where active=? and staff_id=?",
    [1, sp_number]
  );

  if (checkIfStaffHasAnActiveRankInTheStaffRankTable.length) {
    let currentPromotionId =
      checkIfStaffHasAnActiveRankInTheStaffRankTable[0].id;

    //application has been approved or something went wrong
    if (currentPromotionId !== req.params.promotionId) {
      previousUndergraduateData = await query(
        "SELECT * FROM undergraduate_supervision WHERE promotion_id=?",
        [currentPromotionId]
      );
      previousPostGraduateData = await query(
        "SELECT * FROM post_graduate_supervision WHERE promotion_id=?",
        [currentPromotionId]
      );
      previousUndergraduateData = previousUndergraduateData.map((item) => {
        return {
          ...item,
          pastData: true,
        };
      });
      previousPostGraduateData = previousPostGraduateData.map((item) => {
        return {
          ...item,
          pastData: true,
        };
      });
    }
  }

  let data = await query(
    `
      SELECT promotion.* 
      FROM staff_details 
      JOIN staff_rank ON staff_details.sp_number = staff_rank.staff_id 
      JOIN promotion ON staff_rank.rank_id = promotion.rank_id 
      WHERE staff_details.sp_number = ? AND promotion.id=?`,
    [sp_number, req.params.promotionId]
  );

  let promotionId = data[0].id;

  try {
    let underGraduateData = await query(
      "SELECT * FROM undergraduate_supervision WHERE promotion_id=?",
      [promotionId]
    );
    let postGraduateData = await query(
      "SELECT * FROM post_graduate_supervision WHERE promotion_id=?",
      [promotionId]
    );

    res.send({
      error: false,
      postGraduateData: [...postGraduateData, ...previousPostGraduateData],
      underGraduateData: [...underGraduateData, ...previousUndergraduateData],
      promotionId,
    });
  } catch (error) {
    res.send({
      error: true,
      serverError: "Internal server error",
    });
  }
});

router.post("/add-undergraduate-supervision", verifyToken, async (req, res) => {
  const { name, admission_number, project_title, promotionId } = req.body;

  let insertOperation = await query(
    "INSERT INTO undergraduate_supervision(name, admission_number, project_title, promotion_id) " +
      "VALUES (?,?,?,?)",
    [name, admission_number, project_title, promotionId]
  );
  if (insertOperation.affectedRows === 1) {
    res.send({
      error: false,
      insertId: insertOperation.insertId,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Internal Server error",
    });
  }
});

router.post("/add-postgraduate-supervision", verifyToken, async (req, res) => {
  const {
    admission_number,
    thesis_title,
    year,
    name,
    degree,
    status,
    institution,
    promotionId,
  } = req.body;

  let insertOperation = await query(
    "INSERT INTO post_graduate_supervision (admission_number, name, thesis_title, year, degree, status, promotion_id, institution) " +
      "VALUES(?,?,?,?,?,?,?,?)",
    [
      admission_number,
      name,
      thesis_title,
      year,
      degree,
      status,
      promotionId,
      institution,
    ]
  );

  if (insertOperation.affectedRows === 1) {
    res.send({
      error: false,
      insertId: insertOperation.insertId,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Internal Server error",
    });
  }
});

router.post(
  "/edit-undergraduate-supervision",
  verifyToken,
  async (req, res) => {
    const { name, admission_number, project_title, id } = req.body;

    let updateOperation = await query(
      "UPDATE undergraduate_supervision SET name=?, " +
        "admission_number=?, project_title =? WHERE id=?",
      [name, admission_number, project_title, id]
    );

    if (updateOperation.affectedRows === 1) {
      res.send({
        error: false,
      });
    } else {
      res.send({
        error: true,
        errorMessage: "Internal server error",
      });
    }
  }
);

router.post("/edit-postgraduate-supervision", verifyToken, async (req, res) => {
  const {
    admission_number,
    thesis_title,
    year,
    name,
    degree,
    status,
    institution,
    id,
  } = req.body;

  let updateOperation = await query(
    "UPDATE post_graduate_supervision SET admission_number=?, thesis_title=?, year=?, name=?, " +
      "degree=?, status=?, institution=? WHERE id=?",
    [
      admission_number,
      thesis_title,
      year,
      name,
      degree,
      status,
      institution,
      id,
    ]
  );

  if (updateOperation.affectedRows === 1) {
    res.send({
      error: false,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Internal server error",
    });
  }
});

router.delete(
  "/delete-postgraduate-supervision/:id",
  verifyToken,
  async (req, res) => {
    let deleteOperation = await query(
      "DELETE FROM post_graduate_supervision WHERE id=?",
      [req.params.id]
    );

    if (deleteOperation.affectedRows === 1) {
      res.send({
        error: false,
      });
    } else {
      res.send({
        error: true,
        errorMessage: "Internal Server error",
      });
    }
  }
);

router.delete(
  "/delete-undergraduate-supervision/:id",
  verifyToken,
  async (req, res) => {
    let deleteOperation = await query(
      "DELETE FROM undergraduate_supervision WHERE id=?",
      [req.params.id]
    );

    if (deleteOperation.affectedRows === 1) {
      res.send({
        error: false,
      });
    } else {
      res.send({
        error: true,
        errorMessage: "Internal Server error",
      });
    }
  }
);

router.post("/add-experience-details", verifyToken, async (req, res) => {
  let {
    designation,
    institution,
    nature_of_duty,
    start_date,
    end_date,
    promotionId,
  } = req.body;

  let insertData = await query(
    "INSERT INTO teaching_experience(designation, institution, nature_of_duty, start_date, end_date, promotion_id) VALUES(?,?,?,?,?,?)",
    [
      designation,
      institution,
      nature_of_duty,
      start_date,
      end_date,
      promotionId,
    ]
  );

  if (insertData) {
    res.send({
      error: false,
      insertId: insertData.insertId,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "something went wrong, please try again",
    });
  }
});

router.get("/experience/:promotionId", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  let previousExperienceData = [];
  let checkIfStaffHasAnActiveRankInTheStaffRankTable = await query(
    "SELECT * from staff_rank join promotion on promotion.rank_id=staff_rank.rank_id where active=? and staff_id=?",
    [1, sp_number]
  );
  if (checkIfStaffHasAnActiveRankInTheStaffRankTable.length) {
    let currentPromotionId =
      checkIfStaffHasAnActiveRankInTheStaffRankTable[0].id;

    //application has been approved or something went wrong
    if (currentPromotionId !== req.params.promotionId) {
      previousExperienceData = await query(
        "SELECT * FROM teaching_experience WHERE promotion_id=?",
        [currentPromotionId]
      );
      previousExperienceData = previousExperienceData.map((item) => {
        return {
          ...item,
          pastData: true,
        };
      });
    }
  }

  let data = await query(
    `
      SELECT promotion.* 
      FROM staff_details 
      JOIN staff_rank ON staff_details.sp_number = staff_rank.staff_id 
      JOIN promotion ON staff_rank.rank_id = promotion.rank_id 
      WHERE staff_details.sp_number = ? AND promotion.id=?`,
    [sp_number, req.params.promotionId]
  );
  let promotionId = data[0].id;

  let experienceData = await query(
    "SELECT * FROM teaching_experience WHERE promotion_id=?",
    [promotionId]
  );

  res.send({
    error: false,
    data: [...previousExperienceData, ...experienceData],
    promotionId,
  });
});

router.delete(
  "/delete-experience-details/:id",
  verifyToken,
  async (req, res) => {
    let deleteOperation = await query(
      "DELETE FROM teaching_experience WHERE id = ?",
      [req.params.id]
    );
    if (deleteOperation.affectedRows === 1) {
      res.send({ error: false });
    } else {
      res.send({
        error: true,
        errorMessage: "something went wrong, iplease try again",
      });
    }
  }
);

router.post("/edit-experience-details", verifyToken, async (req, res) => {
  let { designation, institution, nature_of_duty, start_date, end_date, id } =
    req.body;
  let updateData = await query(
    "UPDATE teaching_experience SET designation = ?, institution = ?, nature_of_duty = ?, start_date = ?, end_date = ? WHERE id = ?",
    [designation, institution, nature_of_duty, start_date, end_date, id]
  );
  if (updateData.affectedRows === 1) {
    res.send({
      error: false,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "something went wrong, please try again",
    });
  }
});

router.get("/courses-taught/:promotionId", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  let previousCoursesTaughtData = [];
  let checkIfStaffHasAnActiveRankInTheStaffRankTable = await query(
    "SELECT * from staff_rank join promotion on promotion.rank_id=staff_rank.rank_id where active=? and staff_id=?",
    [1, sp_number]
  );
  if (checkIfStaffHasAnActiveRankInTheStaffRankTable.length) {
    let currentPromotionId =
      checkIfStaffHasAnActiveRankInTheStaffRankTable[0].id;

    //application has been approved or something went wrong
    if (currentPromotionId !== req.params.promotionId) {
      previousCoursesTaughtData = await query(
        "SELECT * FROM courses_taught WHERE promotion_id=?",
        [currentPromotionId]
      );
      previousCoursesTaughtData = previousCoursesTaughtData.map((item) => {
        return {
          ...item,
          pastData: true,
        };
      });
    }
  }

  let data = await query(
    `
      SELECT promotion.* 
      FROM staff_details 
      JOIN staff_rank ON staff_details.sp_number = staff_rank.staff_id 
      JOIN promotion ON staff_rank.rank_id = promotion.rank_id 
      WHERE staff_details.sp_number = ? AND promotion.id=?`,
    [sp_number, req.params.promotionId]
  );
  let promotionId = data[0].id;

  let coursesTaughtData = await query(
    "SELECT * FROM courses_taught WHERE promotion_id=?",
    [promotionId]
  );

  res.send({
    error: false,
    data: [...previousCoursesTaughtData, ...coursesTaughtData],
    promotionId,
  });
});

router.post("/add-courses-taught-details", verifyToken, async (req, res) => {
  const {
    course_code,
    course_title,
    unit,
    contribution,
    teaching_load,
    semester,
    promotionId,
  } = req.body;

  let insertOperation = await query(
    "INSERT INTO courses_taught(course_code, course_title, unit, contribution, teaching_load, semester, promotion_id) " +
      "VALUES(?,?,?,?,?,?,?)",
    [
      course_code,
      course_title,
      unit,
      contribution,
      teaching_load,
      semester,
      promotionId,
    ]
  );

  if (insertOperation.affectedRows === 1) {
    res.send({
      error: false,
      insertId: insertOperation.insertId,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Internal server error",
    });
  }
});

router.post("/edit-courses-taught", verifyToken, async (req, res) => {
  const {
    course_code,
    course_title,
    unit,
    contribution,
    teaching_load,
    semester,
    id,
  } = req.body;

  let editOperation = await query(
    "UPDATE courses_taught SET course_code=?, course_title=?, unit=?, contribution=?, teaching_load=?, semester=? " +
      "WHERE id=?",
    [course_code, course_title, unit, contribution, teaching_load, semester, id]
  );

  if (editOperation.affectedRows === 1) {
    res.send({
      error: false,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Server error",
    });
  }
});

router.delete("/delete-courses-taught/:id", verifyToken, async (req, res) => {
  let deleteOperation = await query("DELETE FROM courses_taught WHERE id=?", [
    req.params.id,
  ]);

  if (deleteOperation.affectedRows === 1) {
    res.send({
      error: false,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Server error",
    });
  }
});

router.get("/applied-promotion-status", verifyToken, async (req, res) => {
  try {
    const sp_number = req.decoded.sp_number;

    let data = await query(
      `
      SELECT promotion.* 
      FROM staff_details 
      JOIN staff_rank ON staff_details.sp_number = staff_rank.staff_id 
      JOIN promotion ON staff_rank.rank_id = promotion.rank_id 
      WHERE staff_details.sp_number = ?`,
      [sp_number]
    );

    res.send({ data });
  } catch (error) {
    res.send({
      error: true,
      serverError: "Internal Server Error, please try again",
    });
  }
});

router.get("/staff-details", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  const data = await query("SELECT * FROM staff_details WHERE sp_number=?", [
    sp_number,
  ]);

  res.send({
    error: false,
    data: data[0],
  });
});

router.get("/staff-data/:promotionId", verifyToken, async (req, res) => {
  try {
    const sp_number = req.decoded.sp_number;

    const data = await query("SELECT * FROM staff_details WHERE sp_number=?", [
      sp_number,
    ]);

    let promotionData = await query(
      "SELECT rank_id FROM promotion WHERE id=?",
      [req.params.promotionId]
    );

    let rankName = await query(
      "SELECT rank_name FROM staff_rank WHERE rank_id=?",
      [promotionData[0].rank_id]
    );

    res.send({
      data: { ...data[0], rank_being_applied_for: rankName[0].rank_name },
    });
  } catch (error) {
    res.send({
      error: true,
      serverError: "Internal Server Error, please try again",
    });
  }
});

router.post("/submit-application", verifyToken, async (req, res) => {
  const { promotionId } = req.body;

  const applicationData = await query("SELECT * FROM PROMOTION WHERE id=?", [
    promotionId,
  ]);

  const updatePromotion = await query(
    "UPDATE promotion SET status=? WHERE id=?",
    ["submitted", promotionId]
  );

  if (updatePromotion.affectedRows === 1) {
    const updateStaffRank = await query(
      "UPDATE staff_rank SET rank_application_status=? WHERE rank_id=?",
      ["submitted", applicationData[0].rank_id]
    );

    if (updateStaffRank.affectedRows === 1) {
      res.send({
        error: false,
      });
    } else {
      res.send({
        error: true,
        errorMessag: "Server error",
      });
    }
  } else {
    res.send({
      error: true,
      errorMessage: "Server Error",
    });
  }

  // const insertOperation = await query(
  //   "UPDATE promotion SET "
  // )
});
router.post("/new-promotion-application", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;
  const { rank_name } = req.body;

  const insertOperation = await query(
    "INSERT INTO staff_rank(staff_id, rank_name, active, rank_application_status) " +
      "VALUES(?,?,?,?)",
    [sp_number, rank_name, 0, "ongoing"]
  );

  if (insertOperation.insertId) {
    let rankId = insertOperation.insertId;

    const currentDate = new Date();
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = currentDate.toLocaleDateString(undefined, options);

    const insertIntoPromotionTable = await query(
      "INSERT INTO promotion(rank_id, application_date, status) " +
        "VALUES(?,?,?)",
      [rankId, formattedDate, "unsubmitted"]
    );

    if (insertIntoPromotionTable.insertId) {
      let promotionalApplications = await query(
        "SELECT * FROM staff_rank INNER JOIN promotion ON staff_rank.rank_id=promotion.rank_id WHERE staff_id=?",
        [sp_number]
      );

      res.send({
        error: false,
        promotionalApplications,
      });
    } else {
      res.send({
        error: true,
        errorMessage: "Server Error",
      });
    }
  } else {
    res.send({
      error: true,
      errorMessage: "Server error",
    });
  }
});
router.post("/update-staff-data", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  const {
    alternate_email,
    linkedin_id,
    area_of_specialization,
    date_of_assumption_of_duty,
    date_of_resumption_of_duty_after_study_leave,
    rank_being_applied_for,
    promotionId,
  } = req.body;

  let updateOperation = await query(
    "UPDATE staff_details SET alternate_email=?, linkedin_id=?, area_of_specialization=?, " +
      "date_of_resumption_of_duty_after_study_leave=?, date_of_assumption_of_duty =?, rank_being_applied_for=? " +
      "WHERE sp_number=?",
    [
      alternate_email,
      linkedin_id,
      area_of_specialization,
      date_of_resumption_of_duty_after_study_leave,
      date_of_assumption_of_duty,
      rank_being_applied_for,
      sp_number,
    ]
  );

  if (updateOperation.affectedRows === 1) {
    let promotionData = await query(
      "SELECT rank_id FROM promotion WHERE id=?",
      [promotionId]
    );

    let updateRankName = await query(
      "UPDATE staff_rank SET rank_name=? WHERE rank_id=?",
      [rank_being_applied_for, promotionData[0].rank_id]
    );

    if (updateRankName.affectedRows === 1) {
      res.send({
        error: false,
      });
    }
    // if (rank_being_applied_for && rank_being_applied_for !== "") {
    //   let checkRankApplication = await query(
    //     "SELECT * FROM staff_rank WHERE staff_id=? AND rank_application_status=?",
    //     [sp_number, "ongoing"]
    //   );

    //   if (!checkRankApplication.length) {
    //     let insertOperation = await query(
    //       "INSERT INTO staff_rank(staff_id, rank_name, active, rank_application_status) " +
    //         "VALUES(?,?,?,?)",
    //       [sp_number, rank_being_applied_for, 0, "ongoing"]
    //     );

    //     if (insertOperation.insertId) {
    //       //check if user has uncompletted application
    //       let rankId = insertOperation.insertId;

    //       insertOperation = await query(
    //         "INSERT INTO promotion(rank_id, application_date, status) " +
    //           "VALUES(?,?,?)",
    //         [rankId, "2022", "unsubmitted"]
    //       );
    //       if (insertOperation.insertId) {
    //         res.send({
    //           error: false,
    //         });
    //       }
    //     }
    //   } else {
    //     let staffRankUpdate = await query(
    //       "UPDATE staff_rank SET rank_name=? WHERE staff_id=?",
    //       [rank_being_applied_for, sp_number]
    //     );

    //     if (staffRankUpdate.affectedRows === 1) {
    //     }
    //   }
    // }
    // res.send({
    //   error: false,
    // });
  } else {
    res.send({
      error: true,
      serverError: "Internal server error",
    });
  }
});

router.post(
  "/upload-profile-picture",
  verifyToken,
  fileUploadMiddleware,
  async (req, res) => {
    const sp_number = req.decoded.sp_number;

    if (!req.file) {
      res.send({
        error: true,
        errorMessage: "No file uploaded",
      });
    } else {
      const fileName = req.file.filename;
      const filePath = req.file.path;

      const updateOperation = await query(
        "UPDATE staff_details SET image_filename=?, image_path=? WHERE sp_number=?",
        [fileName, filePath, sp_number]
      );

      if (updateOperation.affectedRows === 1) {
        res.send({
          error: false,
          image_filename: fileName,
          image_path: filePath,
        });
      } else {
        res.send({
          error: true,
          errorMessage: "Server Error",
        });
      }
    }
  }
);

router.get("/publications/:promotionId", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  let previousPublicationData = [];
  let checkIfStaffHasAnActiveRankInTheStaffRankTable = await query(
    "SELECT * from staff_rank join promotion on promotion.rank_id=staff_rank.rank_id where active=? and staff_id=?",
    [1, sp_number]
  );
  if (checkIfStaffHasAnActiveRankInTheStaffRankTable.length) {
    let currentPromotionId =
      checkIfStaffHasAnActiveRankInTheStaffRankTable[0].id;

    //application has been approved or something went wrong
    if (currentPromotionId !== req.params.promotionId) {
      previousPublicationData = await query(
        "SELECT * FROM publications WHERE promotion_id=?",
        [currentPromotionId]
      );
      previousPublicationData = previousPublicationData.map((item) => {
        return {
          ...item,
          pastData: true,
        };
      });
    }
  }

  let data = await query(
    `
      SELECT promotion.* 
      FROM staff_details 
      JOIN staff_rank ON staff_details.sp_number = staff_rank.staff_id 
      JOIN promotion ON staff_rank.rank_id = promotion.rank_id 
      WHERE staff_details.sp_number = ? AND promotion.id=?`,
    [sp_number, req.params.promotionId]
  );
  let promotionId = data[0].id;

  let publications = await query(
    "SELECT * FROM publications WHERE promotion_id=?",
    [promotionId]
  );

  res.send({
    error: false,
    publications: [...previousPublicationData, ...publications],
    promotionId,
  });
});

router.post("/add-publication", verifyToken, async (req, res) => {
  const {
    issn,
    number_of_authors,
    doi,
    title,
    year,
    type_of_publication,
    publisher,
    position,
    promotionId,
  } = req.body;

  let insertOperation = await query(
    "INSERT INTO publications(title, issn, doi, publisher, type_of_publication, number_of_authors, position, year, promotion_id) " +
      "VALUES(?,?,?,?,?,?,?,?,?)",
    [
      title,
      issn,
      doi,
      publisher,
      type_of_publication,
      number_of_authors,
      position,
      year,
      promotionId,
    ]
  );

  if (insertOperation.affectedRows === 1) {
    res.send({
      error: false,
      insertId: insertOperation.insertId,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Internal server error",
    });
  }
});

router.post("/edit-publication", verifyToken, async (req, res) => {
  const {
    issn,
    number_of_authors,
    doi,
    title,
    year,
    type_of_publication,
    publisher,
    position,
    id,
  } = req.body;

  let editOperation = await query(
    "UPDATE publications SET title=?, issn=?, doi=?, 	publisher=?, type_of_publication=?, number_of_authors=?, position=?, 	year=? " +
      "WHERE id=?",
    [
      title,
      issn,
      doi,
      publisher,
      type_of_publication,
      number_of_authors,
      position,
      year,
      id,
    ]
  );

  if (editOperation.affectedRows === 1) {
    res.send({
      error: false,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Server error",
    });
  }
});
router.delete("/delete-publication/:id", verifyToken, async (req, res) => {
  let deleteOperation = await query("DELETE FROM publications WHERE id=?", [
    req.params.id,
  ]);

  if (deleteOperation.affectedRows === 1) {
    res.send({
      error: false,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Server error",
    });
  }
});

router.get("/publications", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  let data = await query(
    `
      SELECT promotion.* 
      FROM staff_details 
      JOIN staff_rank ON staff_details.sp_number = staff_rank.staff_id 
      JOIN promotion ON staff_rank.rank_id = promotion.rank_id 
      WHERE staff_details.sp_number = ? AND promotion.status=?`,
    [sp_number, "unsubmitted"]
  );
  let promotionId = data[0].id;

  let publications = await query(
    "SELECT * FROM publications WHERE promotion_id=?",
    [promotionId]
  );

  res.send({
    error: false,
    publications,
  });
});

router.get("/community-service/:promotionId", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  let previousCommunityServiceData = [];
  let checkIfStaffHasAnActiveRankInTheStaffRankTable = await query(
    "SELECT * from staff_rank join promotion on promotion.rank_id=staff_rank.rank_id where active=? and staff_id=?",
    [1, sp_number]
  );
  if (checkIfStaffHasAnActiveRankInTheStaffRankTable.length) {
    let currentPromotionId =
      checkIfStaffHasAnActiveRankInTheStaffRankTable[0].id;

    //application has been approved or something went wrong
    if (currentPromotionId !== req.params.promotionId) {
      previousCommunityServiceData = await query(
        "SELECT * FROM community_service where promotion_id=?",
        [currentPromotionId]
      );
      previousCommunityServiceData = previousCommunityServiceData.map(
        (item) => {
          return {
            ...item,
            pastData: true,
          };
        }
      );
    }
  }

  let data = await query(
    `
      SELECT promotion.* 
      FROM staff_details 
      JOIN staff_rank ON staff_details.sp_number = staff_rank.staff_id 
      JOIN promotion ON staff_rank.rank_id = promotion.rank_id 
      WHERE staff_details.sp_number = ? AND promotion.id=?`,
    [sp_number, req.params.promotionId]
  );
  let promotionId = data[0].id;

  let communityServices = await query(
    "SELECT * FROM community_service where promotion_id=?",
    [promotionId]
  );

  res.send({
    error: false,
    communityServices: [...communityServices, ...previousCommunityServiceData],
    promotionId,
  });
});

router.post("/add-community-service", verifyToken, async (req, res) => {
  const { position, start_date, end_date, organization, promotionId } =
    req.body;

  let insertOperation = await query(
    "INSERT INTO community_service(position, start_date, end_date, organization, promotion_id) " +
      "VALUES(?,?,?,?,?)",
    [position, start_date, end_date, organization, promotionId]
  );

  if (insertOperation.affectedRows === 1) {
    res.send({
      error: false,
      insertId: insertOperation.insertId,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Internal server error",
    });
  }
});

router.post("/edit-community-service", verifyToken, async (req, res) => {
  const { position, start_date, end_date, organization, id } = req.body;

  let editOperation = await query(
    "UPDATE community_service SET position=?, start_date=?, end_date=?, organization=? " +
      "WHERE id=?",
    [position, start_date, end_date, organization, id]
  );

  if (editOperation.affectedRows === 1) {
    res.send({
      error: false,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Server error",
    });
  }
});

router.delete(
  "/delete-community-service/:id",
  verifyToken,
  async (req, res) => {
    let deleteOperation = await query(
      "DELETE FROM community_service WHERE id=?",
      [req.params.id]
    );

    if (deleteOperation.affectedRows === 1) {
      res.send({
        error: false,
      });
    } else {
      res.send({
        error: true,
        errorMessage: "Server error",
      });
    }
  }
);

router.get("/research-papers/:promotionId", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  let previousResearchPaperData = [];
  let checkIfStaffHasAnActiveRankInTheStaffRankTable = await query(
    "SELECT * from staff_rank join promotion on promotion.rank_id=staff_rank.rank_id where active=? and staff_id=?",
    [1, sp_number]
  );
  if (checkIfStaffHasAnActiveRankInTheStaffRankTable.length) {
    let currentPromotionId =
      checkIfStaffHasAnActiveRankInTheStaffRankTable[0].id;

    //application has been approved or something went wrong
    if (currentPromotionId !== req.params.promotionId) {
      previousResearchPaperData = await query(
        "SELECT * FROM research_papers WHERE promotion_id=?",
        [currentPromotionId]
      );
      previousResearchPaperData = previousResearchPaperData.map((item) => {
        return {
          ...item,
          pastData: true,
        };
      });
    }
  }

  let data = await query(
    `
      SELECT promotion.* 
      FROM staff_details 
      JOIN staff_rank ON staff_details.sp_number = staff_rank.staff_id 
      JOIN promotion ON staff_rank.rank_id = promotion.rank_id 
      WHERE staff_details.sp_number = ? AND promotion.id=?`,
    [sp_number, req.params.promotionId]
  );
  let promotionId = data[0].id;

  let researchPapers = await query(
    "SELECT * FROM research_papers WHERE promotion_id=?",
    [promotionId]
  );

  res.send({
    error: false,
    researchPapers: [...previousResearchPaperData, ...researchPapers],
    promotionId,
  });
});

router.post(
  "/add-research-papers",
  verifyToken,
  fileUploadMiddleware,
  async (req, res) => {
    if (!req.file) {
      res.send("no file uploaded");
    }

    const { title, presented_at, year, authors, promotionId } = req.body;
    const { originalname, filename } = req.file;
    const filePath = req.file.path;

    let insertOperation = await query(
      "INSERT INTO research_papers(promotion_id, title, authors, presented_at, research_paper_file_path, research_paper_filename, original_name, year) " +
        "VALUES(?,?,?,?,?,?,?,?)",
      [
        promotionId,
        title,
        authors,
        presented_at,
        filePath,
        filename,
        originalname,
        year,
      ]
    );

    if (insertOperation.affectedRows === 1) {
      res.send({
        error: false,
        insertId: insertOperation.insertId,
      });
    } else {
      res.send({
        error: true,
        errorMessage: "Internal server error",
      });
    }
  }
);

router.post("/edit-research-paper", verifyToken, async (req, res) => {
  const { title, authors, presented_at, year, id } = req.body;

  let editOperation = await query(
    "UPDATE research_papers SET title=?, authors=?, presented_at=?, year=? " +
      "WHERE id=?",
    [title, authors, presented_at, year, id]
  );

  if (editOperation.affectedRows === 1) {
    res.send({
      error: false,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Internal Server Error",
    });
  }
});
router.delete("/delete-research-paper/:id", verifyToken, async (req, res) => {
  let deleteOperation = await query("DELETE FROM research_papers WHERE id=?", [
    req.params.id,
  ]);

  if (deleteOperation.affectedRows === 1) {
    res.send({
      error: false,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Internal Server Error",
    });
  }
});

router.get("/computer-literacy/:promotionId", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  let previousComputerLiteracyData = [];
  let checkIfStaffHasAnActiveRankInTheStaffRankTable = await query(
    "SELECT * from staff_rank join promotion on promotion.rank_id=staff_rank.rank_id where active=? and staff_id=?",
    [1, sp_number]
  );
  if (checkIfStaffHasAnActiveRankInTheStaffRankTable.length) {
    let currentPromotionId =
      checkIfStaffHasAnActiveRankInTheStaffRankTable[0].id;

    //application has been approved or something went wrong
    if (currentPromotionId !== req.params.promotionId) {
      previousComputerLiteracyData = await query(
        "SELECT * FROM computer_literacy WHERE promotion_id=?",
        [currentPromotionId]
      );
      previousComputerLiteracyData = previousComputerLiteracyData.map(
        (item) => {
          return {
            ...item,
            pastData: true,
          };
        }
      );
    }
  }

  let data = await query(
    `
      SELECT promotion.* 
      FROM staff_details 
      JOIN staff_rank ON staff_details.sp_number = staff_rank.staff_id 
      JOIN promotion ON staff_rank.rank_id = promotion.rank_id 
      WHERE staff_details.sp_number = ? AND promotion.id=?`,
    [sp_number, req.params.promotionId]
  );
  let promotionId = data[0].id;

  let computerLiteracyCertificates = await query(
    "SELECT * FROM computer_literacy WHERE promotion_id=?",
    [promotionId]
  );

  res.send({
    error: false,
    computerLiteracyCertificates: [
      ...previousComputerLiteracyData,
      ...computerLiteracyCertificates,
    ],
    promotionId,
  });
});

router.post(
  "/add-computer-literacy",
  verifyToken,
  fileUploadMiddleware,
  async (req, res) => {
    if (!req.file) {
      res.send("no file uploaded");
    } else {
      const { title, year, promotionId } = req.body;
      const filename = req.file.filename;
      const filePath = req.file.path;

      let insertOperation = await query(
        "INSERT INTO computer_literacy(promotion_id, certificate_title, year, certificate_file_path, certificate_file_name) " +
          "VALUES(?,?,?,?,?)",
        [promotionId, title, year, filePath, filename]
      );

      if (insertOperation.affectedRows === 1) {
        res.send({
          error: false,
          insertId: insertOperation.insertId,
          certificate_title: title,
          year,
          certificate_file_name: filename,
        });
      } else {
        res.send({
          error: true,
          errorMessage: "Internal Server Error",
        });
      }
    }
  }
);

router.delete(
  "/delete-computer-literacy/:id/:certificate_file_name",
  verifyToken,
  async (req, res) => {
    let deleteOperation = await query(
      "DELETE FROM computer_literacy WHERE id=?",
      [req.params.id]
    );

    if (deleteOperation.affectedRows === 1) {
      const filepath = path.join(
        "files/images",
        req.params.certificate_file_name
      );
      fs.unlink(filepath, (err) => {
        if (err) {
          console.log(err);
          res.send("not deeted");
        } else {
          res.send("deleted");
        }
      });
    } else {
      res.send({
        error: true,
        errorMessage: "Internal server error",
      });
    }
  }
);

router.get(
  "/conferences-attended/:promotionId",
  verifyToken,
  async (req, res) => {
    const sp_number = req.decoded.sp_number;

    let previousConferencesData = [];
    let checkIfStaffHasAnActiveRankInTheStaffRankTable = await query(
      "SELECT * from staff_rank join promotion on promotion.rank_id=staff_rank.rank_id where active=? and staff_id=?",
      [1, sp_number]
    );
    if (checkIfStaffHasAnActiveRankInTheStaffRankTable.length) {
      let currentPromotionId =
        checkIfStaffHasAnActiveRankInTheStaffRankTable[0].id;

      //application has been approved or something went wrong
      if (currentPromotionId !== req.params.promotionId) {
        previousConferencesData = await query(
          "SELECT * FROM conferences_attended WHERE promotion_id=?",
          [currentPromotionId]
        );
        previousConferencesData = previousConferencesData.map((item) => {
          return {
            ...item,
            pastData: true,
          };
        });
      }
    }

    let data = await query(
      `
      SELECT promotion.* 
      FROM staff_details 
      JOIN staff_rank ON staff_details.sp_number = staff_rank.staff_id 
      JOIN promotion ON staff_rank.rank_id = promotion.rank_id 
      WHERE staff_details.sp_number = ? AND promotion.id=?`,
      [sp_number, req.params.promotionId]
    );
    let promotionId = data[0].id;

    let conferencesAttended = await query(
      "SELECT * FROM conferences_attended WHERE promotion_id=?",
      [promotionId]
    );

    res.send({
      error: false,
      conferencesAttended: [...previousConferencesData, ...conferencesAttended],
      promotionId,
    });
  }
);

router.post(
  "/add-conferences-attended-no-file",
  verifyToken,
  async (req, res) => {
    const { title, organizer, presented_a_paper, promotionId } = req.body;

    let insertOperation = await query(
      "INSERT INTO conferences_attended(title, organizer, presented_a_paper, promotion_id) " +
        "VALUES(?,?,?,?)",
      [title, organizer, presented_a_paper, promotionId]
    );

    if (insertOperation.affectedRows === 1) {
      res.send({
        error: false,
        insertId: insertOperation.insertId,
      });
    } else {
      res.send({
        error: true,
        errorMessage: "Internal Server Error",
      });
    }
  }
);

router.post(
  "/add-conferences-attended-file",
  verifyToken,
  fileUploadMiddleware,
  async (req, res) => {
    if (!req.file) {
      res.send({
        error: true,
        errorMessage: "No file uploaded",
      });
      return;
    }

    const { title, organizer, presented_a_paper, promotionId } = req.body;
    const filename = req.file.filename;
    const filePath = req.file.path;

    let insertOperation = await query(
      "INSERT INTO conferences_attended(title, organizer, presented_a_paper, promotion_id, paper_file_path, paper_file_name) " +
        "VALUES(?,?,?,?,?,?)",
      [title, organizer, presented_a_paper, promotionId, filePath, filename]
    );

    if (insertOperation.affectedRows === 1) {
      res.send({
        error: false,
        insertId: insertOperation.insertId,
      });
    } else {
      res.send({
        error: true,
        errorMessage: "Internal Server Error",
      });
    }
  }
);

//NOTE: remove file too
router.post("/edit-conferences-attended", verifyToken, async (req, res) => {
  const { title, organizer, presented_a_paper, promotionId } = req.body;

  let updateOperation = await query(
    "UPDATE conferences_attended SET title=?, organizer=?, presented_a_paper=?, promotion_id=?",
    [title, organizer, presented_a_paper, promotionId]
  );

  if (updateOperation.affectedRows === 1) {
    res.send({
      error: false,
    });
  } else {
    res.send({
      error: true,
      errorMessage: "Internal server error",
    });
  }
});

router.delete(
  "/delete-conferences-attended/:id",
  verifyToken,
  async (req, res) => {
    let deleteOperation = await query(
      "DELETE FROM conferences_attended WHERE id=?",
      [req.params.id]
    );

    if (deleteOperation.affectedRows === 1) {
      res.send({
        error: false,
      });
    } else {
      res.send({
        error: true,
        errorMessage: "Internal Server Error",
      });
    }
  }
);

//TODO: handle last rank, index + 1 can cause error
router.get("/get-staff-next-rank", verifyToken, async (req, res) => {
  const sp_number = req.decoded.sp_number;

  let ranks = await query("select * from ranks");
  let newRank = "";
  let checkIfStaffHasAnActiveRankInTheStaffRankTable = await query(
    "SELECT rank_name from staff_rank where active=? and staff_id=?",
    [1, sp_number]
  );

  if (checkIfStaffHasAnActiveRankInTheStaffRankTable.length) {
    ranks.map((rank, index) => {
      if (
        rank.rank_name ===
        checkIfStaffHasAnActiveRankInTheStaffRankTable[0].rank_name
      ) {
        newRank = ranks[index + 1];
      }
      return rank;
    });
  } else {
    let initialRank = await query(
      "select initial_rank from staff_details where sp_number=?",
      [sp_number]
    );
    ranks.map((rank, index) => {
      if (rank.rank_name === initialRank[0].initial_rank) {
        newRank = ranks[index + 1];
      }
      return rank;
    });
  }

  res.send({
    error: false,
    newRank,
  });
});

// router.get("/promotional-applications");
// router.post("/update-basic-profile", (req, res) => {
//   const {
//     sp_number,
//     dateOfAssumptionOfDuty,
//     areaOfSpecialization,
//     rankBeingAppliedFor,
//   } = req.body;

//   let staff = query("SELECT * FROM staff_details WHERE sp_number = ?", [
//     sp_number,
//   ]);

//   if (staff) {
//     res.send({ error: true, errorMessage: "staff does not exist" });
//   } else {
//     // let insertData = await query("INSERT INTO staff_details()")
//   }
// });
module.exports = router;
