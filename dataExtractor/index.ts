import fs from "fs";

type Championship = {
  id: ChampionshipID;
  name: string;
  file: string;
  level: Level;
};

type Titles = Record<number, ChampionshipID[]>;

enum ChampionshipID {
  Gaucho,
  Carioca,
  Mineiro,
  Paulista,
  BrazilianCup,
  BrazilianLeague,
  BrazilianSuperCup,
  Sudamericana,
  Libertadores,
  Recopa,
  WorldCup,
}

enum TeamID {
  Gremio,
  Internacional,
  AtleticoMG,
  Cruzeiro,
  Flamengo,
  Fluminense,
  Botafogo,
  Vasco,
  SaoPaulo,
  Palmeiras,
  Corinthians,
  Santos,
}

enum Level {
  Regional,
  National,
  Continental,
  World,
}

const championships: Championship[] = [
  {
    id: ChampionshipID.Gaucho,
    name: "Gaúcho",
    file: "gaucho.txt",
    level: Level.Regional,
  },
  {
    id: ChampionshipID.Carioca,
    name: "Carioca",
    file: "carioca.txt",
    level: Level.Regional,
  },
  {
    id: ChampionshipID.Mineiro,
    name: "Mineiro",
    file: "mineiro.txt",
    level: Level.Regional,
  },
  {
    id: ChampionshipID.Paulista,
    name: "Paulista",
    file: "paulista.txt",
    level: Level.Regional,
  },
  {
    id: ChampionshipID.BrazilianCup,
    name: "Copa do Brasil",
    file: "brazilian_cup.txt",
    level: Level.National,
  },
  {
    id: ChampionshipID.BrazilianLeague,
    name: "Brasileirão",
    file: "brazilian_league.txt",
    level: Level.National,
  },
  {
    id: ChampionshipID.BrazilianSuperCup,
    name: "Supercopa do Brasil",
    file: "supercup.txt",
    level: Level.National,
  },
  {
    id: ChampionshipID.Sudamericana,
    name: "Copa Sulamericana",
    file: "sudamericana.txt",
    level: Level.Continental,
  },
  {
    id: ChampionshipID.Libertadores,
    name: "Copa Libertadores",
    file: "libertadores.txt",
    level: Level.Continental,
  },
  {
    id: ChampionshipID.Recopa,
    name: "Recopa Sulamericana",
    file: "recopa.txt",
    level: Level.Continental,
  },
  {
    id: ChampionshipID.WorldCup,
    name: "Mundial",
    file: "world_cup.txt",
    level: Level.World,
  },
];

const teamsIdMap = new Map([
  ["Grêmio", TeamID.Gremio],
  ["Internacional", TeamID.Internacional],
  ["Atlético Mineiro", TeamID.AtleticoMG],
  ["Cruzeiro", TeamID.Cruzeiro],
  ["Flamengo", TeamID.Flamengo],
  ["Fluminense", TeamID.Fluminense],
  ["Botafogo", TeamID.Botafogo],
  ["Vasco da Gama", TeamID.Vasco],
  ["São Paulo", TeamID.SaoPaulo],
  ["Palmeiras", TeamID.Palmeiras],
  ["Corinthians", TeamID.Corinthians],
  ["Santos", TeamID.Santos],
]);

const teams: Record<number, Titles> = {};

championships.forEach((championship) => {
  const data = fs.readFileSync("sources/" + championship.file, "utf-8");
  const lines = data.split("\r\n");
  lines.forEach((line) => {
    const [_year, _team] = line.split("\t");

    const year = Number(_year);
    const team = _team;

    const teamId = teamsIdMap.get(team);
    if (teamId == null) {
      return;
    }

    const titles: Titles = teams[teamId] ?? {};
    const yearTitles = titles[Number(year)] ?? [];

    yearTitles.push(championship.id);

    titles[Number(year)] = yearTitles;
    teams[teamId] = titles;
  });
});

fs.writeFileSync("data.json", JSON.stringify(teams));
