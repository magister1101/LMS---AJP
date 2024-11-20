const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Course = require('../models/course');
const User = require('../models/user');
const { type } = require('os');

exports.courses_get_all_course = (req, res, next) => { // Course object is reference from course model
    Course.find()
        .exec()
        .then(course => {
            const response = {
                count: course.length,
                course: course
            }
            if (course.length > 0) {
                res.status(200).json(response)
            }
            else {
                res.status(404).json({
                    message: 'No Course Entries Found'
                })
            }

        })
        .catch(err => {
            res.status(500).json({
                error: err,
            })
        }
        )
};

exports.courses_create_course = (req, res, next) => {

    const course = new Course({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        description: req.body.description
    });
    course.save().then(result => {
        res.status(201).json({
            message: 'Course created',
            course: result
        })
    })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
};

exports.users_join_course = async (req, res, next) => {
    const { courseId, userId } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: 'Invalid ID (courseId or userId)'
            });

        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: 'Course not found'
            });
        }

        const isAlreadyMember = course.population.some(pop =>
            pop.members.includes(userId)
        )

        if (isAlreadyMember) {
            return res.status(400).json({
                message: 'User already joined the course'
            });
        }

        course.population.push({
            members: [userId],
            isApproved: false,
        })

        await course.save();
        res.status(200).json({
            message: 'User joined the course',
            course: course
        })

    } catch (err) {
        return res.status(500).json({
            message: 'error in joining course',
            error: err
        })
    }
};

exports.courses_archive_course = async (req, res, next) => {
    const { courseId } = req.params;
    const { isArchived } = req.body;

    if (typeof isArchived !== 'boolean') {
        return res.status(400).json({
            message: 'isArchived should be a boolean'
        });
    }

    try {
        const archivedCourse = await Course.findByIdAndUpdate(courseId, { isArchived }, { new: true });
        if (!archivedCourse) {
            res.status(404).json({
                message: 'Course not found'
            });
        }
        res.status(200).json({
            message: 'Course archived',
            course: archivedCourse
        });
    }
    catch (err) {
        res.status(500).json({
            message: 'Error in archiving course',
            error: err
        });
    }
};
