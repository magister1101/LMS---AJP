const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const UsersController = require('../controllers/users');

// routers

router.get('/', UsersController.users_get_user);
router.get('/myProfile', checkAuth, UsersController.users_profile_user);
router.post('/', UsersController.users_create_user);
router.post('/role/:role', UsersController.users_get_userByRole);
router.post('/tokenValidation', UsersController.users_token_validation);
router.post('/logIn', UsersController.users_login_user);
router.put('/update/:id', UsersController.users_update_user);

module.exports = router;