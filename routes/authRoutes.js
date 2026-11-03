
const express = require("express");
const router = express.Router();

// Folder ka naam dhyan se dekhna: 'controller' ya 'controllers'
const { register, login } = require("../controller/authController");

// Debug karne ke liye check: dono functions hone chahiye
// console.log('Register handler:', typeof register);
//console.log("Login handler:", typeof login);

router.post("/register", register);
router.post("/login", login);

module.exports = router;
