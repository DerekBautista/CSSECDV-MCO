const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FailedAttempt = new mongoose.Schema({
    ip: String,
    remainingAttempts: Number,
    lockedUntil: Date,
    isLocked: Boolean,
    createdAt: { type: Date, expires: '24h' } 
})

//This is the lockout timer. If time is up it will delete the document.
FailedAttempt.index({ lockedUntil: 1 }, { expireAfterSeconds: 0 });

FailedAttempt.methods.lockUser = async function(minutes) {
    this.isLocked = true;
    this.lockedUntil = new Date(Date.now() + minutes * 60 * 1000);
    await this.save(); 
};
  
FailedAttempt.methods.isLockedOut = function() {
    return {isLocked: this.isLocked && this.lockedUntil > new Date(), lockedUntil: this.lockedUntil};
};

FailedAttempt.methods.deductAttempts = async function () {
    this.remainingAttempts -= 1;
    if(this.remainingAttempts == 0){
        await this.lockUser(1);
        await this.save();
        return {remainingAttempts: this.remainingAttempts, lockedUntil: this.lockedUntil};
    }

    await this.save();
    return { remainingAttempts: this.remainingAttempts, lockedUntil: 0};
};

//might be used soon.
FailedAttempt.methods.resetAttempts = async function () {
    remainingAttempts = 0;
    this.lockedUntil = undefined;
    await this.save()
}
const failedAttempt = mongoose.model('FailedAttempt', FailedAttempt);

module.exports = failedAttempt;
