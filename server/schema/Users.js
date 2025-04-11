const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

// USER TYPES: ADMIN, EMPLOYEE, PROJ-OWN

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
    userType: {
        type: String, 
        default: "CUSTOMER"
    },
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

    remainingAttempts: {
        type: Number,
    },

    isLocked: {
        type: Boolean,
    },

    lockedUntil: {
        type: Date
    },

    totalFailedAuthentications:{
        type:Number
    },

    totalLockouts:{
        type:Number
    }
})


userSchema.methods.lockUser = async function(minutes) {
    this.isLocked = true;
    this.lockedUntil = new Date(Date.now() + minutes * 60 * 1000);
    await this.save(); 
};
  
userSchema.methods.isLockedOut = async function() {
    if(this.isLocked && this.lockedUntil > new Date()){
        return {isLocked: this.isLocked, lockedUntil: this.lockedUntil};
    }
    else{
        await this.unlockUser()
        return {isLocked: this.isLocked, lockedUntil: this.lockedUntil};
    }
    
};

userSchema.methods.deductAttempts = async function () {
    if(!this.remainingAttempts){ //if very first time failing authentication, we create attribute
        this.remainingAttempts == 5
    }
    this.remainingAttempts -= 1;

    this.totalFailedAuthentications = (this.totalFailedAuthentications ?? 0) + 1; //if very first time failing authentication, we create attribute

    if(this.remainingAttempts == 0){
        this.totalLockouts = (this.totalLockouts ?? 0) + 1; //if very first time failing authentication, we create attribute
        await this.lockUser(1);
        await this.save();
        return {remainingAttempts: this.remainingAttempts, lockedUntil: this.lockedUntil}; 
    }

    await this.save();
    return { remainingAttempts: this.remainingAttempts, lockedUntil: 0};
};

userSchema.methods.resetAttempts = async function () {
    this.remainingAttempts = 5;
    await this.save()
}

userSchema.methods.unlockUser = async function() {
    this.lockedUntil = undefined;
    this.isLocked = false;
    this.resetAttempts()
    await this.save()
}

userSchema.plugin(passportLocalMongoose, {usernameField: 'companyID'});
const User = mongoose.model("User", userSchema);

module.exports = User;
