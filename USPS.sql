-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema usps
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema usps
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `usps` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `usps` ;

-- -----------------------------------------------------
-- Table `usps`.`staff_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`staff_details` (
  `sp_number` INT NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `password` VARCHAR(200) NOT NULL,
  `department` VARCHAR(100) NOT NULL,
  `faculty` VARCHAR(100) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NOT NULL,
  `institutional_email` VARCHAR(100) NOT NULL,
  `alternate_email` VARCHAR(100) NOT NULL,
  `linkedin_id` VARCHAR(100) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  `date_of_assumption_of_duty` DATE NULL DEFAULT NULL,
  `date_of_confirmation_of_appointment` VARCHAR(100) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  `date_of_resumption_of_duty_after_study_leave` VARCHAR(100) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  `rank_being_applied_for` VARCHAR(100) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  `area_of_specialization` VARCHAR(100) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  `image_path` VARCHAR(100) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  `image_filename` VARCHAR(255) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  `phone_number` VARCHAR(50) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NOT NULL,
  `initial_rank` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`sp_number`))
ENGINE = InnoDB
AUTO_INCREMENT = 2147483647
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`staff_rank`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`staff_rank` (
  `rank_id` INT NOT NULL AUTO_INCREMENT,
  `staff_id` INT NULL DEFAULT NULL,
  `rank_name` VARCHAR(50) NOT NULL,
  `start_date` VARCHAR(100) NOT NULL,
  `end_date` VARCHAR(100) NOT NULL,
  `active` INT NULL DEFAULT NULL,
  `rank_application_status` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`rank_id`),
  INDEX `staff_id` (`staff_id` ASC) VISIBLE,
  CONSTRAINT `staff_rank_ibfk_1`
    FOREIGN KEY (`staff_id`)
    REFERENCES `usps`.`staff_details` (`sp_number`))
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`promotion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`promotion` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rank_id` INT NULL DEFAULT NULL,
  `application_date` VARCHAR(20) NULL DEFAULT NULL,
  `status` VARCHAR(50) NULL DEFAULT NULL,
  `rejection_message` VARCHAR(500) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `promotion_ibfk_1` (`rank_id` ASC) VISIBLE,
  CONSTRAINT `promotion_ibfk_1`
    FOREIGN KEY (`rank_id`)
    REFERENCES `usps`.`staff_rank` (`rank_id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`administrative_and_organizational_experience`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`administrative_and_organizational_experience` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `promotion_id` INT NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `start_date` VARCHAR(100) NOT NULL,
  `end_date` VARCHAR(100) NOT NULL,
  `point` DECIMAL(10,0) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `staff_id_staff_details_SP_number` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `staff_id_staff_details_SP_number`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`community_service`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`community_service` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `promotion_id` INT NOT NULL,
  `position` VARCHAR(500) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NOT NULL,
  `start_date` VARCHAR(100) NOT NULL,
  `end_date` VARCHAR(100) NOT NULL,
  `point` DECIMAL(3,1) NULL DEFAULT NULL,
  `organization` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `community_service_staff_id_staff_details_SP_number` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `community_service_staff_id_staff_details_SP_number`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`computer_literacy`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`computer_literacy` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `promotion_id` INT NOT NULL,
  `point` DECIMAL(3,1) NULL DEFAULT NULL,
  `certificate_title` VARCHAR(100) NULL DEFAULT NULL,
  `year` VARCHAR(10) NULL DEFAULT NULL,
  `certificate_file_path` VARCHAR(100) NULL DEFAULT NULL,
  `certificate_file_name` VARCHAR(250) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `computer_literacy_staff_id_staff_details_SP_number` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `computer_literacy_staff_id_staff_details_SP_number`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`conferences_attended`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`conferences_attended` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NULL DEFAULT NULL,
  `organizer` VARCHAR(200) NULL DEFAULT NULL,
  `presented_a_paper` VARCHAR(10) NULL DEFAULT NULL,
  `paper_file_path` VARCHAR(200) NULL DEFAULT NULL,
  `paper_file_name` VARCHAR(200) NULL DEFAULT NULL,
  `point` DECIMAL(3,1) NULL DEFAULT NULL,
  `promotion_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `conferences_attended_ibfk_1` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `conferences_attended_ibfk_1`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 8
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`courses_taught`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`courses_taught` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `course_code` VARCHAR(20) NULL DEFAULT NULL,
  `course_title` VARCHAR(20) NULL DEFAULT NULL,
  `unit` VARCHAR(20) NULL DEFAULT NULL,
  `contribution` VARCHAR(100) NULL DEFAULT NULL,
  `teaching_load` VARCHAR(100) NULL DEFAULT NULL,
  `point` DECIMAL(3,1) NULL DEFAULT NULL,
  `semester` VARCHAR(50) NULL DEFAULT NULL,
  `promotion_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `courses_taught_ibfk_1` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `courses_taught_ibfk_1`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 20
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`education`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`education` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `degree` VARCHAR(100) NOT NULL,
  `class_of_degree` VARCHAR(100) NOT NULL,
  `institution` VARCHAR(100) NOT NULL,
  `date_of_award` VARCHAR(100) NOT NULL,
  `point` DECIMAL(3,1) NULL DEFAULT NULL,
  `promotion_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `promotion_id` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `education_ibfk_1`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 27
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`faculty_admin_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`faculty_admin_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(200) NULL DEFAULT NULL,
  `password` VARCHAR(200) NULL DEFAULT NULL,
  `first_name` VARCHAR(50) NULL DEFAULT NULL,
  `last_name` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`hod_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`hod_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(100) NULL DEFAULT NULL,
  `password` VARCHAR(100) NULL DEFAULT NULL,
  `first_name` VARCHAR(100) NULL DEFAULT NULL,
  `last_name` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`hod_assessment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`hod_assessment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `item` VARCHAR(200) NULL DEFAULT NULL,
  `promotion_id` INT NULL DEFAULT NULL,
  `score` DECIMAL(3,1) NULL DEFAULT NULL,
  `hod_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `hod_id` (`hod_id` ASC) VISIBLE,
  INDEX `hod_assessment_ibfk_1` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `hod_assessment_ibfk_1`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT,
  CONSTRAINT `hod_assessment_ibfk_2`
    FOREIGN KEY (`hod_id`)
    REFERENCES `usps`.`hod_details` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 40
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`overall_admin_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`overall_admin_details` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(200) NULL DEFAULT NULL,
  `password` VARCHAR(200) NULL DEFAULT NULL,
  `first_name` VARCHAR(50) NULL DEFAULT NULL,
  `last_name` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 3
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`post_graduate_supervision`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`post_graduate_supervision` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `admission_number` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `thesis_title` VARCHAR(500) NOT NULL,
  `year` VARCHAR(100) NOT NULL,
  `degree` VARCHAR(100) NOT NULL,
  `status` VARCHAR(100) NOT NULL,
  `point` DECIMAL(3,1) NULL DEFAULT NULL,
  `promotion_id` INT NOT NULL,
  `institution` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `post_graduate_supervisor_staff_id_staff_details_SP_number` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `post_graduate_supervisor_staff_id_staff_details_SP_number`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 5
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`publications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`publications` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `promotion_id` INT NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `point` DECIMAL(3,1) NULL DEFAULT NULL,
  `issn` VARCHAR(100) NULL DEFAULT NULL,
  `doi` VARCHAR(100) NULL DEFAULT NULL,
  `publisher` VARCHAR(100) NULL DEFAULT NULL,
  `type_of_publication` VARCHAR(100) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  `number_of_authors` INT NULL DEFAULT NULL,
  `position` VARCHAR(20) NULL DEFAULT NULL,
  `year` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `publications_staff_id_staff_details_SP_number` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `publications_staff_id_staff_details_SP_number`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 7
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`ranks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`ranks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `rank_name` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 8
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`remarks`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`remarks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `remark` VARCHAR(500) NULL DEFAULT NULL,
  `reciever` VARCHAR(50) NULL DEFAULT NULL,
  `opened` TINYINT(1) NULL DEFAULT NULL,
  `created_by` VARCHAR(20) NULL DEFAULT NULL,
  `promotion_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `promotion_id` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `remarks_ibfk_1`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`research_papers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`research_papers` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `promotion_id` INT NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `authors` VARCHAR(100) NOT NULL,
  `point` DECIMAL(3,1) NULL DEFAULT NULL,
  `presented_at` VARCHAR(100) NULL DEFAULT NULL,
  `research_paper_file_path` VARCHAR(100) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  `research_paper_filename` VARCHAR(100) CHARACTER SET 'utf8mb4' COLLATE 'utf8mb4_0900_ai_ci' NULL DEFAULT NULL,
  `original_name` VARCHAR(200) NOT NULL,
  `year` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `research_papers_staff_id_staff_details_SP_number` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `research_papers_staff_id_staff_details_SP_number`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 18
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`students_assessment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`students_assessment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `score` DECIMAL(3,1) NULL DEFAULT NULL,
  `promotion_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `students_assessment_ibfk_1` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `students_assessment_ibfk_1`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`teaching_experience`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`teaching_experience` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `designation` VARCHAR(100) NOT NULL,
  `institution` VARCHAR(100) NOT NULL,
  `nature_of_duty` VARCHAR(100) NOT NULL,
  `start_date` VARCHAR(100) NOT NULL,
  `end_date` VARCHAR(100) NOT NULL,
  `point` DECIMAL(3,1) NULL DEFAULT NULL,
  `promotion_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `promotion_id` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `teaching_experience_ibfk_1`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`))
ENGINE = InnoDB
AUTO_INCREMENT = 12
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `usps`.`undergraduate_supervision`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usps`.`undergraduate_supervision` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `promotion_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `admission_number` INT NOT NULL,
  `project_title` VARCHAR(200) NOT NULL,
  `point` DECIMAL(3,1) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `undergraduate_supervision_staff_id_staff_details_SP_number` (`promotion_id` ASC) VISIBLE,
  CONSTRAINT `undergraduate_supervision_staff_id_staff_details_SP_number`
    FOREIGN KEY (`promotion_id`)
    REFERENCES `usps`.`promotion` (`id`)
    ON DELETE RESTRICT
    ON UPDATE RESTRICT)
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
