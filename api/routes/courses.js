const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const CoursesController = require('../controllers/courses');

// routers
router.get('/', CoursesController.courses_get_all_course);
router.get('/viewer', checkAuth, CoursesController.getUserActivities);
router.post('/', CoursesController.courses_create_course);
router.post('/activity', CoursesController.addActivity);
router.post('/join', CoursesController.users_join_course);
router.put('/update/:id', CoursesController.courses_update_course);

module.exports = router;