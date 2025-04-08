1/* 
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
       return await ipInstance.deductAttempts()
    }
    else{
        const newIpInstance = new FailedAttempts({
            ip: ip,
            remainingAttempts: 4, // Assuming 5 total attempts (5-1 = 4 remaining)
            totalFailedAttempts: 1,
            isLocked: false
        });
        await newIpInstance.save();
        //return newIpInstance.remainingAttempts;
        return { remainingAttempts: newIpInstance.remainingAttempts, lockedUntil: 0};
    }
}

// Function to handle user login and registration
router.post('/register', async (req, res, next) => {
    try {
        // Destructure form data
        const { 
            reg_firstName, 
            reg_middleName, 
            reg_lastName, 
            reg_suffix, 
            companyID, 
            password, 
            reg_confirm 
        } = req.body;

        // 1. Validate Required Fields
        const requiredFields = [reg_firstName, reg_lastName, companyID, password, reg_confirm];
        if (requiredFields.some(value => value === '' || value.trim() === '')) {
            return res.status(400).json({ message: 'Please fill out all the fields' });
        }

        // 2. Validate Company ID Length (must be exactly 10 characters)
        if (companyID.length !== 10) {
            return res.status(400).json({ message: 'Company ID must be exactly 10 characters long' });
        }

        // 3. Validate Company ID Range (no special characters or numbers other than digits)
        if (!/^\d{10}$/.test(companyID)) {
            return res.status(400).json({ message: 'Company ID must contain only digits' });
        }

        // 4. Check if Company ID Already Exists
        const companyIDExists = await User.findOne({ companyID: companyID });
        if (companyIDExists) {
            return res.status(400).json({ message: 'Company ID already exists' });
        }

        // 5. Validate Password Length (at least 8 characters, max 20 characters)
        if (password.length < 8 || password.length > 20) {
            return res.status(400).json({ message: 'Password must be between 8 and 20 characters long' });
        }

        // 6. Validate Password and Confirm Password Match
        if (password !== reg_confirm) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // 7. Validate Name Length (First and Last Name should be between 1 and 50 characters)
        if (reg_firstName.length < 1 || reg_firstName.length > 50) {
                return res.status(400).json({ message: 'First name must be between 1 and 50 characters long' });
        }
    
        if (reg_lastName.length < 1 || reg_lastName.length > 50) {
                return res.status(400).json({ message: 'Last name must be between 1 and 50 characters long' });
        }

        // If all validations pass, proceed with user creation
        const newUser = new User({
            firstName: reg_firstName,
            middleName: reg_middleName,
            lastName: reg_lastName,
            suffix: reg_suffix,
            companyID: companyID
        });

        User.register(newUser, password, async (err, user) => {
            try {
                if (err) {
                    console.error('Error registering user:', err);
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

                    res.redirect('/landing-page'); // Redirect after successful registration
                });
            } catch (catchErr) {
                console.error('Error in registration process:', catchErr);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});



//this only gets triggered when index.js does $("#login-form").submit();
router.post('/login', async (req, res, next) => {
    const { companyID, password } = req.body;
    const requiredFields = [companyID, password];
    const ip = req.ip;

    // 2.3.1: Reject if required fields are missing or empty
    if (requiredFields.some(value => value === '' || value.trim() === '')) {
        return res.status(400).json({ message: 'Please fill out all fields' });
    }

    // 2.3.2: Validate Company ID Length (e.g., exactly 10 characters)
    if (companyID.length !== 10) {
        return res.status(400).json({ message: 'Company ID must be 10 characters long' });
    }

    // 2.3.3: Validate Password Length (e.g., at least 8 characters)
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Check if the user exists based on the Company ID
    const user = await User.findOne({ companyID: companyID });

    if (!user) {
        return res.status(401).json({ message: 'Incorrect company ID or password' });
    }

    // Use the authenticate method from passport-local-mongoose to check if the password is correct
    user.authenticate(password, async (err, result) => {
        if (err) {
            console.error('Error checking if password is correct:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (result) {
            // Authentication succeeded, log the user in
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
});



router.get('/isCompanyID', async (req, res) => {
    try {
        const companyID = req.query.companyID;
        console.log('Received company ID:', companyID);
        const companyIDExists = await User.findOne({ companyID: companyID });
        //console.log('Company ID exists:', companyIDExists);
        if (companyIDExists) {
            res.status(200).json({ authenticated: true });
        } else {
            const ip = req.ip;
            const {remainingAttempts, lockedUntil} = await checkIpAttempts(ip)
            res.status(200).json({ authenticated: false, remainingAttempts: remainingAttempts, lockedUntil: lockedUntil});
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
                const {remainingAttempts, lockedUntil} = await checkIpAttempts(ip)
                res.status(200).json({ authenticated: false, remainingAttempts: remainingAttempts, lockedUntil: lockedUntil});
            }
        });
    } catch (error) {
        console.error('Error checking if user exists:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/checkIpLockout', async (req, res) => {
    const ip = req.ip
    const ipInstance = await FailedAttempts.findOne({ip: ip});
    if (!ipInstance) {
        return res.json({ isLocked: false });
    }
    const {isLocked, lockedUntil} = ipInstance.isLockedOut()
    return res.json({ isLocked: isLocked, lockedUntil: lockedUntil });
})

// Function to handle user logout
router.get('/logout', (req, res) => {   
    req.logout(() => {console.log('User logged out successfully!');});
    res.redirect('/');
});

module.exports = router;
