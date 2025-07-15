const express = require('express');
const { signup, login, getUserProfile, updateUserProfile, deleteUser, } = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.delete('/profile', deleteUser);

module.exports = router;