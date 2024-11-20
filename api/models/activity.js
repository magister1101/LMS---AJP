const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    file: { type: String, required: true },

    isArchived: { type: Boolean, default: false },
});

module.exports = mongoose.model('Activity', activitySchema);