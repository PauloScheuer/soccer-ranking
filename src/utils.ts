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

export const teamsColorMap = new Map([
  [TeamID.Gremio, "#00BFFF"],
  [TeamID.Internacional, "#FF0000"],
  [TeamID.AtleticoMG, "#C9B037"],
  [TeamID.Cruzeiro, "#0033A0"],
  [TeamID.Flamengo, "#C8102E"],
  [TeamID.Fluminense, "#640A0A"],
  [TeamID.Botafogo, "#A9A9A9"],
  [TeamID.Vasco, "#B22222"],
  [TeamID.SaoPaulo, "#FF0000"],
  [TeamID.Palmeiras, "#1E7F3B"],
  [TeamID.Corinthians, "#D7B56D"],
  [TeamID.Santos, "#000000"],
]);

export function teamIdToColor(id: number | string) {
  return teamsColorMap.get(Number(id)) ?? "#000000";
}
