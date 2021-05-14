/*
    Freeform ↔ Formalism Integration
    See 'src/templates/freeform-example.twig' for integration example.

    This takes over AJAX functions to add markup that works with Formalism.
    It also adds a "submitting" state to give better feedback to the user.
*/

if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
    Element.prototype.closest = s => {
        var el = this;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}

const removeNode = (parentNode, selector) => {
    const node = parentNode.querySelector(selector);
    if (node && node.parentNode) {
        node.parentNode.removeChild(node);
    }
};

const SELECTOR = {
    FORM_INNER: '[data-form-inner]',
    ERROR_NOTE: '[data-form-error-note]',
    FIELD_CONTAINER: '[data-field-container]',
    FIELD_ERROR: '[data-field-error]',
    FIELD: '[data-field]',
};

// Add the success message to the top of the form
const callbackRenderSuccess = form => {
    const successTemplate =
        window[form.id.replace('-', '')].successTemplate ||
        'Your form was submitted';
    form.insertAdjacentHTML('beforebegin', successTemplate);
    // Remove the form
    removeNode(form.parentNode, 'form');
    // Remove the note
    changeSubmitState(form, false);
};

// Add the error message to the top of the form
const callbackRenderFormErrors = (errors, form) => {
    removeNode(form, SELECTOR.ERROR_NOTE);
    const errorTemplate = window[form.id.replace('-', '')].errorTemplate || '';
    form.querySelector(SELECTOR.FORM_INNER).insertAdjacentHTML(
        'afterbegin',
        errorTemplate
    );
};

const callbackRemoveMessages = form => {
    removeNode(form, SELECTOR.ERROR_NOTE);
    const fieldErrors = form.querySelectorAll(SELECTOR.FIELD_ERROR);
    Array.from(fieldErrors).forEach(fieldError => {
        clearFieldError(fieldError);
    });
};

const changeSubmitState = (form, addState = true) => {
    addState && form.classList.add('is-submitting');
    !addState && form.classList.remove('is-submitting');
    const submitButton = form.querySelector('button[type=submit]');
    if (submitButton) {
        addState && submitButton.setAttribute('disabled', addState);
        !addState && submitButton.removeAttribute('disabled');
    }
    // Submitting notice (optional)
    const submittingNote = document.querySelector(`#submitting-${form.id}`);
    if (submittingNote) {
        addState && submittingNote.removeAttribute('hidden');
        !addState && submittingNote.setAttribute('hidden', '');
        submittingNote.scrollIntoView();
    }
};

const clearFieldError = field => {
    const container = getContainer(field);
    container.classList.remove('has-error');
    const errorMessage = container.querySelector(SELECTOR.FIELD_ERROR);
    if (!errorMessage) return;
    if (errorMessage.parentNode)
        errorMessage.parentNode.removeChild(errorMessage);
    return;
};

const getContainer = field => {
    // Get parent container
    let container = field.closest(SELECTOR.FIELD_CONTAINER);
    // Check if container is part of a fieldset
    const isFieldset = container.hasAttribute('data-field-fieldgroup');
    // Select the parent fieldset if field
    if (isFieldset) {
        container = container.parentNode.closest(SELECTOR.FIELD_CONTAINER);
    }
    if (!container) return console.warn(`No container found for ${fieldName}`);
    return container;
};

// Add the error messages to each field
const callbackRenderFieldErrors = (errors, form) => {
    if (errors.length === 0) return;
    Object.keys(errors).forEach((fieldName, index) => {
        // Add the errors to each error field
        const errorList = errors[fieldName];
        const allFieldMatches = form.querySelectorAll(
            `[name="${fieldName}"], [name="${fieldName}[]"]`
        );
        if (!allFieldMatches.length === 0)
            return console.warn(`No field found for ${fieldName}`);
        const field = allFieldMatches[0];
        // Get parent container
        const container = getContainer(field);
        // Get the component name from its classname
        const componentName = container.classList && container.classList[0];
        // Build the error template
        const errorTemplate = `
            <div class="${componentName}__message ${componentName}__message--error" data-field-error>
                ${errorList.join('<br/>')}
            </div>
        `;
        // Get the anchorpoint by returning the first item found
        const anchorPoint = container.querySelector(
            '[data-field-inner], [data-field-legend]'
        );
        if (!anchorPoint) return console.warn(`No anchorpoint found`);
        // Add the error template after the anchor point
        anchorPoint.insertAdjacentHTML('afterend', errorTemplate);
        // Add error class to container so it receives styles
        container.classList.add('has-error');
        // Add a listener on blur to run a callback
        Array.from(allFieldMatches).map(item => {
            addBlurListener(item, clearFieldError);
        });
        // Scroll the first field into view
        if (index === 0) field.scrollIntoView();
    });
};

const addBlurListener = (target, cb) => {
    if (!target) return;
    // Remove any existing listeners
    target.removeEventListener('blur', ({ target }) => cb(target));
    // Add the listener
    target.addEventListener('blur', ({ target }) => cb(target));
};

// Run clearFieldError when an errored field is blurred
// Only works for non-AJAX forms
const addFieldErrorBlurListeners = form => {
    const errors = form.querySelectorAll('.has-error');
    if (!errors) return;
    Array.from(errors).forEach(error => {
        const allFieldMatches = error.querySelectorAll(SELECTOR.FIELD);
        if (!allFieldMatches.length === 0)
            return console.warn(`No field found for ${fieldName}`);
        // Add a listener on blur to run a callback
        Array.from(allFieldMatches).map(item => {
            addBlurListener(item, clearFieldError);
        });
    });
};

// Freeform callbacks
// https://docs.solspace.com/craft/freeform/v3/developer/js-plugin.html
const init = () => {
    const forms = document.querySelectorAll('form[data-freeform]');
    if (!forms) return;

    Array.from(forms).forEach(form => {
        form.addEventListener('freeform-ready', event => {
            const freeform = event.target.freeform;

            form.addEventListener("freeform-on-submit", function(event) {
                changeSubmitState(form, true);
                return true;
            });
            form.addEventListener("freeform-ajax-before-submit", function(event) {
                changeSubmitState(form, true);
                return true;
            });

            document.addEventListener("freeform-render-success", function (event) {
                event.preventDefault();
                callbackRenderSuccess(form);
            });

            document.addEventListener("freeform-remove-messages", function (event) {
                event.preventDefault();
                callbackRemoveMessages(form);
            });

            document.addEventListener("freeform-render-form-errors", function (event) {
                event.preventDefault();
                const errors = event.errors;
                callbackRenderFormErrors(errors, form);
                setTimeout(changeSubmitState(form, false), 2000);
            });

            document.addEventListener("freeform-render-field-errors", function (event) {
                event.preventDefault();
                const errors = event.errors;
                callbackRenderFieldErrors(errors, form);
            });

        });
    });
};

init();
