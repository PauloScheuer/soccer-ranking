<template #content>
  <div class="ranking-content">
    <h1 class="ranking-title ranking-text">Brazilian Big 12 Ranking</h1>
    <h2 class="ranking-subtitle ranking-text">Check the biggest Brazilian clubs, ranked by titles. You can customize
      which clubs are considered, the interval of years and the weight for each championsip.</h2>
    <Collapsable :isOpen="isConfigOpen">
      <template #header>
        <div class="config-header">
          <span class="config-title">Settings</span>
          <vue-feather type="settings" size="16" class="config-icon" @click="isConfigOpen = !isConfigOpen" />
        </div>
      </template>
      <template #content>
        <div class="ranking-config">
          <div class="config-field">
            <span class="config-label">Considered years:</span>
            <DoubleRangeInput :min="minYear" :max="maxYear" :disabled="actionsDisabled"
              :class="actionsDisabled && 'disabled'" @change="handleYearRangeChange" />
          </div>
          <div class="config-field">
            <span class="config-label">Considered clubs:</span>
            <span v-for="team in config.clubs" class="config-button" :class="!team.consider && 'unconsider'"
              @click="team.consider = !team.consider">{{
                teamIdToName(team.id) }}</span>
            <span class="config-button" @click="config.clubs.forEach(item => item.consider = true)">Consider all</span>
            <span class="config-button" @click="config.clubs.forEach(item => item.consider = false)">Unconsider
              all</span>
          </div>
          <div class="config-field">
            <span class="config-label">Championship weights:</span>
            <div v-for="championship in config.championships" class="weight-field">
              <span>{{
                championshipIdToName(championship.id) }}:</span>
              <input type="number" min="0" v-model="championship.weight" class="weight-input" />
            </div>
            <span class="config-button" @click="config.championships.forEach(item => item.weight = 1)">Reset all</span>
          </div>
          <div class="config-field">
            <span class="config-label">Actions:</span>
            <span class="config-button" :class="actionsDisabled && 'disabled'" @click="create">Check</span>
            <span class="config-button" :class="actionsDisabled && 'disabled'" @click="animate">Animate</span>
            <template v-if="animating">
              <span class="config-button" @click="animationStep(-1)"
                :class="(animationRunning || !canStep) && 'disabled'">
                <VueFeather type="skip-back" size="16" />
              </span>
              <span class="config-button" @click="stopAnimation()">
                <VueFeather type="stop-circle" size="16" />
              </span>
              <span class="config-button" @click="animationRunning = !animationRunning">
                <VueFeather :type="animationRunning ? 'pause-circle' : 'play-circle'" size="16" />
              </span>
              <span class="config-button" @click="animationStep(1)"
                :class="(animationRunning || !canStep) && 'disabled'">
                <VueFeather type="skip-forward" size="16" />
              </span>
            </template>
          </div>
        </div>
      </template>
    </Collapsable>
    <div class="ranking-container">
      <span>{{ config.start }} - {{ curYear }}</span>
      <canvas ref="rankingCanvas" class="ranking-canvas" :width="chartWidth" :height="chartHeight"
        @mousemove="handleMouseMove">
      </canvas>
    </div>
  </div>
</template>
<script setup lang="ts">
import DoubleRangeInput from '../components/DoubleRangeInput.vue';
import { computed, onMounted, ref } from 'vue';
import VueFeather from 'vue-feather';
import data from '../../dataExtractor/data.json';
import { championshipIdToName, teamIdToColor, teamIdToName } from '../utils';
import { ChampionshipID, TeamID } from '../types';
import Collapsable from '../components/Collapsable.vue';

const minYear = 1906;
const maxYear = 2024;

const chartWidth = ref(0);
const chartHeight = ref(0);

const rankingCanvas = ref(null as HTMLCanvasElement | null);

