import * as PIXI from 'pixi.js';
import { PlayerProfile } from './PlayerProfile';
import { GameController } from "./GameController";
import { Reel } from './Reel';

export class UIManager 
{
    private gameController: GameController;
    public app: PIXI.Application;

    appHeight: number = 1080;
    appWidth: number = 1920;

    backgroundLayer: PIXI.Container = new PIXI.Container();
    uiLayer: PIXI.Container = new PIXI.Container();
    betContainer: PIXI.Container = new PIXI.Container();

    constructor(gameController: GameController) {
        this.gameController = gameController;
        this.app = new PIXI.Application;
    }

    async InitializePIXIApplication() 
    {
        await this.app.init({
            width: this.appWidth,
            height: this.appHeight,
        });
    }

    async InitializeUILayer(title: string)
    {
        this.app.stage.addChild(this.backgroundLayer);
        
        await PIXI.Assets.load('./assets/BackgroundSlots.jpg').then((texture: PIXI.Texture) => {
            const sprite = new PIXI.Sprite(texture);
            
            sprite.x = 0;
            sprite.y = 0;
            
            sprite.height = this.appHeight;
            sprite.width = this.appWidth;
            
            this.backgroundLayer.addChild(sprite);
        });
        
        this.InitializeTitle(title);
        this.InitializeSpinButton();
        this.InitializeCreditText();
        this.InitializeInfoText();
        this.InitializeWinningsText();
        this.InitializeBetText()
        this.InitializeMinusBetButton();
        this.InitializePlusBetButton();
        this.InitializeAutoplayButton();

        this.uiLayer.addChild(this.betContainer);

        this.backgroundLayer.addChild(this.uiLayer);

        document.body.appendChild(this.app.canvas);
    }

