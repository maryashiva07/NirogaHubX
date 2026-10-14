const User = require("./User");
const Patient = require("./Patient");
const Doctor = require("./Doctor");
const Clinic = require("./Clinic");
const Token = require("./Token");
const Payment = require("./Payment");
const Prescription = require("./Prescription");


// User → Patient


User.hasOne(Patient, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Patient.belongsTo(User, {
  foreignKey: "userId",
});



// User → Doctor


User.hasOne(Doctor, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Doctor.belongsTo(User, {
  foreignKey: "userId",
});



// Doctor → Clinic


Doctor.hasMany(Clinic, {
  foreignKey: "doctorId",
  onDelete: "CASCADE",
});

Clinic.belongsTo(Doctor, {
  foreignKey: "doctorId",
});



// Patient → Token


Patient.hasMany(Token, {
  foreignKey: "patientId",
  onDelete: "CASCADE",
});

Token.belongsTo(Patient, {
  foreignKey: "patientId",
});



// Doctor → Token


Doctor.hasMany(Token, {
  foreignKey: "doctorId",
  onDelete: "CASCADE",
});

Token.belongsTo(Doctor, {
  foreignKey: "doctorId",
});



// Clinic → Token


Clinic.hasMany(Token, {
  foreignKey: "clinicId",
  onDelete: "CASCADE",
});

Token.belongsTo(Clinic, {
  foreignKey: "clinicId",
});



// User → Payment


User.hasMany(Payment, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

Payment.belongsTo(User, {
  foreignKey: "userId",
});



// Token → Payment


Token.hasOne(Payment, {
  foreignKey: "tokenId",
  onDelete: "CASCADE",
});

Payment.belongsTo(Token, {
  foreignKey: "tokenId",
});


// Prescription 

Patient.hasMany(Prescription, {
  foreignKey: "patientId",
  onDelete: "CASCADE",
});

Prescription.belongsTo(Patient, {
  foreignKey: "patientId",
});

Doctor.hasMany(Prescription, {
  foreignKey: "doctorId",
  onDelete: "CASCADE",
});

Prescription.belongsTo(Doctor, {
  foreignKey: "doctorId",
});

Token.hasOne(Prescription, {
  foreignKey: "tokenId",
  onDelete: "SET NULL",
});

Prescription.belongsTo(Token, {
  foreignKey: "tokenId",
});


module.exports = {
  User,
  Patient,
  Doctor,
  Clinic,
  Token,
  Payment,
  Prescription
};