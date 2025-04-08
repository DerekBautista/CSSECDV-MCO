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

//FIX THIS
// $("#passwordChangeSubmit").on("click", async function (event) {
//     event.preventDefault();

//     const securityAnswer1 = $("#security_answer_1");
//     const securityAnswer2 = $("#security_answer_2");
//     const newPassword = $("#acc-password");
//     const confirmPassowrd = $("#acc-confirm");
//     const currentPassword = $("#current-password");

//     let hasErrors = false;
// });