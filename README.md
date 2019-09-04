## Formalism

<img src="resources/img/plugin-hero.svg" width="100" />

Formalism is a set of form components that deliver an amazing user experience with styles that can be customised to make it your own.

This plugin provides a range of functions to help create the HTML markup required for Formalism. 

Formalism Craft creates the HTML and the styles are added from our separate npm package.

### Freeform integration

Formalism is **form agnostic** but if you'd like to integrate it with Freeform, please read the ****integration notes****.

## Usage

Once you've got Formalism setup, you can create a basic input component in Twig with the following function:

```twig
{{ craft.formalism.input({
    label: 'Full Name',
    name: 'fullName',
    isRequired: true,
}) }}
```

This markup will be generated:

```html
<div class="f-input f-input--outlined" data-field-container>
    <label class="f-input__inner" for="input150">
      <input class="f-input__field" type="text" id="input150" name="fullName" value="" required="required" data-field>
      <span class="f-input__label">
          <span class="f-input__label-text">Full Name</span>
      </span>
      <span class="f-input__indicator f-input__indicator--required" aria-hidden="true">*</span>
    </label>
</div>
```

After importing the input base and theme file:

```scss
@import 'formalism/input/base';
@import 'formalism/input/outlined';
```

There's plenty more field components like button, checkbox, checkboxGroup, date, file, input, radio, radioGroup, search, submit, switcher and textarea.

<!-- Take a look at the documentation for usage information. -->

## Features

- Less JavaScript, more CSS
- Custom theme friendly
- Zero dependencies
- Small file size
- Supports style scoping
- Honors the reduced motion system feature
- Removes off-brand \<input> autofill colors
- Removes mobile tap colors

## Requirements

This plugin requires Craft CMS 3.0.0-beta.23 or later.

## Installation

### Plugin installation

1. Open your terminal and go to your Craft project:

        cd /path/to/project

2. Then tell Composer to load the plugin:

        composer require simple-integrated-marketing/formalism-craft

3. In the Control Panel, go to Settings → Plugins and click the “Install” button for Formalism.

### Styles installation

1. To style the field components, install the npm package:

```shell
npm install formalism
```

1. Import the fields styles into your project. Here we're using the 'outlined' theme style for all of our fields.

Together these styles are only 5.66 kB (gzipped).

```scss
@import 'formalism/checkbox/base';
@import 'formalism/checkbox/outlined';

@import 'formalism/file/base';
@import 'formalism/file/outlined';

@import 'formalism/input/base';
@import 'formalism/input/outlined';

@import 'formalism/radio/base';
@import 'formalism/radio/outlined';

@import 'formalism/select/base';
@import 'formalism/select/outlined';

@import 'formalism/textarea/base';
@import 'formalism/textarea/outlined';

@import 'formalism/fieldset/base';
@import 'formalism/fieldset/outlined';

@import 'formalism/search/base';
@import 'formalism/search/outlined';
```

### Links and plugs

- [Swiff](https://github.com/simple-integrated-marketing/swiff) - A CLI app that makes working with a staging server easy-as-pie
- [Simple](https://simple.com.au/) - An Australian agency creating Craft websites
