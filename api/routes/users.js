const express = require('express');
const router = express.Router();

const UsersController = require('../controllers/users');

// routers

router.get('/', UsersController.users_get_user);
router.get('/:id', UsersController.users_get_userById);
router.post('/myProfile', UsersController.users_profile_user);
router.post('/tokenValidation', UsersController.users_token_validation);
router.post('/signup/student', UsersController.users_create_student);
router.post('/signup/teacher', UsersController.users_create_teacher);
router.post('/logIn', UsersController.users_login_user);

module.exports = router;