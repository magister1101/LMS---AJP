const mongoose = require('mongoose');
const { type } = require('os');

const CourseSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    username: { type: String, required: true }, //course code
    description: { type: String, required: true },
    members: [
        {
            member: { type: mongoose.Schema.Types.ObjectId },
            name: { type: String },
            group: { type: String },
            isApproved: { type: Boolean, default: false },
        },
    ],
    activities: [
        {
            name: { type: String },
            description: { type: String },
            active: { type: Boolean },
        }
    ],

    active: { type: Boolean, default: true },
});

module.exports = mongoose.model('Course', CourseSchema);