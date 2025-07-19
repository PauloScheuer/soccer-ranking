# Soccer Ranking

## How does it work?

- A script written in typescript reads several .txt files, each one containing which club won the the file championship in which year;
- This script then writes a .json files containing all data to be used for the main application;
- The main application uses this .json file to create the visualization (a bar race chart);
- The visualization is drawn into a HTML canvas component by using TypeScript scripts: no external library is used.

## How to use?

- The bar race chart considers each club's amount of points;
- The points are initialized with 1 for each championship, but it is possible to customize the weights;
- It is also possible to set weights for setbacks, such as relegations;
- The are two ways of seeing the results: static and animated.

## Available clubs

The initial available clubs were chosen based on the popular Big-12 of Brazilian clubs, which are:

- Grêmio;
- Internacional;
- Atlético-MG;
- Cruzeiro;
- Flamengo;
- Fluminense;
- Botafogo;
- Vasco da Gama;
- Palmeiras;
- São Paulo;
- Corinthians;
- Santos.

## Available championships

Only the main championships still disputed by these clubs were made available. These are:

- Campeonato Gaúcho;
- Campeonato Carioca;
- Campeonato Mineiro;
- Campeonato Paulista;
- Copa do Brasil;
- Campeonato Brasileiro;
- Supercopa do Brasil;
- Copa Sudamericana;
- Copa Libertadores;
- Recopa Sudamericana;
- World Cup.
