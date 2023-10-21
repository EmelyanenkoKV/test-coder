const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const emailError = document.getElementById("email-error");

loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!validateEmail(emailInput.value)) {
        emailError.style.display = "block";
    } else {
        emailError.style.display = "none";
    }
});

function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailPattern.test(email);
}