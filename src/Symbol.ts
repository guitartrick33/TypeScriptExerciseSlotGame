import * as PIXI from 'pixi.js';
import {Reel} from './Reel';
import { GameController } from './GameController';
import { EventHandler } from './EventHandler';

export class Symbol
{
    symbolID: [number, number];

    reel: Reel;

    alias: string = "";
    isWild: boolean = false;

    isActive: boolean;

    symbolSize: number = 200;
    symbolSprite: PIXI.Sprite;
    frameSprite: PIXI.Sprite;

    startingPositionY: number = 0;

    currentRots: number = 0;

    gController: GameController;
    
    constructor(symbolID: [number, number], reel: Reel, isActive: boolean)
    {
        this.symbolID = symbolID;
        this.reel = reel;
        this.isActive = isActive;
        this.gController = GameController.Singleton();
        this.symbolSprite = new PIXI.Sprite();
        this.frameSprite = new PIXI.Sprite();
    }

    // CREATES THE SYMBOL IN THE FIRST PLACE
    async InitializeSymbol(reelContainer: PIXI.Container)
    {
        await this.UpdateSymbolID();

        this.symbolSprite.anchor.set(0.5, 0.5);
        this.symbolSprite.x = this.gController.config.reelWidth / 2;
        this.symbolSprite.y = (this.symbolID[1] - 1) * this.symbolSize + this.symbolSize / 2;

        this.startingPositionY = this.symbolSprite.y;

        this.symbolSprite.width = this.symbolSize;
        this.symbolSprite.height = this.symbolSize;

        reelContainer.addChild(this.symbolSprite);

        await this.InitializeWinningFrame(this.symbolSprite);
    }

    //UPDATES SYMBOL'S TEXTURE
    async UpdateSymbolID()
    {
        let chanceForWild: boolean = this.GetRandomIntegerInclusive(0,2) == 2 ? true : false;
        let url = "";
        let wildPos = this.gController.config.wildPositions;
        
        if(chanceForWild && wildPos.includes(this.reel.reelID))
        {
            this.isWild = true;
            url = this.GetWildURL();
        }
        else
        {
            url = this.GetRandomURL();
        }

        await PIXI.Assets.load(url).then((texture: PIXI.Texture) => {
            this.symbolSprite.texture = texture;
        });
    }

    //SELECTS RANDOM SYMBOL .PNG - UPDATES SYMBOL ALIAS!!! IMPORTANT
    GetRandomURL(): string
    {
        const symbols = this.gController.config.symbols;

        const randomID = this.GetRandomIntegerInclusive(0, symbols.length - 1);
        const url: string = './assets/' + symbols[randomID] + '.png';
        this.alias = symbols[randomID]; //symbol's alias is what would be used to create the line result winnings
        return url;
    }

    GetWildURL(): string
    {
        const url: string = './assets/WILD.png';
        this.alias = "WILD";
        return url;
    }
    
    //FUNCTION FROM INET FOR MATH.RANDOM THAT'S NOT 0 OR 1....
    GetRandomIntegerInclusive(min: number, max: number) : number 
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //TICKER LOGIC - COULD BE SWAPPED WITH TWEEN FOR BETTER PERFORMANCE
    SpinSymbol(delta: number, speed: number)
    {
        if(this.currentRots >= this.gController.config.rotations + this.reel.reelID)
        {
            if(this.symbolSprite.y >= this.startingPositionY)
            {
                this.symbolSprite.y = this.startingPositionY;
                
                if(this.reel.isSpinning)
                {
                    this.reel.isSpinning = false;
                    this.gController.eventHandler?.eventEmiter.emit('StopSpin');
                }
                //Tried with events but doesn't work, might have to use custom event transmitter..
                return;
            }
        }

        this.reel.isSpinning = true;
        this.symbolSprite.y += delta * speed;
        if(this.symbolSprite.y >= this.gController.config.reelHeight + this.symbolSize)
        {
            this.symbolSprite.y = -this.symbolSize;
            this.UpdateSymbolID();
            this.currentRots++;
        }
    }

    //FRAME FOR WHEN DISPLAYING WINNING LINES - PRE LOADED AT START AND MADE INVISIBLE - WHITE ASSET TO CHANGE COLOR BASED ON LINE EASILY
    async InitializeWinningFrame(container: PIXI.Container)
    {
        await PIXI.Assets.load('./assets/WinFrame.png').then((texture: PIXI.Texture) => {
            this.frameSprite.texture = texture;
        });

        this.frameSprite.anchor.set(0.5, 0.5)
        this.frameSprite.x = 0;
        this.frameSprite.y = 0;

        this.frameSprite.width = this.symbolSize / 1.5;
        this.frameSprite.height = this.symbolSize / 1.5;

        this.frameSprite.visible = false;

        container.addChild(this.frameSprite);
    }
}