const config = ref({
  start: minYear,
  end: maxYear,
  clubs: [
    { id: TeamID.Gremio, consider: true },
    { id: TeamID.Internacional, consider: true },
    { id: TeamID.AtleticoMG, consider: true },
    { id: TeamID.Cruzeiro, consider: true },
    { id: TeamID.Flamengo, consider: true },
    { id: TeamID.Fluminense, consider: true },
    { id: TeamID.Botafogo, consider: true },
    { id: TeamID.Vasco, consider: true },
    { id: TeamID.SaoPaulo, consider: true },
    { id: TeamID.Palmeiras, consider: true },
    { id: TeamID.Corinthians, consider: true },
    { id: TeamID.Santos, consider: true },
  ],
  championships: [
    { id: ChampionshipID.Gaucho, weight: 1 },
    { id: ChampionshipID.Carioca, weight: 1 },
    { id: ChampionshipID.Mineiro, weight: 1 },
    { id: ChampionshipID.Paulista, weight: 1 },
    { id: ChampionshipID.BrazilianCup, weight: 1 },
    { id: ChampionshipID.BrazilianLeague, weight: 1 },
    { id: ChampionshipID.BrazilianSuperCup, weight: 1 },
    { id: ChampionshipID.Sudamericana, weight: 1 },
    { id: ChampionshipID.Libertadores, weight: 1 },
    { id: ChampionshipID.Recopa, weight: 1 },
    { id: ChampionshipID.WorldCup, weight: 1 },
  ]
});

const isConfigOpen = ref(false);

const curYear = ref(maxYear);

const animating = ref(false);
const animationRunning = ref(false);

const actionsDisabled = computed(() => {
  return animating.value;
})


type TitlesByYear = { [year: string]: number };
type TeamsTitles = { [team: string]: TitlesByYear };
type RankingItem = { _id: string, pos: number, total: number }

const rankingItems = ref<TeamsTitles>({});

let drawStates = new Map<string, { pos: number, size: number }>();

async function handleYearRangeChange(low: number, high: number) {
  if (actionsDisabled.value) {
    return
  }

  config.value.start = low;
  config.value.end = high;
}

function computeData() {
  drawStates.clear();
  const raw = data;
  const acc: TeamsTitles = {};
  Object.entries(raw).forEach(([team, titles]: [string, { [key: string]: number[] }]) => {
    const shouldConsider = config.value.clubs.find(el => el.id === Number(team))?.consider;
    if (!shouldConsider) {
      return;
    }

    const accTitles: [string, number][] = [];
    for (let year = config.value.start; year <= config.value.end; year++) {
      const pastTitles = accTitles.at(-1)?.[1] ?? 0;
      const curTitles = titles[year]?.reduce((acc, cur) => {
        const weight = config.value.championships.find(el => el.id === cur)?.weight ?? 1;
        return acc + weight;
      }, 0) ?? 0;
      const total = curTitles + pastTitles;
      accTitles.push([String(year), total])
    }
    const titlesCount = Object.fromEntries(accTitles)

    acc[team] = titlesCount
  });

  rankingItems.value = acc;
}

function resizeCanvas() {
  if (rankingCanvas.value) {
    const sizes = rankingCanvas.value.getBoundingClientRect();
    chartWidth.value = sizes.width * devicePixelRatio;
    chartHeight.value = sizes.height * devicePixelRatio;

    const ctx = rankingCanvas.value?.getContext('2d');
    ctx?.scale(devicePixelRatio, devicePixelRatio);
  }
}

onMounted(() => {
  resizeCanvas();
  computeData();
  draw(curYear.value)
  window.addEventListener('resize', () => {
    resizeCanvas()
    draw(curYear.value)
  });
});

const N_QTY_ENTITIES = 12;

async function draw(year: number) {
  const ctx = rankingCanvas.value?.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.save();

  const width = chartWidth.value;
  const height = chartHeight.value;

  const items: { _id: string, pos: number, total: number }[] = Object.entries(rankingItems.value).map(([team, titles]) => {
    return { _id: team, pos: year, total: titles[year] ?? 0 }
  }).sort((a, b) => b.total - a.total);

  const maxTotal = Math.max(...items.map(item => item.total));

  const countSteps = 20;
  const steps = new Array(countSteps).fill(0).map((_, i) => i + 1);
  for await (const step of steps) {
    ctx.fillStyle = '#f3ece6';
    ctx.fillRect(0, 0, width, height);

    items.forEach(async (item, i) => {
      const lastState = drawStates.get(item._id);
      const lastPos = lastState?.pos ?? 21;
      const lastSize = lastState?.size ?? 0

      const diffPos = lastPos - i;
      const stepIndex = lastPos - diffPos * step / countSteps;

      const curSize = item.total / maxTotal;
      const diffSize = lastSize - curSize;
      const stepSize = lastSize - diffSize * step / countSteps;
      drawElementAtPos(ctx, item, stepIndex, stepSize, maxTotal);
    });

    await new Promise(res => setTimeout(res, 16));
  }

  ctx.restore()

  drawStates.clear();
  items.forEach((item, i) => {
    drawStates.set(item._id, { pos: i, size: item.total / maxTotal });
  })
}

