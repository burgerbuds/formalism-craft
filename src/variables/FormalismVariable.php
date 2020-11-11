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
    // Retrieve field components

    public function custom(string $componentName, array $params = [], array $paramsMerge = [])
    {
        return formalism::$plugin->formalismService->getCustomComponent($componentName, $params, $paramsMerge);
    }

    public function __call(string $componentName, array $params = [])
    {
        return formalism::$plugin->formalismService->getComponent($componentName, $params);
    }

    // Freeform integrations

    public function freeformProps($field, $form, array $paramsMerge = [])
    {
        return formalism::$plugin->formalismService->getFreeformProps($field, $form, $paramsMerge);
    }

    public function freeformJs(bool $build = true)
    {
        $filePath = $build ? 'dist/freeform.js' : 'src/freeform.js';
        $url = Craft::$app->assetManager->getPublishedUrl("@simple/formalism/assetbundles/$filePath");
        if (!$url) throw new Exception("🧐 The freeform file wasn't found.");
        Craft::$app->view->registerJsFile($url);
    }

    // Utilities

    public function getObjectFromHtml(string $html)
    {
        $dom = new \DOMDocument();
        $dom->loadHTML($html);
        $body = $dom->getElementsByTagName("body");
        $result = [];
        foreach ($body->item(0)->firstChild->attributes as $attr) {
            $result[$attr->nodeName] = $attr->nodeValue;
        }
        return $result;
    }

    public function deepMerge(array $array1, array $array2)
    {
        return array_replace_recursive($array1, $array2);
    }
}
