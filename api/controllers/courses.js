const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Course = require('../models/course');
const User = require('../models/user');
const { type } = require('os');

const performUpdate = (userId, updateFields, res) => {
    User.findByIdAndUpdate(userId, updateFields, { new: true })
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json(updatedUser);

        })
        .catch((err) => {
            return res.status(500).json({
                message: "Error in updating user",
                error: err
            });
        })
};

exports.courses_get_all_course = async (req, res, next) => { // Course object is reference from course model
    try {
        const { active, query } = req.query;

        const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        let searchCriteria = {};
        const queryConditions = [];

        if (query) {
            const escapedQuery = escapeRegex(query);
            const orConditions = [];
            if (mongoose.Types.ObjectId.isValid(query)) {
                orConditions.push({ _id: query });
            }

            orConditions.push(
                { name: { $regex: escapedQuery, $options: 'i' } },
                { description: { $regex: escapedQuery, $options: 'i' } },
            );

            queryConditions.push({ $or: orConditions });
        }

        if (active) {
            const isActive = active === 'true';
            queryConditions.push({ active: isActive });
        }

        if (queryConditions.length > 0) {
            searchCriteria = { $and: queryConditions };
        }

        const users = await Course.find(searchCriteria);
        return res.status(200).json(users);


    }
    catch (error) {
        return res.status(500).json({
            message: "Error in retrieving users",
            error: error
        })
    }
};

exports.courses_create_course = (req, res, next) => {

    const course = new Course({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        username: req.body.username,
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
    const { courseId, userId, name, group } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                message: 'Invalid ID (courseId or userId)',
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: 'Course not found',
            });
        }

        const isAlreadyMember = course.members.some((member) =>
            member.member && member.member.toString() === userId
        );

        if (isAlreadyMember) {
            return res.status(400).json({
                message: 'User already joined the course',
            });
        }

        course.members.push({
            member: userId,
            name: name,
            group: group,
            isApproved: false,
        });

        // Save the course
        await course.save();

        return res.status(200).json({
            message: 'User joined the course',
            course,
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Error in joining course',
            error: err.message,
        });
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

exports.addActivity = async (req, res) => {
    const { courseId, name, description } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                message: 'Invalid ID (courseId or userId)',
            });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: 'Course not found',
            });
        }

        console.log(course.activities)

        course.activities.push({
            name: name,
            description: description,
            active: true
        });

        // Save the course
        await course.save();

        return res.status(200).json({
            message: 'activity added to the course',
            course,
        });
    } catch (err) {
        return res.status(500).json({
            message: 'Error in joining course',
            error: err.message,
        });
    }
};


exports.getUserActivities = async (req, res) => {
    const userId = req.userData.userId;
    console.log(userId)

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID.' });
    }

    try {
        // Find all courses where the user is a member
        const courses = await Course.find({
            'members.member': userId
        });

        if (courses.length === 0) {
            return res.status(404).json({ message: 'No activities found for this user.' });
        }


        res.status(200).json({
            courses
        });
    } catch (error) {
        console.error('Error retrieving user activities:', error);
        res.status(500).json({ error: 'An error occurred while retrieving activities.' });
    }
};

