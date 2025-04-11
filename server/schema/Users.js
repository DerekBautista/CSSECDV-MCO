const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = mongoose.Schema({
    firstName: {
        type: String, 
        require: true
    },
    middleName: {
        type: String, 
        require: false
    },
    lastName: {
        type: String, 
        require: true
    },
    suffix: {
        type: String, 
        require: false
    },
    // userPosition: {
    //     type: String, 
    //     require: true
    // },
    companyID: {
        type: Number, 
        require: true,
        unique: true,   // This is to make sure that the userID is unique
        // max: 12,        // This is to make sure that the userID is only 10 characters long COMMENTED IT OUT BECAUSE IT CAUSES ERROR
        index: true     // This is to make sure that the userID is indexed
    },
    userProfilePic: {
        type: String,
        default: "img/default-user-profile-pic.jpg" // This is to make sure that the user has a default profile picture
    },
    LastLoginDate: {
        type: Date,
        default: null
    },
    CurrentLoginDate: {
        type: Date,
        default: null
    }
})

userSchema.plugin(passportLocalMongoose, {usernameField: 'companyID'});
const User = mongoose.model("User", userSchema);

module.exports = User;
