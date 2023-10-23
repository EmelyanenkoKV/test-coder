const slides = document.querySelectorAll('.reg-form__slide');
const dots = document.querySelectorAll('.controls__dot');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
let currentStepId = "step-profession";
let currentIndex = 0;
let formData = {};
const professionDropdown = document.querySelector('#step-profession .select__dropdown');
const ageDropdown = document.querySelector('#step-age .select__dropdown');

professionDropdown.addEventListener('click', () => {
    formData.profession = getSelectedValue('step-profession');
});

ageDropdown.addEventListener('click', () => {
    formData.age = getSelectedValue('step-age');
});

const form = document.querySelector('.reg-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
});

function getSlideElement(stepId) {
    return document.getElementById(stepId) || null;
}

function getSelectedValue(stepId) {
    const slide = getSlideElement(stepId);
    const dropdown = slide?.querySelector('.select__dropdown');
    const selectedOption = dropdown?.querySelector('.select__item.selected');

    if (selectedOption) {
        const selectedText = selectedOption.textContent;
        return selectedText.trim();
    }

    return null;
}

function validateStep(stepId) {
    const slide = getSlideElement(stepId);
    const selectError = slide?.querySelector('.select__error');
    const selectErrorWrap = slide?.querySelector('.select__error-wrap');

    if (!slide || !selectError || !selectErrorWrap) return false;

    let isValid = false;

    switch (stepId) {
        case "step-profession":
        case "step-age":
            const selectedValueFromFunction = getSelectedValue(stepId);
            const fieldName = stepId.replace("step-", "");
            const hiddenInput = slide.querySelector(`#${fieldName}Input`);

            isValid = hiddenInput
                ? (selectedValueFromFunction
                    ? (hiddenInput.value = selectedValueFromFunction, selectError.textContent = '', selectErrorWrap.style.display = 'none', true)
                    : (selectError.textContent = 'Please select an option', selectErrorWrap.style.display = 'block', false))
                : false;
            break;

        case "step-location":
            const addressInput = slide.querySelector('.select__header-input');
            const addressValue = addressInput.value.trim();

            if (!addressValue) {
                selectError.textContent = 'Please enter your address';
                selectErrorWrap.style.display = 'block';
            } else {
                const addressRegex = /^[A-Za-z0-9, ]+$/;
                isValid = addressRegex.test(addressValue)
                    ? (clearErrors(stepId), true)
                    : (selectError.textContent = 'Please enter a valid address', selectErrorWrap.style.display = 'block', false);
            }
            break;

        case "step-email":
            const emailInput = slide.querySelector('.select__header-input');
            const emailValue = emailInput.value.trim();
            selectError.textContent = '';

            if (!emailValue) {
                selectError.textContent = 'Please enter your email';
                selectErrorWrap.style.display = 'block';
            } else {
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                isValid = emailRegex.test(emailValue)
                    ? (selectError.textContent = '', selectErrorWrap.style.display = 'none', true)
                    : (selectError.textContent = 'Please enter a valid email address', selectErrorWrap.style.display = 'block', false);
            }
            break;

        case "step-password":
            const passwordInput = slide.querySelector('.select__header-input');
            const passwordValue = passwordInput.value;

            let lengthError = '';

            if (passwordValue.length < 8) {
                const lengthError = 'Password must be at least 8 characters long';
                selectError.textContent = lengthError;
                selectErrorWrap.style.display = 'block';
                return false;
            }

            clearErrors(stepId);
            isValid = true;
            break;
    }

    if (isValid) {
        selectError.textContent = '';
        selectErrorWrap.style.display = 'none';
        clearErrors(stepId);
    }

    return isValid;
}

// Saving data in localStorage and getting data from localStorage
function saveFormDataToLocalStorage(stepId, formData) {
    localStorage.setItem(stepId, JSON.stringify(formData));
}

function getFormDataFromLocalStorage(stepId) {
    const data = localStorage.getItem(stepId);
    return data ? JSON.parse(data) : null;
}

function showStep(stepId) {
    const stepIndex = Array.from(slides).findIndex(slide => slide.id === stepId);
    if (stepIndex === -1) {
        return;
    }

    // Loading data from localStorage

    const formData = getFormDataFromLocalStorage(stepId);

    if (formData) {

        // Filling out the form with data from localStorage

        const slide = getSlideElement(stepId);
        const inputs = slide.querySelectorAll('.select__header-input');
        inputs.forEach(input => {
            const fieldName = input.name;
            input.value = formData[fieldName];
        });
    }

    currentStepId = stepId;
    currentIndex = stepIndex;

    slides.forEach((slide, index) => {
        slide.classList.remove('reg-form__slider-active');
    });

    slides[stepIndex].classList.add('reg-form__slider-active');
    dots[stepIndex].classList.add('controls__dot--active');
    document.querySelector('.reg-form__slider-container').style.transform = `translateX(-${stepIndex * 100}%)`;

    prevButton.disabled = stepIndex === 0;
    prevButton.classList.toggle('disabled-button', prevButton.disabled);
}

