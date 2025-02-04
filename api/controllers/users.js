const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

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

const isAdmin = async (valToken, res) => {
    const AUTH_TOKEN = valToken;
    if (!AUTH_TOKEN) {
        return res.status(401).json({ message: "No token provided" });
    }
    let admin = false;
    const token = AUTH_TOKEN;
    const decoded = jwt.verify(token, "secretkey");

    await User.findOne({ _id: decoded.userId })
        .exec()
        .then(user => {
            if (user.role === "admin") {
                admin = true;
            }
        }
        )
        .catch(err => {
            return res.status(500).json({
                message: "Error in retrieving user information",
                error: err
            });
        })
    return admin;

};

exports.users_get_user = async (req, res, next) => {
    try {
        const { active, query, filter } = req.query;

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
                { firstName: { $regex: escapedQuery, $options: 'i' } },
                { lastName: { $regex: escapedQuery, $options: 'i' } },
                { middleName: { $regex: escapedQuery, $options: 'i' } },
                { group: { $regex: escapedQuery, $options: 'i' } },
                { email: { $regex: escapedQuery, $options: 'i' } },
                { username: { $regex: escapedQuery, $options: 'i' } },
                { role: { $regex: escapedQuery, $options: 'i' } },


            );

            queryConditions.push({ $or: orConditions });
        }

        if (filter) {
            const escapedFilter = escapeRegex(filter);
            const orConditions = [];
            if (mongoose.Types.ObjectId.isValid(filter)) {
                orConditions.push({ _id: filter });
            }

            orConditions.push(
                { firstName: { $regex: escapedFilter, $options: 'i' } },
                { lastName: { $regex: escapedFilter, $options: 'i' } },
                { middleName: { $regex: escapedFilter, $options: 'i' } },
                { group: { $regex: escapedFilter, $options: 'i' } },
                { email: { $regex: escapedFilter, $options: 'i' } },
                { username: { $regex: escapedFilter, $options: 'i' } },
                { role: { $regex: escapedFilter, $options: 'i' } },


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

        const users = await User.find(searchCriteria);

        return res.status(200).json(users);


    }
    catch (error) {
        return res.status(500).json({
            message: "Error in retrieving users",
            error: error
        })
    }
};

exports.users_get_userByRole = async (req, res, next) => {
    try {
        const { token } = req.body;
        const Admin = await isAdmin(token, res);

        if (!Admin) {
            return res.status(403).json({ message: "Forbidden" });
        }

        User.find({ role: req.params.role })
            .exec()
            .then(user => {
                return res.status(200).json(user);
            })
            .catch(err => {
                return res.status(500).json({
                    message: "Error in retrieving users",
                    error: err
                });
            })
    } catch (error) {
        return res.status(500).json({
            message: "Error in validating token",
            error: error
        });
    }
};

exports.users_get_userById = (req, res, next) => {
    User.findOne({ _id: req.params.id })
        .exec()
        .then(user => {
            res.status(200).json(user);
        })
        .catch(err => {
            res.status(500).json({
                message: "Error in retrieving user by id",
                error: err
            })
        })
};

exports.users_profile_user = (req, res, next) => {
    User.findOne({ _id: req.userData.userId })
        .exec()
        .then(user => {
            return res.status(200).json(user);
        })
        .catch(err => {
            return res.status(500).json({
                error: err
            });
        });
};

exports.users_token_validation = (req, res, next) => {
    try {
        const AUTH_TOKEN = req.body.token;
        if (!AUTH_TOKEN) {
            return res.status(401).json({ isValid: false });
        }

        const token = AUTH_TOKEN;
        const decoded = jwt.verify(token, "secretkey");

        return res.json({ isValid: true });
    } catch (error) {
        return res.status(500).json({ isValid: false });
    }
};

exports.users_create_user = (req, res, next) => {

    if (req.body.role) {
        req.body.role = req.body.role.toLowerCase();
    }
    User.find({ $or: [{ username: req.body.username }, { email: req.body.email }] })
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "Username or email already exists"
                });
            }
            else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Error in hashing password",
                            error: err
                        });
                    }
                    else {
                        const userId = new mongoose.Types.ObjectId();
                        const user = new User({
                            _id: userId,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            middleName: req.body.middleName,
                            group: req.body.group,
                            email: req.body.email,
                            username: req.body.username,
                            password: hash,
                            role: req.body.role
                        })
                        user.save()
                            .then(doc => {
                                return res.status(201).json({ doc });
                            })
                            .catch(err => {
                                return res.status(500).json({
                                    message: "Error in creating user",
                                    error: err
                                });
                            });
                    }
                });
            }
        })
};

exports.users_login_user = (req, res, next) => {
    User.find({ username: req.body.username })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Invalid Username'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Invalid Password'
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        userId: user[0]._id,
                        username: user[0].username,
                    },
                        "secretkey", //private key
                        {
                            expiresIn: "8h" //key expires in 1 hour
                        }
                    )

                    return res.status(200).json({ token });
                }
                return res.status(401).json({
                    message: 'Login failed'
                });
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })

};

exports.users_update_user = (req, res, next) => {
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

