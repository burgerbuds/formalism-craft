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
    FIELD_CONTAINER: '[data-container]',
    FIELD_ERROR: '[data-field-error]',
    FIELD: '[data-field]',
};

// Add the success message to the top of the form
window.renderFormSuccess = form => {
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
window.renderFormErrors = (errors, form) => {
    removeNode(form, SELECTOR.ERROR_NOTE);
    const errorTemplate = window[form.id.replace('-', '')].errorTemplate || '';
    form.querySelector(SELECTOR.FORM_INNER).insertAdjacentHTML(
        'afterbegin',
        errorTemplate
    );
};

const removeExistingErrors = form => {
    removeNode(form, SELECTOR.ERROR_NOTE);
    const fieldErrors = form.querySelectorAll(SELECTOR.FIELD_ERROR);
    Array.from(fieldErrors).forEach(fieldError => {
        clearFieldError(fieldError);
    });
};

const changeSubmitState = (form, addState = true) => {
    // Form
    addState && form.classList.add('is-submitting');
    !addState && form.classList.remove('is-submitting');
    const submitButton = form.querySelector('button[type=submit]');
    submitButton && submitButton.setAttribute('disabled', addState);
    // Submitting notice (optional)
    const submittingNote = document.querySelector(`#submitting-${form.id}`);
    if (submittingNote) {
        addState && submittingNote.removeAttribute('hidden');
        !addState && submittingNote.setAttribute('hidden', '');
        submittingNote.scrollIntoView();
    }
};

const clearFieldError = field => {
    // TODO: Extended validation for field types
    const container = field.closest(SELECTOR.FIELD_CONTAINER);
    container.classList.remove('has-error');
    const errorMessage = container.querySelector(SELECTOR.FIELD_ERROR);
    if (!errorMessage) return;
    if (errorMessage.parentNode)
        errorMessage.parentNode.removeChild(errorMessage);
    return;
};

// Add the error messages to each field
window.renderErrors = (errors, form) => {
    // Reset the form errors
    removeExistingErrors(form);
    changeSubmitState(form, false);
    if (errors.length === 0) return;

    Object.keys(errors).forEach((fieldName, index) => {
        // Add the errors to each error field
        const errorList = errors[fieldName];
        const field = form.querySelector(
            `[name="${fieldName}"], [name="${fieldName}[]`
        );
        if (!field) return console.warn(`No field found for ${fieldName}`);
        // Get parent container
        const container = field.closest(SELECTOR.FIELD_CONTAINER);
        if (!container)
            return console.warn(`No container found for ${fieldName}`);
        // Get the component name from its classname
        const componentName = container.classList && container.classList[0];
        // Build the error template
        const errorTemplate = `
            <div class="${componentName}__message ${componentName}__message--error" data-field-error>
                ${errorList.join('<br/>')}
            </div>
        `;
        // Query an element within the container
        const containerQuerySelector = selector => {
            const el = container.querySelector(selector);
            if (!el) return console.warn(`No el found for ${selector}`);
            return el;
        };
        // Treat errors in fieldsets a little differently
        const isFieldset = componentName === 'f-fieldset';
        const anchorPoint = containerQuerySelector(
            isFieldset ? '[data-field-legend]' : '[data-field-inner]'
        );
        // Add the error template after the anchor point
        anchorPoint.insertAdjacentHTML('afterend', errorTemplate);
        // Add error class to container so it receives styles
        container.classList.add('has-error');
        // Add a listener on blur to run a callback
        blurListener(field, true, clearFieldError);
        // Scroll the first field into view
        if (index === 0) field.scrollIntoView();
    });
};

const blurListener = (target, addListener = true, cb) => {
    if (addListener) {
        target.addEventListener('blur', event => {
            cb(event.target);
        });
    } else {
        target.removeEventListener('blur', event => {
            cb(event.target);
        });
    }
};

const addSubmitListeners = form => {
    if (!form) return;
    form.addEventListener('submit', () => {
        removeExistingErrors(form);
        changeSubmitState(form, true);
        return;
    });
};

// Run clearFieldError when an errored field is blurred
const addFieldBlurListeners = form => {
    const errors = form.querySelectorAll('.has-error');
    if (!errors) return;
    Array.from(errors).forEach(error => {
        const field = error.querySelector(SELECTOR.FIELD);
        if (!field)
            return console.warn(`Formalism: Field not found within component`);
        blurListener(field, true, clearFieldError);
    });
};

const addListeners = () => {
    const forms = document.querySelectorAll('form');
    if (!forms) return;
    Array.from(forms).forEach(form => {
        addSubmitListeners(form);
        addFieldBlurListeners(form);
    });
};

window.addEventListener(
    'DOMContentLoaded',
    () => {
        addListeners();
    },
    false
);