function drawElementAtPos(ctx: CanvasRenderingContext2D, item: RankingItem, i: number, total: number, maxTotal: number) {
  const paddingY = 4;
  const paddingX = 10;
  const personHeight = chartHeight.value / N_QTY_ENTITIES;
  const width = chartWidth.value;

  const label = `${(teamIdToName(Number(item._id)))}`;

  //draw identifier
  const maxNameWidth = 140;

  ctx.font = '16px "Source Sans 3"';
  ctx.textBaseline = 'middle'
  const nameWidth = ctx.measureText(label).width;
  ctx.fillStyle = '#000';
  const textY = personHeight * (i + 0.5);
  ctx.fillText(label, maxNameWidth - nameWidth, textY, maxNameWidth);

  //draw bar
  const maxWidth = width - maxNameWidth - 20 - paddingX * 4;
  const fixedWidth = maxWidth * total;
  ctx.fillStyle = teamIdToColor(item._id);
  ctx.beginPath();
  ctx.roundRect(maxNameWidth + paddingX, personHeight * i + paddingY, fixedWidth, personHeight - paddingY * 2, 5);
  ctx.fill();
  ctx.closePath();

  //draw total
  ctx.fillText(`${Math.round(total * maxTotal)}`, maxNameWidth + paddingX * 2 + fixedWidth, textY);
}

const curAnimationYear = ref(config.value.start);
const canStep = ref(true);

async function canRunAnimation() {
  const originalYear = curAnimationYear.value;
  let interval = 0;

  canStep.value = true;
  const newIndex = await new Promise<number>((res) => {
    interval = window.setInterval(() => {
      if (!animating.value) {
        return res(-1);
      }
      if (originalYear !== curAnimationYear.value) {
        return res(curAnimationYear.value)
      }
      if (animationRunning.value) {
        res(originalYear + 1)
      }
    }, 16)
  })

  clearInterval(interval);
  canStep.value = false;

  return newIndex;
}

function animationStep(value: number) {
  if (animationRunning.value || !canStep.value) {
    return;
  }

  const newIndex = curAnimationYear.value + value;
  curAnimationYear.value = Math.max(newIndex, 0);
}

async function animationLoop() {
  curAnimationYear.value = config.value.start;
  while (curAnimationYear.value < config.value.end) {
    curAnimationYear.value = await canRunAnimation();
    curYear.value = curAnimationYear.value;

    if (!animating.value) {
      create()
      break;
    }

    draw(curAnimationYear.value);

    await new Promise(res => setTimeout(res, 1000));
  }
}

function create() {
  computeData();
  curYear.value = config.value.end;
  draw(curYear.value)
}

async function animate() {
  computeData();

  animating.value = true;
  animationRunning.value = true;
  await animationLoop();
  animating.value = false;
  animationRunning.value = false;
}

async function stopAnimation() {
  animating.value = false;
}

let curHovered = -1;

function handleMouseMove(event: MouseEvent) {
  if (animating.value) {
    curHovered = -1;
    return;
  }

  const y = event.offsetY;

  curHovered = Math.floor((y / chartHeight.value) * N_QTY_ENTITIES);
}

</script>
<style scoped>
.ranking-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #f3ece6;
  padding: 20px;
}

.ranking-container {
  height: fit-content;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.ranking-config {
  border-radius: 8px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  background-color: white;
  padding: 10px;
}

.ranking-text {
  background-color: white;
  padding: 8px;
  border-radius: 5px;
}

.ranking-title {
  font-weight: bold;
  width: fit-content;
}

.ranking-subtitle {
  width: fit-content;
}

.config-field {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  background-color: white;
  padding: 8px;
  border-radius: 5px;
}

.weight-field {
  display: flex;
  gap: 10px;
  border-radius: 5px;
  padding: 4px 8px;
  align-items: center;
  background-color: #6B3FA0;
  color: white;
}

.weight-input {
  all: unset;
  width: 60px;
  font: inherit;
  /* Inherit font from parent */
  color: black;
  background: none;
  border: none;
  outline: none;
  box-sizing: border-box;
  background-color: #f2f2f2;
  padding: 4px;
  border-radius: 5px;
  text-align: center;
}

.config-label {}

.config-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
  background-color: #6B3FA0;
  color: white;
}

.filter-title {
  font-weight: bold;
}

.ranking-canvas {
  width: 100%;
  height: 600px;
  cursor: pointer;
}

.disabled {
  opacity: 0.6;
  cursor: auto;
}

.unconsider {
  opacity: 0.2;
}

.config-header {
  background-color: white;
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.config-icon {
  cursor: pointer;
}
</style>