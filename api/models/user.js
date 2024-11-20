const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String },
    studentId: { type: String, default: 'None' },
    department: { type: String, default: 'None' },
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },

    role: { type: String, required: true }, //student, teacher, admin

    isArchived: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', UserSchema);