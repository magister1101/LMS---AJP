const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const { upload } = require('../../configs/uploadConfigActivity');

const CoursesController = require('../controllers/courses');

// routers
router.get('/', CoursesController.courses_get_all_course);
router.get('/viewer', checkAuth, CoursesController.getUserCourses);
router.get('/getLogs', CoursesController.viewLogs);
router.post('/activities', CoursesController.getUserActivities);
router.post('/', CoursesController.courses_create_course);
router.post('/activity', checkAuth, upload.single('file'), CoursesController.addActivity);
router.post('/member', CoursesController.users_join_course);
router.put('/update/:id', CoursesController.courses_update_course);
router.put('/activity/:courseId/:activityId', CoursesController.updateActivity);

module.exports = router;