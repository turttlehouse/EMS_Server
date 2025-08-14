import Option from "./models/optionModel";
import Question from "./models/questionModel";
import StudentAnswer from "./models/studentAnswerModel";
import Submission from "./models/submissionModel";
import Test from "./models/testModel";
import User from "./models/userModel";

export const initAssociations = () => {
  // User Associations
  User.hasMany(Test, {
    foreignKey: "createdBy",
    as: "testsCreated",
    onDelete: "RESTRICT",// ❌ disabled deleting users who created tests
  });

  User.hasMany(Submission, {
    foreignKey: "studentId",
    as: "submissions",
    onDelete: "RESTRICT", // ❌ disabled deleting users who have submissions
  });

  User.hasMany(StudentAnswer, {
    foreignKey: "studentId",
    as: "studentAnswers",
    onDelete: "RESTRICT", // ❌ Preserved student answers for audit
  });

  // Test Associations
  Test.belongsTo(User, {
    foreignKey: "createdBy",
    as: "creator",
    onDelete: "RESTRICT", // ❌ disabled deleting test if creator is deleted
  });

  Test.hasMany(Question, {
    foreignKey: "testId",
    as: "questions",
    onDelete: "CASCADE", //  Deleting questions when test is deleted
  });

  Test.hasMany(Submission, {
    foreignKey: "testId",
    as: "submissions",
    onDelete: "RESTRICT", // ❌ disabled deleting tests with submissions
  });

  Test.hasMany(StudentAnswer, {
    foreignKey: "testId",
    as: "studentAnswers",
    onDelete: "RESTRICT", // ❌ Preserve answers for audit
  });

  // Question Associations
  Question.belongsTo(Test, {
    foreignKey: "testId",
    as: "test",
    onDelete: "CASCADE", // Already handled by Test -> Question cascade
  });

  Question.hasMany(Option, {
    foreignKey: "questionId",
    as: "options",
    onDelete: "CASCADE", // Delete options when question is deleted
  });

  Question.hasMany(StudentAnswer, {
    foreignKey: "questionId",
    as: "studentAnswers",
    onDelete: "RESTRICT", // ❌ Preserve answers for audit
  });

  // Option associations
  Option.belongsTo(Question, {
    foreignKey: "questionId",
    as: "question",
    onDelete: "CASCADE", // Already handled by Question -> Option cascade
  });

  Option.hasMany(StudentAnswer, {
    foreignKey: "selectedOptionId",
    as: "selectedByStudents",
    onDelete: "SET NULL", // Keep answer record but nullify option reference
  });

  // Submission associations
  Submission.belongsTo(Test, {
    foreignKey: "testId",
    as: "test",
    onDelete: "RESTRICT", // disabled deleting submissions
  });

  Submission.belongsTo(User, {
    foreignKey: "studentId",
    as: "student",
    onDelete: "RESTRICT",// disabled deleting submissions
  });

  Submission.hasMany(StudentAnswer, {
    foreignKey: "submissionId",
    as: "answers",
    onDelete: "CASCADE",
  });

  // StudentAnswer associations
  StudentAnswer.belongsTo(User, {
    foreignKey: "studentId",
    as: "student",
    onDelete: "CASCADE", // Deleting answers when submission is deleted
  });

  StudentAnswer.belongsTo(Test, {
    foreignKey: "testId",
    as: "test",
    onDelete: "RESTRICT", // ❌ Preserve for audit
  });

  StudentAnswer.belongsTo(Submission, {
    foreignKey: "submissionId",
    as: "submission",
    onDelete: "CASCADE", // Already handled by Submission -> StudentAnswer
  });

  StudentAnswer.belongsTo(Question, {
    foreignKey: "questionId",
    as: "question",
    onDelete: "RESTRICT", // ❌ Preserve for audit
  });

  StudentAnswer.belongsTo(Option, {
    foreignKey: "selectedOptionId",
    as: "selectedOption",
    onDelete: "SET NULL", // Keeping answer but allow option deletion
  });
};
