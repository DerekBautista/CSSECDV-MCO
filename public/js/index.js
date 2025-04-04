/* Login Form */
// Show/hide password
$("#login-show-hide-password").on('click', function() {
    if ($("#login-password").attr('type') === 'password') {
        $("#login-password").attr('type', 'text');
        // Change the icon to show the eye opened
        $("#login-show-hide-password").html('<i class="fas fa-eye"></i>');
    } else {
        $("#login-password").attr('type', 'password');
        // Change the icon to show the eye closed
        $("#login-show-hide-password").html('<i class="fas fa-eye-slash"></i>');
    }
});


$("#login-submit-btn").on('click', async function (event) {
    event.preventDefault();

    const companyID = $("#login-companyID").val();
    const loginPassword = $("#login-password").val();

    // Define an object to map field IDs to error message IDs
    const fieldErrorMap = {
        'login-companyID': 'login-companyID-message',
        'login-password': 'login-password-message'
    };

    // Iterate through each field and check if it's empty
    let hasErrors = false;
    for (const [field, errorMessage] of Object.entries(fieldErrorMap)) {
        const value = $(`#${field}`).val();
        if (value === '') {
            $(`#${errorMessage}`).html('Please fill out this field.').css('display', 'block');
            hasErrors = true;
        } else {
            $(`#${errorMessage}`).css('display', 'none');
        }
    }

    // Check if there are errors before making the fetch request
    if (hasErrors) {
        return;
    }

    // Check if the company ID exists
    try{
        const companyIDResponse = await fetch(`/user/isCompanyID?companyID=${companyID}`, {
            method: 'GET'
        });

        const data = await companyIDResponse.json();

        if (!data.exists) {
            // Show error if company doesn't exist
            $("#login-error-message").html('Failed Login.').css('display', 'block').css('display', 'block');;
            return;
        }
        else{
            // Check if the password is correct
            const passwordResponse = await fetch(`/user/isPassword?companyID=${companyID}&password=${loginPassword}`, {
                method: 'GET'
            });
            const passwordData = await passwordResponse.json()
            if(!passwordData.authenticated){
                $("#login-error-message").html('Failed Login.').css('display', 'block');
            }
            else{
                $("#login-form").submit();
            }
        }
    } catch (err) {
        console.log("Network error (e.g., server down):", err);
    }
});




/* Register Form */
// Show/hide password
$("#register-show-hide-password").on('click', function() {
    if ($("#register-password").attr('type') === 'password') {
        $("#register-password").attr('type', 'text');
        // Change the icon to show the eye opened
        $("#register-show-hide-password").html('<i class="fas fa-eye"></i>');
    } else {
        $("#register-password").attr('type', 'password');
        // Change the icon to show the eye closed
        $("#register-show-hide-password").html('<i class="fas fa-eye-slash"></i>');
    }
});

$("#register-confirm-show-hide-password").on('click', function() {
    if ($("#register-confirmPassword").attr('type') === 'password') {
        $("#register-confirmPassword").attr('type', 'text');
        // Change the icon to show the eye opened
        $("#register-confirm-show-hide-password").html('<i class="fas fa-eye"></i>');
    } else {
        $("#register-confirmPassword").attr('type', 'password');
        // Change the icon to show the eye closed
        $("#register-confirm-show-hide-password").html('<i class="fas fa-eye-slash"></i>');
    }
});


$("#register-submit-btn").on('click', async function (event) {
    event.preventDefault();

    const companyID = $("#register-companyID").val();
    const registerPassword = $("#register-password").val();
    const registerConfirmPassword = $("#register-confirmPassword").val();

    // Define an object to map field IDs to error message IDs
    const fieldErrorMap = {
        'register-firstName': 'register-firstName-message',
        'register-lastName': 'register-lastName-message',
        'register-companyID': 'register-companyID-message',
        'register-password': 'register-password-message',
        'register-confirmPassword': 'register-confirmPassword-message'
    };

    // Iterate through each field and check if it's empty
    let hasErrors = false;
    for (const [field, errorMessage] of Object.entries(fieldErrorMap)) {
        const value = $(`#${field}`).val();
        if (value === '') {
            $(`#${errorMessage}`).html('Please fill out this field.').css('display', 'block');
            hasErrors = true;
        } else if (field === 'register-companyID' && value.length !== 10) {
            $(`#${errorMessage}`).html('Company ID must be 10 characters long.').css('display', 'block');
            hasErrors = true; 
        } else if (field === 'register-password' && value.length < 8) {
            $(`#${errorMessage}`).html('Password must be at least 8 characters long.').css('display', 'block');
            hasErrors = true;
        } else if (field === 'register-confirmPassword' && value.length > 8 && value !== registerConfirmPassword) {
            $(`#${errorMessage}`).html('Passwords do not match.').css('display', 'block');
            hasErrors = true;
        } else {
            $(`#${errorMessage}`).css('display', 'none');
        }
    }

    // Check if there are errors before making the fetch request
    if (hasErrors) {
        return;
    }

    const companyIDResponse = await fetch(`/register/isCompanyID?companyID=${companyID}`, {
        method: 'GET'
    });

    switch (companyIDResponse.status) {
        case 200:
            $("#register-companyID-message").text('Company ID already exists.').css('display', 'block');
            break;
        case 404:
            $("#register-form").submit();
            break;
        default:
            console.log('Error');
    }
});
