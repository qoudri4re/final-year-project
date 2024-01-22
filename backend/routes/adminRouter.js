const express = require("express");
const { query } = require("../Database/DB");
const router = express.Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");

router.post("/hod/login", async (req, res) => {
  const { email, password } = req.body;

  let adminDetails = await query("SELECT * FROM hod_details WHERE email=?", [
    email,
  ]);

  if (adminDetails.length) {
    if (adminDetails[0].password === password) {
      let admin_id = adminDetails[0].id;

      jwt.sign(
        { admin_id },
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
              data: adminDetails[0],
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
});

router.get("/all-promotional-applications", verifyToken, async (req, res) => {
  const promotionalApplications = await query(
    "SELECT * FROM staff_rank INNER JOIN promotion ON staff_rank.rank_id = promotion.rank_id " +
      "INNER JOIN staff_details ON staff_rank.staff_id = staff_details.sp_number WHERE promotion.status <> 'unsubmitted'"
  );

  res.send({
    error: false,
    promotionalApplications,
  });
});

router.get(
  "/promotional-data/:sp_number/:promotionId",
  verifyToken,
  async (req, res) => {
    const staffData = await query(
      "SELECT sp_number, first_name, last_name, department, faculty FROM staff_details WHERE sp_number=?",
      [req.params.sp_number]
    );

    const administrativeAndOrganizationalExperience = await query(
      "SELECT * FROM administrative_and_organizational_experience WHERE promotion_id=?",
      [req.params.promotionId]
    );

    const communityService = await query(
      "SELECT * FROM community_service WHERE promotion_id=?",
      [req.params.promotionId]
    );

    const computer_literacy = await query(
      "SELECT * FROM computer_literacy WHERE promotion_id=?",
      [req.params.promotionId]
    );

    const conferences_attended = await query(
      "SELECT * FROM conferences_attended WHERE promotion_id=?",
      [req.params.promotionId]
    );

    const courses_taught = await query(
      "SELECT * FROM courses_taught WHERE promotion_id=?",
      [req.params.promotionId]
    );

    const education = await query(
      "SELECT * FROM education WHERE promotion_id=?",
      [req.params.promotionId]
    );

    const hod_assessment = await query(
      "SELECT * FROM hod_assessment WHERE promotion_id=?",
      [req.params.promotionId]
    );

    const post_graduate_supervision = await query(
      "SELECT * FROM post_graduate_supervision WHERE promotion_id=?",
      [req.params.promotionId]
    );

    // const promotion = await query(
    //   "SELECT * FROM promotion WHERE promotion_id=?",
    //   [req.params.promotionId]
    // );

    const publications = await query(
      "SELECT * FROM publications WHERE promotion_id=?",
      [req.params.promotionId]
    );

    const research_papers = await query(
      "SELECT * FROM research_papers WHERE promotion_id=?",
      [req.params.promotionId]
    );

    const teaching_experience = await query(
      "SELECT * FROM teaching_experience WHERE promotion_id=?",
      [req.params.promotionId]
    );

    const undergraduate_supervision = await query(
      "SELECT * FROM undergraduate_supervision WHERE promotion_id=?",
      [req.params.promotionId]
    );

    const promotionData = await query("SELECT * FROM promotion WHERE id=?", [
      req.params.promotionId,
    ]);

    res.send({
      error: false,
      staffData: staffData[0],
      administrativeAndOrganizationalExperience,
      communityService,
      computer_literacy,
      publications,
      research_papers,
      undergraduate_supervision,
      post_graduate_supervision,
      teaching_experience,
      courses_taught,
      education,
      hod_assessment,
      conferences_attended,
      promotionData: promotionData[0],
    });
  }
);

router.post("/hod/add-assessment", verifyToken, async (req, res) => {
  let adminId = req.decoded.admin_id;

  const {
    attendance_punctuality,
    conduct_of_tutorial,
    coverage_of_syllabus,
    effective_communication,
    eval_of_lecturer,
    maintenance,
    promptness_marking,
    student_performance,
    promotionId,
  } = req.body;

  const insertOperation1 = await query(
    "INSERT INTO hod_assessment(item, promotion_id, score, hod_id) " +
      "VALUES(?,?,?,?)",
    ["Coverage of syllabus", promotionId, coverage_of_syllabus, adminId]
  );

  const insertOperation2 = await query(
    "INSERT INTO hod_assessment(item, promotion_id, score, hod_id) " +
      "VALUES(?,?,?,?)",
    ["Effective communication", promotionId, effective_communication, adminId]
  );

  const insertOperation3 = await query(
    "INSERT INTO hod_assessment(item, promotion_id, score, hod_id) " +
      "VALUES(?,?,?,?)",
    ["Conduct of tutorials", promotionId, conduct_of_tutorial, adminId]
  );

  const insertOperation4 = await query(
    "INSERT INTO hod_assessment(item, promotion_id, score, hod_id) " +
      "VALUES(?,?,?,?)",
    ["Attendance and punctuality", promotionId, attendance_punctuality, adminId]
  );

  const insertOperation5 = await query(
    "INSERT INTO hod_assessment(item, promotion_id, score, hod_id) " +
      "VALUES(?,?,?,?)",
    [
      "Promptness in marking assignment and examination scripts",
      promotionId,
      promptness_marking,
      adminId,
    ]
  );

  const insertOperation6 = await query(
    "INSERT INTO hod_assessment(item, promotion_id, score, hod_id) " +
      "VALUES(?,?,?,?)",
    [
      "Students' performance in examination",
      promotionId,
      student_performance,
      adminId,
    ]
  );

  const insertOperation7 = await query(
    "INSERT INTO hod_assessment(item, promotion_id, score, hod_id) " +
      "VALUES(?,?,?,?)",
    [
      "External Examiners/Assessor's evaluation of lecturer",
      promotionId,
      eval_of_lecturer,
      adminId,
    ]
  );

  const insertOperation8 = await query(
    "INSERT INTO hod_assessment(item, promotion_id, score, hod_id) " +
      "VALUES(?,?,?,?)",
    [
      "Maintenance of attendance and continuous assessment records of students",
      promotionId,
      maintenance,
      adminId,
    ]
  );

  if (
    insertOperation1.affectedRows === 1 &&
    insertOperation2.affectedRows === 1 &&
    insertOperation3.affectedRows === 1 &&
    insertOperation4.affectedRows === 1 &&
    insertOperation5.affectedRows === 1 &&
    insertOperation6.affectedRows === 1 &&
    insertOperation7.affectedRows === 1 &&
    insertOperation8.affectedRows === 1
  ) {
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

router.post("/hod/approve-application", verifyToken, async (req, res) => {
  const { promotionId } = req.body;

  let updateOperation = await query(
    "UPDATE promotion SET status=? WHERE id=?",
    ["department approved", promotionId]
  );
  if (updateOperation.affectedRows === 1) {
    let promotionData = await query(
      "SELECT rank_id FROM promotion WHERE id=?",
      [promotionId]
    );

    let updateStaffRank = await query(
      "UPDATE staff_rank SET rank_application_status=? WHERE rank_id=?",
      ["department approved", promotionData[0].rank_id]
    );

    if (updateStaffRank.affectedRows === 1) {
      res.send({
        error: false,
        promotionData: promotionData[0],
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
      errorMessage: "Server Error",
    });
  }
});

router.post("/hod/reject-promotion", verifyToken, async (req, res) => {
  const { promotionId, rejectionMessage } = req.body;

  let updateOperation = await query(
    "UPDATE promotion SET status=?, rejection_message=? WHERE id=?",
    ["department rejected", rejectionMessage, promotionId]
  );
  if (updateOperation.affectedRows === 1) {
    let promotionData = await query(
      "SELECT rank_id FROM promotion WHERE id=?",
      [promotionId]
    );

    let updateStaffRank = await query(
      "UPDATE staff_rank SET rank_application_status=? WHERE rank_id=?",
      ["department rejected", promotionData[0].rank_id]
    );

    if (updateStaffRank.affectedRows === 1) {
      res.send({
        error: false,
        promotionData: promotionData[0],
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
      errorMessage: "Server Error",
    });
  }
});

module.exports = router;
