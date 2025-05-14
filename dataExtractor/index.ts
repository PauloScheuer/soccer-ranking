import fs from "fs";

type Event = {
  id: EventID;
  file: string;
  level: Level;
};

type Titles = Record<number, EventID[]>;

enum EventID {
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
  Relegation1,
  Relegation2,
  FailedPromotion,
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
  Bad,
}

const events: Event[] = [
  {
    id: EventID.Gaucho,
    file: "gaucho.txt",
    level: Level.Regional,
  },
  {
    id: EventID.Carioca,
    file: "carioca.txt",
    level: Level.Regional,
  },
  {
    id: EventID.Mineiro,
    file: "mineiro.txt",
    level: Level.Regional,
  },
  {
    id: EventID.Paulista,
    file: "paulista.txt",
    level: Level.Regional,
  },
  {
    id: EventID.BrazilianCup,
    file: "brazilian_cup.txt",
    level: Level.National,
  },
  {
    id: EventID.BrazilianLeague,
    file: "brazilian_league.txt",
    level: Level.National,
  },
  {
    id: EventID.BrazilianSuperCup,
    file: "supercup.txt",
    level: Level.National,
  },
  {
    id: EventID.Sudamericana,
    file: "sudamericana.txt",
    level: Level.Continental,
  },
  {
    id: EventID.Libertadores,
    file: "libertadores.txt",
    level: Level.Continental,
  },
  {
    id: EventID.Recopa,
    file: "recopa.txt",
    level: Level.Continental,
  },
  {
    id: EventID.WorldCup,
    file: "world_cup.txt",
    level: Level.World,
  },
  {
    id: EventID.Relegation1,
    file: "relegation1.txt",
    level: Level.Bad,
  },
  {
    id: EventID.Relegation2,
    file: "relegation2.txt",
    level: Level.Bad,
  },
  {
    id: EventID.FailedPromotion,
    file: "failed_promotion.txt",
    level: Level.Bad,
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

events.forEach((event) => {
  const data = fs.readFileSync("sources/" + event.file, "utf-8");
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

    yearTitles.push(event.id);

    titles[Number(year)] = yearTitles;
    teams[teamId] = titles;
  });
});

fs.writeFileSync("data.json", JSON.stringify(teams));
