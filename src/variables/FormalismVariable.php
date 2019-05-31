<?php
/**
 * Formalism plugin for Craft CMS 3.x
 *
 * @link      https://simple.com.au
 * @copyright Copyright (c) 2019 Simple Integrated Marketing
 */

namespace simple\formalism\variables;

use simple\formalism\formalism;
use yii\base\Exception;
use Craft;
use SimpleXMLElement;

/**
 * @author    Simple
 * @package   Formalism
 * @since     1.0.0
 */
class FormalismVariable
{
    public function custom(string $componentName, array $params = [], array $paramsMerge = [])
    {
        return formalism::$plugin->formalismService->getCustomComponent($componentName, $params, $paramsMerge);
    }

    public function __call(string $componentName, array $params = [])
    {
        return formalism::$plugin->formalismService->getComponent($componentName, $params);
    }

    public function freeformProps($field, $form, array $paramsMerge = [])
    {
        return formalism::$plugin->formalismService->getFreeformProps($field, $form, $paramsMerge);
    }

    public function getObjectFromHtml(string $html)
    {
        $x = new SimpleXMLElement($html);
        $attributes = iterator_to_array($x->attributes());
        return $attributes;
    }
}
