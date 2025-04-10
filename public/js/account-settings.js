
// Function for toggle the password visibility
function togglePasswordVisibility(passwordField, iconElement) {
    if (passwordField.attr('type') === 'password') {
        passwordField.attr('type', 'text');
        // Change the icon to show the eye opened
        iconElement.html('<i class="fas fa-eye"></i>');
    } else {
        passwordField.attr('type', 'password');
        // Change the icon to show the eye closed
        iconElement.html('<i class="fas fa-eye-slash"></i>');
    }
}


$("#acc-show-hide-password").on('click', function() {
    togglePasswordVisibility($("#acc-password"), $("#acc-show-hide-password"));
});

$("#acc-confirm-show-hide-password").on('click', function() {
    togglePasswordVisibility($("#acc-confirm-password"), $("#acc-confirm-show-hide-password"));
});

$("#current-show-hide-password").on('click', function() {
    togglePasswordVisibility($("#current-password"), $("#current-show-hide-password"));
});



function previewImage(imageUpload, imagePreview) {
    const file = imageUpload.files[0];

    if (file) {
        const reader = new FileReader();

        reader.addEventListener('load', function() {
            imagePreview.style.display = 'block';
            imagePreview.setAttribute('src', this.result);
        });

        reader.onerror = function() {
            console.error('Error reading file: ', reader.error);
        };

        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = null;
        imagePreview.setAttribute('src', '');
    }
}

// Temprarily displayed the uploaded image
$("#image-upload").on('change', function() {

    const imagePreview = document.getElementById('image-preview');

    previewImage(this, imagePreview);

});



$("#passwordChangeSubmit").on("click", async function (event) {
    event.preventDefault();

    const securityAnswer1 = $("#security_answer_1").val();
    const securityAnswer2 = $("#security_answer_2").val();
    const newPassword = $("#acc-password").val();
    const confirmPassword = $("#acc-confirm-password").val();
    const currentPassword = $("#current-password").val();
    const companyID = $("#acc_companyID").val();
    const secuConfirm1 = $("#securityAnswer1Hidden").val().trim();
    const secuConfirm2 = $("#securityAnswer2Hidden").val().trim();

    console.log(securityAnswer1, securityAnswer2);
    console.log(secuConfirm1, secuConfirm2);

// Define an object to map field IDs to error message IDs
const fieldErrorMap = {
    'securityAnswer1': 'securityAnswer1-message',
    'securityAnswer2': 'securityAnswer2-message',
    'newPassword': 'newPassword-message',
    'confirmPassword': 'confirmPassword-message',
    'currentPassword': 'currentPassword-message'
};


// const companyIDResponse = await fetch(`/user/isCompanyID?companyID=${companyID}`, {
//     method: 'GET'
// });

// const companyIdData = await companyIDResponse.json();



// const passwordResponse = await fetch(`/user/isPassword?companyID=${companyID}&password=${currentPassword}`, {
//     method: 'GET'
// });

// const passwordData = await passwordResponse.json();


let hasErrors = false;
    for (const [field, errorMessage] of Object.entries(fieldErrorMap)) {
        const value = $(`#${field}`).val();
        if (value === '') {
            $(`#${errorMessage}`).html('Please fill out this field.').css('display', 'block');
            hasErrors = true;
        } else if (field === 'securityAnswer1' && securityAnswer1 !== secuConfirm1) {
            $(`#${errorMessage}`).html('Incorrect answer for security question.').css('display', 'block');
            hasErrors = true; 
        } else if (field === 'securityAnswer2' && securityAnswer2 !== secuConfirm2) {
            $(`#${errorMessage}`).html('Incorrect answer for security question.').css('display', 'block');
            hasErrors = true;
        } else if (field === 'newPassword' && newPassword.length < 8) {
            $(`#${errorMessage}`).html('Password must be at least 8 characters long.').css('display', 'block');
            hasErrors = true;
        } else if (field === 'confirmPassword' && confirmPassword !== newPassword) {
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
    else {
        const passwordCheckRes = await fetch('/account-settings/passwordchange', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ csecurity_answer_1:securityAnswer1,
                security_answer_2: securityAnswer2,
                password: newPassword,
                acc_confirm: confirmPassword,
                current_password: currentPassword })
        });

        console.log(passwordCheckRes.status);

        const message = await passwordCheckRes.json();

        console.log(message);
        console.log(message.message);

        switch(passwordCheckRes.status)
        {
            case 200:
                console.log("switch: ", message.message);
                window.alert("Successfully changed password");
                location.reload();
            break;
            case 401:
                console.log("switch: ", message.message);
                $('#currentPassword-message').html(message.message).css('display', 'block');
            break;
            case 400:
                console.log("switch: ", message.message);
                $('#currentPassword-message').html(message.message).css('display', 'block');
            break;
            case 500:
                console.log("switch: ", message.message);
                $('#currentPassword-message').html(message.message).css('display', 'block');
            break;
        }
    }
    
});