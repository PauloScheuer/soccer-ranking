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
  [TeamID.AtleticoMG, "#000000"],
  [TeamID.Cruzeiro, "#0033A0"],
  [TeamID.Flamengo, "#C8102E"],
  [TeamID.Fluminense, "#640A0A"],
  [TeamID.Botafogo, "#000000"],
  [TeamID.Vasco, "#000000"],
  [TeamID.SaoPaulo, "#FF0000"],
  [TeamID.Palmeiras, "#1E7F3B"],
  [TeamID.Corinthians, "#000000"],
  [TeamID.Santos, "#000000"],
]);

export function teamIdToColor(id: number | string) {
  return teamsColorMap.get(Number(id)) ?? "#000000";
}
