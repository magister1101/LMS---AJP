const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Course = require('../models/course');
const User = require('../models/user');
const { type } = require('os');

const performUpdate = (userId, updateFields, res) => {
    Course.findByIdAndUpdate(userId, updateFields, { new: true })
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

exports.courses_get_all_course = async (req, res, next) => {
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
        description: req.body.description,
        active: active,
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
            isApproved: true,
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

exports.courses_update_course = async (req, res, next) => {
    const userId = req.params.id;
    const updateFields = req.body;

    if (updateFields.password) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;

        bcrypt.hash(updateFields.password, saltRounds, (err, hash) => {
            if (err) {
                return res.status(500).json({
                    message: "Error in hashing password",
                    error: err
                });
            }
            updateFields.password = hash;
            performUpdate(userId, updateFields, res);
        });
    }
    else {
        performUpdate(userId, updateFields, res);
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

exports.getUserCourses = async (req, res) => {
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

exports.getUserActivities = async (req, res) => {
    const courseId = req.body.courseId;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ error: 'Invalid course ID.' });
    }

    try {
        const courses = await Course.findById({ _id: courseId })
        if (courses.length === 0) {
            return res.status(404).json({ message: 'No activities found for this user.' });
        }
        const activities = courses.activities.filter(activity => activity.active);
        return res.status(200).json({
            activities
        });
    } catch (error) {
        console.error('Error retrieving user activities:', error);
        res.status(500).json({ error: 'An error occurred while retrieving activities.' });
    }
};

exports.updateActivity = async (req, res) => {
    const { courseId, activityId } = req.params;
    const updateFields = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(activityId)) {
            return res.status(400).json({ message: 'Invalid course or activity ID' });
        }

        // Find the course and locate the specific activity
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const activity = course.activities.id(activityId);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Update the activity fields
        Object.keys(updateFields).forEach((field) => {
            activity[field] = updateFields[field];
        });

        // Save the updated course
        await course.save();

        res.status(200).json({
            message: 'Activity updated successfully',
            activity: activity,
        });
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ error: 'An error occurred while updating the activity.' });
    }
};


