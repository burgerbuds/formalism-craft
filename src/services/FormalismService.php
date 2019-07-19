<?php
/**
 * Formalism plugin for Craft CMS 3.x
 *
 * @link      https://simple.com.au
 * @copyright Copyright (c) 2019 Simple Integrated Marketing
 */

namespace simple\formalism\services;

use simple\formalism\formalism;

use Craft;
use craft\base\Component;
use craft\helpers\Template;
use craft\web\View;

use yii\base\Exception;

/**
 * @author    Simple
 * @package   Formalism
 * @since     1.0.0
 */
class FormalismService extends Component
{
    /**
     * Gets a custom field component and sends the variables passed to it
     *
     * @param string $componentName
     * @param array $params
     * @return void
     */
    public function getCustomComponent(string $componentName, array $params = [], $paramsMerge = [])
    {
        $fileName = "{$componentName}.twig";

        $filePath = $this->pathCombine(Craft::parseEnv(Formalism::$plugin->settings->pathComponent), $fileName);

        if (!Craft::$app->view->doesTemplateExist($filePath)) {
            $path = Craft::parseEnv(Formalism::$plugin->settings->pathComponent);
            throw new Exception("🧐 Your \"{$componentName}\" component wasn't found.\n\n🚧 Add your custom component here:\n{$filePath}");
        }

        $content = Craft::$app->view->renderTemplate($filePath, [
            'params' => array_replace_recursive($params, $paramsMerge)
        ]);

        return Template::raw($content);
    }

    /**
     * Gets a built in field component and sends the variables passed in
     *
     * @param string $componentName
     * @param array $params
     * @return void
     */
    public function getComponent(string $componentName, array $params = [])
    {
        // Set template mode to CP
        $initialMode = Craft::$app->view->getTemplateMode();
        Craft::$app->view->setTemplateMode(View::TEMPLATE_MODE_CP);

        $formalismComponents = [
            "checkbox",
            "checkboxGroup",
            "file",
            "input",
            "radio",
            "radioGroup",
            "search",
            "select",
            "switcher",
            "textarea",
        ];

        $filePath = "formalism/fields/{$componentName}.twig";

        if (!Craft::$app->view->doesTemplateExist($filePath)) {
            $customPath = Craft::parseEnv(Formalism::$plugin->settings->pathComponent);
            throw new Exception("🧐 The \"{$componentName}\" field isn't one of the core Formalism components.\n\nCreate your own custom component in:\n{$this->pathCombine($customPath, $componentName)}.twig");
        }

        $paramsInitial = isset($params[0]) ? $params[0] : [];
        $paramsMerge = isset($params[1]) ? $params[1] : [];

        $content = Craft::$app->view->renderTemplate($filePath, [
            'params' => array_replace_recursive($paramsInitial, $paramsMerge)
        ]);

        // Reset the template mode
        Craft::$app->view->setTemplateMode($initialMode);

        return Template::raw($content);
    }

    /**
     * Converts a field (and form) object from Freeform to one
     *  that'll work with Formalism fields
     *
     * @param string $one
     * @param string $other
     * @param boolean $normalize
     * @return void
     */
    public function getFreeformProps($field, $form, array $paramsMerge)
    {
        $options = method_exists($field, 'getOptions') ? array_map(function($option) {
            return [
                'label' => $option->getLabel(),
                'value' => $option->getValue(),
                'isChecked' => $option->isChecked(),
            ];
        }, $field->getOptions()) : null;

        $attributesField = [
            'maxlength' => (isset($field->maxlength) && $field->maxlength > 0) ? $field->maxlength : null,
        ];

        if (method_exists($field, 'getInputAttributes')) {
            $fieldAttributes = array_filter($field->getInputAttributes());
            $inputAttributes = array_map(function($attribute) {
                return [$attribute['attribute'] => $attribute['value'] ?? ''];
            }, $fieldAttributes);
            if ($inputAttributes) {
                $attributesField = array_replace_recursive($attributesField, call_user_func_array('array_merge', $inputAttributes));
            }
        }

        $fieldId = ($field->getId() !== 0) ? $field->getId() : mt_rand(0, 5000);

        $properties = [
            'label' => $field->getLabel(),
            'name' => $field->getHandle(),
            'id' => "form{$form->getId()}field{$fieldId}",
            'instructions' => $field->getInstructions(),
            'error' => join('. ', $field->getErrors()),
            'isRequired' => $field->isRequired(),
            'isDisabled' => false,
            'value' => join(', ', (array) $field->getValue()),
            'options' => $options,
            'attributesField' => $attributesField,
        ];

        $properties = array_replace_recursive($properties, $paramsMerge);

        return $properties;
    }

    /**
     * Normalizes a path + filename
     *
     * @param string $one
     * @param string $other
     * @param boolean $normalize
     * @return void
     */
    private function pathCombine($one, $other, $normalize = true)
    {
        if ($normalize) {
            $one = str_replace('/', DIRECTORY_SEPARATOR, $one);
            $one = str_replace('\\', DIRECTORY_SEPARATOR, $one);
            $other = str_replace('/', DIRECTORY_SEPARATOR, $other);
            $other = str_replace('\\', DIRECTORY_SEPARATOR, $other);
        }

        // Remove leading/trailing dir separators
        if (!empty($one) && substr($one, -1) == DIRECTORY_SEPARATOR) $one = substr($one, 0, -1);
        if (!empty($other) && substr($other, 0, 1) == DIRECTORY_SEPARATOR) $other = substr($other, 1);

        // Return combined path
        if (empty($one)) {
            return $other;
        } elseif(empty($other)) {
            return $one;
        } else {
            return $one.DIRECTORY_SEPARATOR.$other;
        }
    }
}
