const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },
    description: { type: String, required: true },
    population: [
        {
            members: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            isApproved: { type: Boolean, default: false },

        },
    ],

    isArchived: { type: Boolean, default: false },
});

module.exports = mongoose.model('Course', CourseSchema);