<?php
/**
 * Formalism plugin for Craft CMS 3.x
 *
 * Grab Twig components from outside the primary template folder
 *
 * @link      https://simple.com.au
 * @copyright Copyright (c) 2019 Simple Integrated Marketing
 */

namespace simple\formalism\models;

use simple\formalism\formalism;

use Craft;
use craft\base\Model;

/**
 * @author    Simple
 * @package   Formalism
 * @since     1.0.0
 */
class Settings extends Model
{
    // Public Properties
    // =========================================================================

    /**
     * @var string
     */
    public $pathComponent = '_fields/';

    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['pathComponent', 'string'],
            ['pathComponent', 'default', 'value' => '_fields/'],
        ];
    }
}
