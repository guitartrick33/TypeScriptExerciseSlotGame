Requirements for the project:

	- npm installed
	- pixi.js installed
	- typescript installed
	- webpack + webpack cli installed
	- ts-loader installed

To run the project:
	- npx webpack --config webpack.config.js -> to build newest version in dist
	- from VSC - Go live from the "Live Server" extension -> press it when dist/index.html is opened


Project includes:
	- Drawn symbols - currently limited to 3 symbols to showcase winning effects
	- Symbols include a wild symbol that appears only on 2nd and 4th reel and replaces any symbol
	- Reel spinning using app.ticker
	- Result controller - added dynamic result checker for X amount of lines (currently 5 - could be extended with any line combination)
	- Each winning line has a color associated with it
	- Initialize symbol frames when displaying multiple line winnings
	- Effect for displaying multiple line winnings below the reels
	- Coefficient for each symbol based on bet for the winnings
	- Bet that could be decreased/incremented from a prefixed bet steps
	- Fixed denomination => bet = bet * denom
	- Winnings display for each spin => if winnings are above 0 => collect them first before spinning
	- Autoplay functionality
