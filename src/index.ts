import { EventHandler } from "./EventHandler";
import { GameController } from "./GameController";
import { UIManager } from "./UIManager";

const gController: GameController = new GameController();
const uiManager: UIManager = new UIManager(gController);
const evHandler: EventHandler = new EventHandler(gController, uiManager);

GameController.SetSingleton(gController);
EventHandler.SetSingleton(evHandler);
gController.SetEventHandler(evHandler);

(async () =>
{
    await uiManager.InitializePIXIApplication();
    await uiManager.InitializeUILayer("TEST GAME")
    await uiManager.InitializeReels();
    await gController.InitializeSpinTicker();
    await evHandler.InitializeEventListener();
})();