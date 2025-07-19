<template #content>
  <div class="ranking-content">
    <h1 class="ranking-title ranking-text">Brazilian Big 12 Ranking</h1>
    <h2 class="ranking-subtitle ranking-text">Check the biggest Brazilian clubs, ranked by titles. You can customize
      which clubs are considered, the interval of years and the weight for each championship.</h2>
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
            <div class="config-options">
              <button v-for="team in config.clubs" class="config-button consider"
                :class="!team.consider && 'unconsider'" @click="team.consider = !team.consider">{{
                  teamIdToName(team.id) }}</button>

            </div>
            <div class="config-options"> <button class="config-button"
                @click="config.clubs.forEach(item => item.consider = true)">Consider
                all</button>
              <button class="config-button" @click="config.clubs.forEach(item => item.consider = false)">Unconsider
                all</button>
            </div>
          </div>
          <div class="config-field">
            <span class="config-label">Championship weights:</span>
            <div class="config-options">
              <div v-for="championship in config.championships" class="weight-field">
                <span>{{
                  eventIdToName(championship.id) }}:</span>
                <input type="number" min="0" v-model="championship.weight" class="weight-input" />
              </div>
            </div>

            <div class="config-options">
              <button class="config-button" @click="config.championships.forEach(item => item.weight = 1)">Reset
                all</button>
            </div>
          </div>
          <div class="config-field">
            <span class="config-label">Setback weights:</span>
            <div class="config-options">
              <div v-for="setback in config.setbacks" class="weight-field">
                <span>{{
                  eventIdToName(setback.id) }}:</span>
                <input type="number" min="0" v-model="setback.weight" class="weight-input" />
              </div>

            </div>
            <div class="config-options"><button class="config-button"
                @click="config.setbacks.forEach(item => item.weight = 0)">Reset all</button></div>
          </div>
          <div class="config-field">
            <span class="config-label">Actions:</span>
            <div class="config-options">
              <button class="config-button" :class="actionsDisabled && 'disabled'" @click="create">Check</button>
              <button class="config-button" :class="actionsDisabled && 'disabled'" @click="animate">Animate</button>
              <template v-if="animating">
                <button class="config-button" @click="animationStep(-1)"
                  :class="(animationRunning || !canStep) && 'disabled'">
                  <VueFeather type="skip-back" size="16" />
                </button>
                <button class="config-button" @click="stopAnimation()">
                  <VueFeather type="stop-circle" size="16" />
                </button>
                <button class="config-button" @click="animationRunning = !animationRunning">
                  <VueFeather :type="animationRunning ? 'pause-circle' : 'play-circle'" size="16" />
                </button>
                <button class="config-button" @click="animationStep(1)"
                  :class="(animationRunning || !canStep) && 'disabled'">
                  <VueFeather type="skip-forward" size="16" />
                </button>
                <button class="config-button" @click="animationSpeed(0.5)">
                  <VueFeather type="rewind" size="16" />
                </button>
                <button class="config-button" @click="animationSpeed(2)">
                  <VueFeather type="fast-forward" size="16" />
                </button>
                <span>
                  {{ (speed).toFixed(2) }}x
                </span>
              </template>
            </div>
          </div>
        </div>
      </template>
    </Collapsable>
    <div class="ranking-container">
      <span>{{ config.start }} - {{ curYear }}</span>
      <div class="loading-container" v-if="loading">
        <Spinner />
      </div>
      <canvas ref="rankingCanvas" class="ranking-canvas">
      </canvas>
    </div>
  </div>
</template>
<script setup lang="ts">
import DoubleRangeInput from '../components/DoubleRangeInput.vue';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import VueFeather from 'vue-feather';
import data from '../../dataExtractor/data.json';
import { eventIdToName, teamIdToColor, teamIdToName } from '../utils';
import { EventID, TeamID } from '../types';
import Collapsable from '../components/Collapsable.vue';
import Spinner from '../components/Spinner.vue';

const minYear = 1906;
const maxYear = 2025;

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
    { id: EventID.Gaucho, weight: 1 },
    { id: EventID.Carioca, weight: 1 },
    { id: EventID.Mineiro, weight: 1 },
    { id: EventID.Paulista, weight: 1 },
    { id: EventID.BrazilianCup, weight: 1 },
    { id: EventID.BrazilianLeague, weight: 1 },
    { id: EventID.BrazilianSuperCup, weight: 1 },
    { id: EventID.Sudamericana, weight: 1 },
    { id: EventID.Libertadores, weight: 1 },
    { id: EventID.Recopa, weight: 1 },
    { id: EventID.WorldCup, weight: 1 },
  ],
  setbacks: [
    { id: EventID.Relegation1, weight: 0 },
    { id: EventID.Relegation2, weight: 0 },
    { id: EventID.FailedPromotion, weight: 0 },
  ]
});

