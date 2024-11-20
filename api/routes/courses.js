const express = require('express');
const router = express.Router();

const CoursesController = require('../controllers/courses');

// routers
router.get('/', CoursesController.courses_get_all_course);
router.post('/', CoursesController.courses_create_course);
router.post('/join', CoursesController.users_join_course);
router.put('/archive/:courseId', CoursesController.courses_archive_course);

module.exports = router;