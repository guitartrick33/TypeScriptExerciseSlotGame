import * as PIXI from 'pixi.js';
import { GameController } from './GameController';
import { Symbol } from './Symbol';

export class Reel
{
    reelID: number;

    symbols: Symbol[];

    reelSprite: PIXI.Sprite;

    gController: GameController;

    container: PIXI.Container;

    isSpinning: boolean = false;

    constructor(reelID: number)
    {
        this.reelID = reelID;
        this.symbols = [];
        this.gController = GameController.Singleton();
        this.reelSprite = new PIXI.Sprite();
        this.container = new PIXI.Container();
    }

    //SET UP REELS
    async SetUpReel(app: PIXI.Application, offSetX: number)
    {
        const reelPos: [number, number] = [this.gController.config.reelWidth * this.reelID + this.gController.config.reelStartPos[0] + offSetX * this.reelID, this.gController.config.reelStartPos[1]]

        const bgContainer = new PIXI.Graphics() //background color for reels - maybe use a picture instead? until i get copyrighted...
                        .rect(reelPos[0], reelPos[1], this.gController.config.reelWidth, this.gController.config.reelHeight)
                        .fill('fa9e42');

        const reelContainer = new PIXI.Container;
        reelContainer.x = reelPos[0];
        reelContainer.y = reelPos[1];
        
        bgContainer.addChild(reelContainer);
        app.stage.addChild(bgContainer);

        const mask = new PIXI.Graphics()
        .rect(0,0, this.gController.config.reelWidth, this.gController.config.reelHeight)
        .fill(0xffffff);
        
        reelContainer.mask = mask;
        reelContainer.addChild(mask);

        await this.SetUpSymbolsPerReel(reelContainer); // set them behind the reel frame
        
        await PIXI.Assets.load('./assets/Reel.png').then((texture: PIXI.Texture) => {    //reel frame
            this.reelSprite.texture = texture;
        });

        this.reelSprite.x = 0;
        this.reelSprite.y = 0;
        this.reelSprite.width = this.gController.config.reelWidth;
        this.reelSprite.height = this.gController.config.reelHeight;

        reelContainer.addChild(this.reelSprite);
        
        this.container = reelContainer;
    }

    //ADDS SYMBOLS TO THE REELS - MAKES THE VISIBLE ONES ACTIVE
    async SetUpSymbolsPerReel(container: PIXI.Container)
    {
        const nrOfAllSymbols = this.gController.config.symbolsPerReel + 2;

        for(let i = 0; i < nrOfAllSymbols; i++)
        {
            const symbol = new Symbol([this.reelID, i], this, true)

            await symbol.InitializeSymbol(container);
            if(i == 0 || i == nrOfAllSymbols - 1)
            {
                symbol.isActive = false; // this is for the result check - if symbol is active, it's part of the "visible" symbols
            }

            this.symbols.push(symbol);
        }
    }

    //SPINS SYMBOL
    StartSpin(delta: number)
    {
        this.symbols.forEach(symb => {
            symb.SpinSymbol(delta, 40);
        });
    }

    //RESET FOR TICKER TO WORK - IF DONE WITH TWEENS - UNNECCESSARY
    ResetRotations()
    {
        this.symbols.forEach(symb => {
            symb.currentRots = 0;
        });
    }
}