import { TeamID } from "./types";

export const teamsNameMap = new Map([
  [TeamID.Gremio, "Grêmio"],
  [TeamID.Internacional, "Internacional"],
  [TeamID.AtleticoMG, "Atlético Mineiro"],
  [TeamID.Cruzeiro, "Cruzeiro"],
  [TeamID.Flamengo, "Flamengo"],
  [TeamID.Fluminense, "Fluminense"],
  [TeamID.Botafogo, "Botafogo"],
  [TeamID.Vasco, "Vasco da Gama"],
  [TeamID.SaoPaulo, "São Paulo"],
  [TeamID.Palmeiras, "Palmeiras"],
  [TeamID.Corinthians, "Corinthians"],
  [TeamID.Santos, "Santos"],
]);

export function teamIdToName(id: number | string) {
  return teamsNameMap.get(Number(id)) ?? "Unknown";
}
