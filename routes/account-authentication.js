/* 
    acccount-authentication.js
    This file handles the registration and login of users.
*/

// Third party imports.
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const User = require('../server/schema/Users');
const FailedAttempts = require('../server/schema/FailedAttempts');
const passport = require('passport')


async function checkIpAttempts(ip){
    console.log("IP: " + ip)
    const ipInstance = await FailedAttempts.findOne({ip: ip});

    if (ipInstance){
        ipInstance.remainingAttempts -= 1
        ipInstance.totalFailedAttempts += 1
        if (ipInstance.remainingAttempts == 0){
                // Block for 1 minute (60,000 milliseconds)
                ipInstance.blockedUntil = new Date(Date.now() + 60 * 1000); 
                // 15 mins
                //ipInstance.blockedUntil = new Date(Date.now() + 15 * 60 * 1000);
            console.log(`Blocking IP ${ip} for too many failed attempts`);
        }
        await ipInstance.save();
        return ipInstance.remainingAttempts;
    }
    else{
        const newIpInstance = new FailedAttempts({
            ip: ip,
            remainingAttempts: 4, // Assuming 5 total attempts (5-1 = 4 remaining)
            totalFailedAttempts: 1,
        });
        await newIpInstance.save();
        return newIpInstance.remainingAttempts;
    }
}

// Function to handle user login and registration
router.post('/register', async (req, res, next) => {
    try {

        // Check what type of action the user is trying to do
        const { action } = req.body;
        console.log('Type of action:', action);

        // If the user is trying to register
        // Destructure form data
        const { 
            reg_firstName, 
            reg_middleName, 
            reg_lastName, 
            reg_suffix, 
            companyID, 
            password, 
            reg_confirm } = req.body


        // Validate form data
        const requiredFields = [reg_firstName, reg_lastName, companyID, password, reg_confirm];
        if (requiredFields.some(value => value === '' || value.trim() === '')) {
            return res.status(400).json({ message: 'Please fill out all fields' });
        }

        // Check if company ID is 10 characters long
        if (companyID.length !== 10) {
            return res.status(400).json({ message: 'Company ID must be 10 characters long' });
        }

        // Check if company ID already exists
        const companyIDExists = await User.findOne({ companyID: companyID });
        if (companyIDExists) {
            return res.status(400).json({ message: 'Company ID already exists' });
        }
 
        // Check if password is at least 8 characters long
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Check if password and confirm password match
        if (password !== reg_confirm) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Create a new user
        const newUser = new User({
            firstName: reg_firstName,
            middleName: reg_middleName,
            lastName: reg_lastName,
            suffix: reg_suffix,
            companyID: companyID,
            //password: password, // REMOVE IN FINAL BUILD BECAUSE OF PASSPORT
        });

        User.register(newUser, password, async (err, user) => {
            try {
                if (err) {
                    console.error('Error registering user:', err);
        
                    // Check if the error is due to duplicate key (e.g., duplicate companyID)
                    if (err.name === 'MongoError' && err.code === 11000) {
                        return res.status(400).json({ message: 'Company ID already exists' });
                    }
        
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
        
                // If registration is successful, log in the user
                req.login(user, (loginErr) => {
                    if (loginErr) {
                        console.error('Error during login after registration:', loginErr);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
        
                    res.redirect('/landing-page'); // Redirect to dashboard or any other page on successful registration
                });
            } catch (catchErr) {
                console.error('Error in registration process:', catchErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//this only gets triggered when index.js does $("#login-form").submit();
router.post('/login', async (req, res, next) => {
    const { companyID, password } = req.body;
    const requiredFields = [companyID, password];
    const ip = req.ip;

    // this is another wave of authentication, the 1st wave is on index.js event listener on login button
    if (requiredFields.some(value => value === '' || value.trim() === '')) {
        return res.status(400).json({ message: 'Please fill out all fields' });
    }

    const user = await User.findOne({ companyID: companyID });

    if (!user) {
        return res.status(401).json({ message: 'Incorrect company ID or password' });
    }

    // Use the authenticate method from passport-local-mongoose to check if the password is correct
    user.authenticate(password, (err, result) => {
        if (err) {
            console.error('Error checking if password is correct:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (result) {
            // Authentication succeeded
            req.logIn(user, (err) => {
                if (err) {
                    console.error('Error during login:', err);
                    return next(err);
                }
                console.log('Authentication succeeded');
                res.redirect('/landing-page');
            });
        } else {
            // Authentication failed
            return res.status(401).json({ message: 'Incorrect company ID or password' });
        }
    });
})


router.get('/isCompanyID', async (req, res) => {
    try {
        const companyID = req.query.companyID;
        console.log('Received company ID:', companyID);

        const companyIDExists = await User.findOne({ companyID: companyID });
        //console.log('Company ID exists:', companyIDExists);
        if (companyIDExists) {
            res.status(200).json({ exists: true });
        } else {
            const ip = req.ip;
            const remainingAttempts = await checkIpAttempts(ip)
            res.status(200).json({ authenticated: false, remainingAttempts: remainingAttempts});
        }
    } catch (error) {
        console.error('Error checking if company ID exists:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/isPassword', async (req, res) => {
    try {
        // Get the company ID and password from the request body
        const companyID = req.query.companyID;
        const password = req.query.password;

        // Find the user with the company ID
        const user = await User.findOne({ companyID: companyID });

        // Use the authenticate method from passport-local-mongoose to check if the password is correct
        user.authenticate(password, async (err, result) => {
            if (err) {
                console.error('Error checking if password is correct:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            if (result) {
                res.status(200).json({ authenticated: true});
            } else {
                const ip = req.ip;
                const remainingAttempts = await checkIpAttempts(ip)
                res.status(200).json({ authenticated: false, remainingAttempts: remainingAttempts});
            }
        });
    } catch (error) {
        console.error('Error checking if user exists:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



// Function to handle user logout
router.get('/logout', (req, res) => {   
    req.logout(() => {console.log('User logged out successfully!');});
    res.redirect('/');
});

module.exports = router;