const isConfigOpen = ref(false);

const curYear = ref(maxYear);

const loading = ref(false);
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
        const weight = [...config.value.championships, ...config.value.setbacks].find(el => el.id === cur)?.weight ?? 1;
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
    rankingCanvas.value.width = rankingCanvas.value.clientWidth * devicePixelRatio;
    rankingCanvas.value.height = rankingCanvas.value.clientHeight * devicePixelRatio;

    const ctx = rankingCanvas.value.getContext('2d');
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
  }
}

function getCanvasWidth() {
  return rankingCanvas.value?.clientWidth ?? 0
}

function getCanvasHeight() {
  return rankingCanvas.value?.clientHeight ?? 0
}

const mImages = new Map<number, HTMLImageElement>();
let loaded = 0;

function loadIcons() {
  loading.value = true;
  config.value.clubs.forEach(club => {
    const img = new Image();
    img.src = `icons/${club.id}.png`;
    img.onload = async () => {
      loaded++;
      if (loaded === config.value.clubs.length && !animating.value) {
        await new Promise(res => setTimeout(res, 500));
        loading.value = false;
        resizeCanvas();
        draw(curYear.value)
      }
    }
    mImages.set(club.id, img);
  })
}

onBeforeMount(() => {
  window.addEventListener('resize', () => {
    resizeCanvas();
    draw(curYear.value)
  });
})

onMounted(() => {
  computeData();
  loadIcons();
});

const N_QTY_ENTITIES = 12;

async function draw(year: number) {
  const ctx = rankingCanvas.value?.getContext('2d');
  if (!ctx || loading.value) {
    return;
  }

  ctx.save();

  const width = getCanvasWidth();
  const height = getCanvasHeight();

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
  const personHeight = getCanvasHeight() / N_QTY_ENTITIES;
  const width = getCanvasWidth();

  const label = `${(teamIdToName(Number(item._id)))}`;

  //draw identifier
  const maxNameWidth = 180;
  const imgSize = 40;

  ctx.font = '16px "Source Sans 3"';
  ctx.textBaseline = 'middle'
  const nameWidth = ctx.measureText(label).width;
  ctx.fillStyle = '#000';
  const textY = personHeight * (i + 0.5);
  ctx.fillText(label, maxNameWidth - nameWidth - imgSize - paddingX, textY, maxNameWidth);

  //draw icon
  const img = mImages.get(Number(item._id));
  if (img) {
    const baseY = personHeight * i;
    const imgWidth = imgSize * img.naturalWidth / img.naturalHeight;
    const baseX = maxNameWidth - imgSize
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, baseX + (imgSize - imgWidth) / 2, baseY + (personHeight - imgSize) / 2, imgWidth, imgSize)
  }

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

const speed = ref(1);
function animationSpeed(value: number) {
  speed.value = Math.min(Math.max(speed.value * value, 0.5), 2);
}

async function animationLoop() {
  speed.value = 1;

  const firstYears = Object.values(rankingItems.value).map(item => Object.entries(item).find(([, value]) => value > 0)?.[0]).sort();
  curAnimationYear.value = firstYears?.[0] ? Number(firstYears[0]) : config.value.start;

  while (curAnimationYear.value < config.value.end) {
    curAnimationYear.value = await canRunAnimation();
    curYear.value = curAnimationYear.value;

    if (!animating.value) {
      create()
      break;
    }

    draw(curAnimationYear.value);

    await new Promise(res => setTimeout(res, 1000 / speed.value));
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

.ranking-config {
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-direction: column;
  gap: 10px;
  flex-wrap: wrap;
  background-color: white;
  padding: 10px;
  font-size: 12px;
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
  flex-direction: column;
  padding: 8px;
  border-radius: 5px;
}

.weight-field {
  display: flex;
  gap: 10px;
  padding: 4px 8px;
  align-items: center;
  border-radius: 5px;
  background-color: #f2f2f2;
}

.weight-input {
  all: unset;
  width: 60px;
  font: inherit;
  color: black;
  background: none;
  border: none;
  outline: none;
  box-sizing: border-box;
  padding: 4px;
  text-align: center;
  border-bottom: 2px solid #404040;
}

.config-label {
  font-weight: 600;
}

.config-options {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  background-color: white;
  border-radius: 5px;
}

.config-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
  background-color: #404040;
  color: white;
}

.filter-title {
  font-weight: bold;
}

.ranking-canvas {
  width: 100%;
  height: 600px;
}

.disabled {
  opacity: 0.6;
  cursor: auto;
}

.consider {
  background-color: #f2f2f2;
  color: black;
  border: 2px dashed #404040;
}

.unconsider {
  border: 2px solid #f2f2f2;
}

.config-header {
  background-color: white;
  padding: 8px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  gap: 20px
}

.config-icon {
  cursor: pointer;
}

.loading-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>