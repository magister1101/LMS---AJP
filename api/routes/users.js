const express = require('express');
const router = express.Router();

const UsersController = require('../controllers/users');

// routers

router.get('/', UsersController.users_get_user);
router.post('/role/:role', UsersController.users_get_userByRole);
router.get('/:id', UsersController.users_get_userById);
router.post('/myProfile', UsersController.users_profile_user);
router.post('/tokenValidation', UsersController.users_token_validation);
router.post('/signup', UsersController.users_create_user);
router.post('/logIn', UsersController.users_login_user);
router.put('/update/:id', UsersController.users_update_user);

module.exports = router;