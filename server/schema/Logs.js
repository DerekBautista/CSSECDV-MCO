const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LOG_TYPES = require('../../public/utils/logTypes');

const LogSchema = new mongoose.Schema({
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },

    username:{
        type:String
    },

    ip:{
        type:String
    },

    userType:{
        type:String
    },

    logType: {
        type: String,
        enum: LOG_TYPES,
        required: true
    },

    detectedAt: {
        type: Date,
        default: Date.now
    }
});

const Log = mongoose.model("Log", LogSchema);
module.exports = Log;