prevButton.addEventListener('click', () => {
    const currentIndex = Array.from(slides).findIndex(slide => slide.id === currentStepId);
    if (currentIndex > 0) {
        showStep(slides[currentIndex - 1].id);
        nextButton.classList.remove('disabled-button');
        dots[currentIndex].classList.remove('controls__dot--active');
    }
});

function clearErrors(stepId) {
    const slide = getSlideElement(stepId);
    const selectError = slide?.querySelector('.select__error');
    const selectErrorWrap = slide?.querySelector('.select__error-wrap');

    if (selectError && selectErrorWrap) {
        selectError.textContent = '';
        selectErrorWrap.style.display = 'none';
    }
}

let isRequestInProgress = false;

nextButton.addEventListener('click', () => {
    const currentIndex = Array.from(slides).findIndex(slide => slide.id === currentStepId);
    const isValid = validateStep(currentStepId);

    if (isValid) {

        // Get data from the current step and save it in formData

        const slide = getSlideElement(currentStepId);
        const inputs = slide.querySelectorAll('.select__header-input');
        inputs.forEach(input => {
            const fieldName = input.name;
            formData[fieldName] = input.value;
        });

        // Print data to console

        console.log(formData);

        sendRequestToServer(currentStepId)
            .then(responseData => {
                handleResponseFromServer(responseData);

                if (responseData.status === 'success') {
                    clearErrors(currentStepId);
                    if (currentIndex < slides.length - 1) {
                        showStep(slides[currentIndex + 1].id);
                    }
                }
            })
            .catch(error => {
                if (error && error.errors) {
                    error.errors.forEach(err => {
                        const fieldName = err.name;
                        const errorMessage = err.message;
                        const errorElement = getSlideElement(`step-${fieldName}`)?.querySelector('.select__error');
                        errorElement.textContent = errorMessage;
                        const selectErrorWrap = getSlideElement(`step-${fieldName}`)?.querySelector('.select__error-wrap');
                        selectErrorWrap.style.display = 'block';
                    });
                } else {
                    const selectError = getSlideElement(currentStepId)?.querySelector('.select__error');
                    selectError.textContent = 'Error sending request: ' + JSON.stringify(error);
                    const selectErrorWrap = getSlideElement(currentStepId)?.querySelector('.select__error-wrap');
                    selectErrorWrap.style.display = 'block';
                }
            });
    }
});

function updateProgressDots() {
    for (let i = 0; i <= currentIndex; i++) {
        dots[i].classList.add('controls__dot--active');
    }
}

function sendRequestToServer(stepId) {
    clearErrors(stepId);
    const dataForServer = {status: getSelectedValue(stepId)};

    // showing a simulation of sending to the server

    console.log(`Sending request for step: ${stepId}`);

    return new Promise((resolve, reject) => {

        // Emulate a successful request

        resolve({
            status: 'success'
        });

        // Emulating a server error

        // setTimeout(() => {
        //     reject({
        //         status: 'server_error'
        //     });
        // }, 2000);

        // Emulating a request with an error

        // setTimeout(() => {
        //     reject({
        //         status: 'error',
        //         errors: [
        //             {
        //                 name: "profession",
        //                 message: "Please select your profession"
        //             },
        //             {
        //                 name: "age",
        //                 message: "Please select your age"
        //             },
        //             {
        //                 name: "email",
        //                 message: "Please enter a valid email address"
        //             },
        //             {
        //                 name: "password",
        //                 message: "Please enter a password to secure your account"
        //             },
        //             {
        //                 name: "location",
        //                 message: "Enter your postal code to find local matches"
        //             }
        //         ]
        //     });
        // }, 2000);
    });
}

function showThankYouMessage() {
    alert('Registration is completed! Thank you!');
    nextButton.disabled = true;
}

function handleResponseFromServer(responseData) {
    const handlers = {
        'error': handleServerError,
        'success': handleSuccess,
        'server_error': handleServerUnavailable,
    };

    if (handlers[responseData.status]) {
        handlers[responseData.status]();
    }
}

function handleServerError() {
    responseData.errors.forEach(error => {
        const fieldName = error.name;
        const errorMessage = error.message;
        const errorElement = getSlideElement(`step-${fieldName}`)?.querySelector('.select__error');
        errorElement.textContent = errorMessage;
        const selectErrorWrap = getSlideElement(`step-${fieldName}`)?.querySelector('.select__error-wrap');
        selectErrorWrap.style.display = 'block';
    })
}

function handleSuccess() {
    const currentIndex = Array.from(slides).findIndex(slide => slide.id === currentStepId);
    if (currentIndex < slides.length - 1) {
        showStep(slides[currentIndex + 1].id);
    } else {
        nextButton.classList.add('controls__next--start');
        nextButton.disabled = true;
        setTimeout(() => showThankYouMessage(), 100);
    }
}

function handleServerUnavailable() {
    const selectError = getSlideElement(currentStepId)?.querySelector('.select__error');
    selectError.textContent = 'Server is currently unavailable. Please try again later.';
    const selectErrorWrap = getSlideElement(currentStepId)?.querySelector('.select__error-wrap');
    selectErrorWrap.style.display = 'block';
}

showStep(currentStepId);
updateProgressDots();