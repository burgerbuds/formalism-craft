<?php
/**
 * Formalism plugin for Craft CMS 3.x
 *
 * Twig components for the Formalism field style framework
 *
//  * @link      https://simple.com.au
 * @copyright Copyright (c) 2019 Simple Integrated Marketing
 */

namespace simple\formalism;

use simple\formalism\services\FormalismService as FormalismServiceService;
use simple\formalism\variables\FormalismVariable;
use simple\formalism\models\Settings;

use Craft;
use craft\base\Plugin;
use craft\services\Plugins;
use craft\events\PluginEvent;
use craft\web\twig\variables\CraftVariable;

use yii\base\Event;

/**
 * Class Formalism
 *
 * @author    Simple
 * @package   Formalism
 * @since     1.0.0
 *
 * @property  FormalismServiceService $FormalismService
 */
class Formalism extends Plugin
{
    // Static Properties
    // =========================================================================

    /**
     * @var Formalism
     */
    public static $plugin;

    // Public Properties
    // =========================================================================

    /**
     * @var string
     */
    public $schemaVersion = '1.0.0';

    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function init()
    {
        parent::init();
        self::$plugin = $this;

        Event::on(
            CraftVariable::class,
            CraftVariable::EVENT_INIT,
            function (Event $event) {
                /** @var CraftVariable $variable */
                $variable = $event->sender;
                $variable->set('formalism', FormalismVariable::class);
            }
        );

        Event::on(
            Plugins::class,
            Plugins::EVENT_AFTER_INSTALL_PLUGIN,
            function (PluginEvent $event) {
                if ($event->plugin === $this) {
                }
            }
        );

        Craft::info(
            Craft::t(
                'formalism',
                '{name} plugin loaded',
                ['name' => $this->name]
            ),
            __METHOD__
        );
    }

    // Protected Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    protected function createSettingsModel()
    {
        return new Settings();
    }

    /**
     * @inheritdoc
     */
    protected function settingsHtml(): string
    {
        return Craft::$app->view->renderTemplate(
            'formalism/settings',
            [
                'settings' => $this->getSettings()
            ]
        );
    }
}