    InitializeTitle(title: string) 
    {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 56,
            fontWeight: 'bold',
            fill: {color: '#FFFFFF'}
        });

        const titleText = new PIXI.Text({ 
            text: title, 
            style 
        });
        titleText.anchor.set(0.5, 0.5);
        titleText.y = 100;
        titleText.x = this.appWidth / 2;

        this.uiLayer.addChild(titleText);
    }

    //SPIN BUTTON
    InitializeSpinButton()
    {
        const x = this.appWidth / 2 - 200;
        const y = 1000;

        const buttonLayout = new PIXI.Graphics()
                        .rect(x,y, 400,200)
                        .fill({color: '0080d8'});
        
        buttonLayout.interactive = true;
        buttonLayout.addListener('pointerdown', () => {
            this.SetAutoplay(false);
            this.gameController.TrySpin();
        });

        this.uiLayer.addChild(buttonLayout);

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 40,
            fontWeight: 'bold'
        });

        const text = new PIXI.Text({ 
            text: "SPIN", 
            style
        });

        text.x = x + 100;
        text.y = y + 15;
        text.label = "SpinButton";

        this.uiLayer.addChild(text);
    }

    //SET UP REELS WITH SYMBOLS
    InitializeReels()
    {
        for(let i = 0; i < this.gameController.config.nrOfReels; i++)
        {
            const reel = new Reel(i);
    
            reel.SetUpReel(this.app, 20);

            this.gameController.reels.push(reel);
        }
    }

    UpdateSpinButtonText(message: string)
    {
        let child = this.uiLayer.getChildByLabel("SpinButton") as PIXI.Text;
        child.text = message;
    }

        //AUTOPLAY BUTTON
    InitializeAutoplayButton()
    {
        const x = 0;
        const y = 1000;

        const buttonLayout = new PIXI.Graphics()
                        .rect(x,y, 400,200)
                        .fill({color: '#FF0000'});
        
        buttonLayout.interactive = true;
        buttonLayout.addListener('pointerdown', () => {
            this.gameController.autoplayEnabled = !this.gameController.autoplayEnabled;
            this.SetAutoplay(this.gameController.autoplayEnabled);
        });
        buttonLayout.label = "Autoplay";

        this.uiLayer.addChild(buttonLayout);

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 40,
            fontWeight: 'bold'
        });

        const text = new PIXI.Text({ 
            text: "AUTOPLAY", 
            style
        });

        text.x = x + 100;
        text.y = y + 15;

        this.uiLayer.addChild(text);
    }

    //CHANGE AUTOPLAY COLOR BUTTON - HAS TO BE A BETTER WAY FOR SURE
    UpdateAutoplayButtonText(enabled: boolean)
    {
        let child = this.uiLayer.getChildByLabel("Autoplay") as PIXI.Graphics;
        child.clear();
        
        if(enabled)
        {
            child.rect(0,1000,400,200).fill({color: '#00ff00'})
        }
        else
        {
            child.rect(0,1000,400,200).fill({color: '#FF0000'})
        }
    }

    //CREDIT TEXT
    InitializeCreditText()
    {
        const x = this.appWidth - 300;
        const y = 1000;

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        });
        
        const creditsText = new PIXI.Text({
            text: `Credits: ${this.gameController.playerProfile.currentCredits}`, 
            style
        });
        creditsText.x = x;
        creditsText.y = y;
        creditsText.label = "CreditsText";
        this.uiLayer.addChild(creditsText);
    }

    UpdateCreditsText(message: string)
    {
        let newText = `Credits: ${message}`;
        let child = this.uiLayer.getChildByLabel("CreditsText") as PIXI.Text;
        child.text = newText;
    }

    //BET TEXT
    InitializeBetText()
    {
        const x = 825;
        const y = 950;
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        });

        const betText = new PIXI.Text({
            text: `Current Bet: ${this.gameController.playerProfile.BetValue()}`, 
            style
        });
        betText.x = x;
        betText.y = y;
        betText.label = "BetText";
        // betText.addChild(buttonLayoutPlus);
        this.betContainer.addChild(betText);
    }

    UpdateBetText(message: string)
    {
        let newText = `Current Bet: ${message}`;
        let child = this.betContainer.getChildByLabel("BetText") as PIXI.Text;
        child.text = newText;
    }

    InitializePlusBetButton()
    {
        const x = 1130;
        const y = 960;

        const buttonLayoutPlus = new PIXI.Graphics()
        .rect(x,y, 20,20)
        .fill({color: '0080d8'});

        buttonLayoutPlus.interactive = true;
        buttonLayoutPlus.addListener('pointerdown', () => {
            if(!this.gameController.CheckIfSpinning())
            {
                this.gameController.playerProfile.IncreaseBet();
                this.UpdateBetText(this.gameController.playerProfile.BetValue().toString());
            }
        });

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        });

        const plusBet = new PIXI.Text({
            text: "+", 
            style
        });

        plusBet.x = x;
        plusBet.y = y - 15;
        buttonLayoutPlus.addChild(plusBet);
        

        this.betContainer.addChild(buttonLayoutPlus);
    }

    InitializeMinusBetButton()
    {
        const x = 775;
        const y = 960;

        const buttonLayoutMinus = new PIXI.Graphics()
        .rect(x,y, 20,20)
        .fill({color: '0080d8'});

        buttonLayoutMinus.interactive = true;
        buttonLayoutMinus.addListener('pointerdown', () => {
            if(!this.gameController.CheckIfSpinning())
            {
                this.gameController.playerProfile.DecreaseBet();
                this.UpdateBetText(this.gameController.playerProfile.BetValue().toString());
            }
        });

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        });

        const minusBet = new PIXI.Text({
            text: "-", 
            style
        });

        minusBet.x = x;
        minusBet.y = y - 15;
        buttonLayoutMinus.addChild(minusBet);

        this.betContainer.addChild(buttonLayoutMinus);
    }

    //WINNINGS TEXT
    InitializeWinningsText()
    {
        const x = 450;
        const y = 1000;

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        });

        const winningsText = new PIXI.Text({
            text: "Winnings: 0", 
            style
        });
        winningsText.x = x;
        winningsText.y = y;
        winningsText.label = "WinningsText";
        this.uiLayer.addChild(winningsText);
    }

    UpdateWinningsText(message: string)
    {
        let newText = `Winnings: ${message}`;
        let child = this.uiLayer.getChildByLabel("WinningsText") as PIXI.Text;
        child.text = newText;
    }

    //INFO TEXT
    InitializeInfoText()
    {
        const x = this.appWidth / 2;
        const y = this.gameController.config.reelHeight + 250;

        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: '#FFFFFF'
        });

        const InfoText = new PIXI.Text({
            text: "", 
            style
        });
        InfoText.anchor.set(0.5, 0.5);
        InfoText.x = x;
        InfoText.y = y;
        InfoText.label = "InfoText";
        this.uiLayer.addChild(InfoText);
    }

    UpdateInfoText(message: string)
    {
        let child = this.uiLayer.getChildByLabel("InfoText") as PIXI.Text;
        child.text = message;
    }

    SetAutoplay(enabled: boolean)
    {
        if(enabled)
        {
            this.gameController.TrySpin(); //spin initially

            const interval = 2000;
            this.gameController.autoplayIntervalID = setInterval(() => {
            this.gameController.TrySpin();
            },interval);
        }
        else
        {
            clearInterval(this.gameController.autoplayIntervalID);
        }
        this.UpdateAutoplayButtonText(enabled);
    }
}
