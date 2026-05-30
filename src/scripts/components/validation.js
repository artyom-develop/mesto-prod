const hasInvalidInput = (inputElements) => inputElements.some((inputElement) => !inputElement.validity.valid);

const getValidationMessage = (inputElement, config) => {
  if (inputElement.validity.patternMismatch) {
    return inputElement.title || config.patternMismatchMessage || inputElement.validationMessage;
  }

  return inputElement.validationMessage;
};

const showInputError = (formElement, inputElement, config) => {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);

  inputElement.classList.add(config.inputErrorClass);
  errorElement.textContent = getValidationMessage(inputElement, config);
  errorElement.classList.add(config.errorClass);
};

const hideInputError = (formElement, inputElement, config) => {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);

  inputElement.classList.remove(config.inputErrorClass);
  errorElement.textContent = "";
  errorElement.classList.remove(config.errorClass);
};

const checkInputValidity = (formElement, inputElement, config) => {
  if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, config);
    return;
  }

  hideInputError(formElement, inputElement, config);
};

const toggleButtonState = (inputElements, buttonElement, config) => {
  const shouldDisableButton = hasInvalidInput(inputElements);

  buttonElement.disabled = shouldDisableButton;
  buttonElement.classList.toggle(config.inactiveButtonClass, shouldDisableButton);
};

const setEventListeners = (formElement, config) => {
  const inputElements = [...formElement.querySelectorAll(config.inputSelector)];
  const buttonElement = formElement.querySelector(config.submitButtonSelector);

  if (!buttonElement || inputElements.length === 0) {
    return;
  }

  toggleButtonState(inputElements, buttonElement, config);

  inputElements.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, config);
      toggleButtonState(inputElements, buttonElement, config);
    });
  });
};

export const enableValidation = (config) => {
  const formElements = [...document.querySelectorAll(config.formSelector)];

  formElements.forEach((formElement) => {
    setEventListeners(formElement, config);
  });
};

export const clearValidation = (formElement, config) => {
  const inputElements = [...formElement.querySelectorAll(config.inputSelector)];
  const buttonElement = formElement.querySelector(config.submitButtonSelector);

  inputElements.forEach((inputElement) => {
    hideInputError(formElement, inputElement, config);
  });

  if (buttonElement) {
    toggleButtonState(inputElements, buttonElement, config);
  }
};