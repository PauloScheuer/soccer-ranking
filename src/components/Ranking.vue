<template #content>
  <h1 class="ranking-title">Ranking</h1>
  <h2 class="ranking-subtitle">Visualize os times com mais títulos, por intervalo de anos</h2>
  <div class="ranking-content">
    <div class="ranking-config">
      <div class="config-field">
        <span class="config-label">Anos considerados:</span>
        <DoubleRangeInput :min="minYear" :max="maxYear" :disabled="actionsDisabled"
          :class="actionsDisabled && 'disabled'" @change="handleYearRangeChange" />
      </div>
      <div class="config-field">
        <span class="config-button" :class="actionsDisabled && 'disabled'" @click="animate">Consultar
        </span>
        <template v-if="animating">
          <span class="config-button" @click="animationStep(-1)" :class="(animationRunning || !canStep) && 'disabled'">
            <VueFeather type="skip-back" size="16" />
          </span>
          <span class="config-button" @click="stopAnimation()">
            <VueFeather type="stop-circle" size="16" />
          </span>
          <span class="config-button" @click="animationRunning = !animationRunning">
            <VueFeather :type="animationRunning ? 'pause-circle' : 'play-circle'" size="16" />
          </span>
          <span class="config-button" @click="animationStep(1)" :class="(animationRunning || !canStep) && 'disabled'">
            <VueFeather type="skip-forward" size="16" />
          </span>
        </template>
      </div>
    </div>
    <div class="ranking-container">
      <span>{{ config.start }} - {{ curYear }}</span>
      <canvas ref="rankingCanvas" class="ranking-canvas" :width="chartWidth" :height="chartHeight"
        @mousemove="handleMouseMove">
      </canvas>
    </div>
  </div>
</template>
<script setup lang="ts">
import DoubleRangeInput from './DoubleRangeInput.vue';
import { computed, onMounted, ref } from 'vue';
import VueFeather from 'vue-feather';
import data from '../../dataExtractor/data.json';
import { teamIdToName } from '../utils';

const minYear = 1900;
const maxYear = 2024;

const chartWidth = ref(0);
const chartHeight = ref(0);

const rankingCanvas = ref(null as HTMLCanvasElement | null);

const config = ref({
  start: minYear,
  end: maxYear
});

const curYear = ref(maxYear);

const loading = ref(false);
const animating = ref(false);
const animationRunning = ref(false);

const actionsDisabled = computed(() => {
  return loading.value || animating.value;
})


type TitlesByYear = { [year: string]: number };
type TeamsTitles = { [team: string]: TitlesByYear };
type RankingItem = { _id: string, pos: number, total: number }

const rankingItems = ref<TeamsTitles>({});

let drawStates = new Map<string, { pos: number, appearances: number }>();

async function handleYearRangeChange(low: number, high: number) {
  if (actionsDisabled.value) {
    return
  }

  config.value.start = low;
  config.value.end = high;
}
function fetchCompleteRanking() {
  drawStates.clear();
  const raw = data;
  const acc: TeamsTitles = {};
  Object.entries(raw).forEach(([team, titles]: [string, { [key: string]: number[] }]) => {
    const accTitles: [string, number][] = [];
    for (let year = config.value.start; year <= config.value.end; year++) {
      const pastTitles = accTitles.at(-1)?.[1] ?? 0;
      const curTitles = titles[year]?.length ?? 0;
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
    chartWidth.value = sizes.width;
    chartHeight.value = sizes.height;
  }
}

onMounted(() => {
  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
    redraw();
  });
});

const N_MAX_NAME_WIDTH = 220;

async function draw(year: number) {
  const ctx = rankingCanvas.value?.getContext('2d');
  if (!ctx) {
    return;
  }

  const width = chartWidth.value;
  const height = chartHeight.value;
  const items: { _id: string, pos: number, total: number }[] = Object.entries(rankingItems.value).map(([team, titles]) => {
    return { _id: team, pos: year, total: titles[year] ?? 0 }
  }).sort((a, b) => b.total - a.total);

  ctx.font = '12px sans-serif';
  const maxNameWidth = N_MAX_NAME_WIDTH;
  const maxAppearances = Math.max(...items.map(item => item.total));

  const countSteps = 20;
  const steps = new Array(countSteps).fill(0).map((_, i) => i + 1);
  for await (const step of steps) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    items.forEach(async (item, i) => {
      const lastState = drawStates.get(item._id);
      const lastPos = lastState?.pos ?? 21;
      const lastAppearances = lastState?.appearances ?? 0

      const diffPos = lastPos - i;
      const stepIndex = lastPos - diffPos * step / countSteps;

      const diffAppearances = lastAppearances - item.total;
      const stepAppearances = lastAppearances - diffAppearances * step / countSteps;
      drawElementAtPos(ctx, item, stepIndex, stepAppearances, maxNameWidth, maxAppearances);
    });

    await new Promise(res => setTimeout(res, 16));
  }

  drawStates.clear();
  items.forEach((item, i) => {
    drawStates.set(item._id, { pos: i, appearances: item.total });
  })
}

function drawElementAtPos(ctx: CanvasRenderingContext2D, item: RankingItem, i: number, appearances: number, maxNameWidth: number, maxAppearances: number) {
  const padding = 4;
  const qtySpace = 20;
  const personHeight = chartHeight.value / 20;
  const width = chartWidth.value;

  const label = `${Math.round(i + 1)}º - ${(teamIdToName(Number(item._id)))}`
  const nameWidth = ctx.measureText(label).width;
  ctx.fillStyle = '#000';
  const textY = personHeight * (i + 0.5) + 12 / 2;
  ctx.fillText(label, maxNameWidth - nameWidth, textY, maxNameWidth);

  const maxWidth = width - maxNameWidth - qtySpace - padding;
  const fixedWidth = maxWidth * (appearances / maxAppearances);
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.roundRect(maxNameWidth + padding, personHeight * i + padding, fixedWidth, personHeight - padding * 2, 5);
  ctx.fill();
  ctx.closePath();

  ctx.fillText(`${Math.round(appearances)}`, maxNameWidth + padding * 2 + fixedWidth, textY);
}

const curAnimationIndex = ref(0);
const canStep = ref(true);

async function canRunAnimation() {
  const originalIndex = curAnimationIndex.value;
  let interval = 0;

  canStep.value = true;
  const newIndex = await new Promise<number>((res) => {
    interval = window.setInterval(() => {
      if (!animating.value) {
        return res(-1);
      }
      if (originalIndex !== curAnimationIndex.value) {
        return res(curAnimationIndex.value)
      }
      if (animationRunning.value) {
        res(originalIndex + 1)
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

  const newIndex = curAnimationIndex.value + value;
  curAnimationIndex.value = Math.max(newIndex, 0);
}

async function animationLoop() {
  curAnimationIndex.value = -1;

  for (let i = config.value.start; i <= config.value.end; i++) {
    curYear.value = i;
    curAnimationIndex.value = await canRunAnimation();

    draw(i);

    await new Promise(res => setTimeout(res, 1000));
  }
}

async function animate() {
  if (loading.value) {
    return;
  }

  fetchCompleteRanking();
  animating.value = true;
  animationRunning.value = true;
  await animationLoop();
  animating.value = false;
  animationRunning.value = false;
}

async function stopAnimation() {
  animating.value = false;
}

function redraw() {
  // requestAnimationFrame(() => draw());
}

let curHovered = -1;

function handleMouseMove(event: MouseEvent) {
  if (animating.value) {
    curHovered = -1;
    return;
  }

  const y = event.offsetY;

  curHovered = Math.floor((y / chartHeight.value) * 20);
}

</script>
<style scoped>
.ranking-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ranking-container {
  height: fit-content;
  border-radius: 8px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  background-color: white;
  padding: 20px;
}

.ranking-config {
  border-radius: 8px;
  box-shadow: var(--shadow);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  background-color: white;
  padding: 20px;
}

.ranking-title {
  color: var(--primary-color);
  font-size: var(--font-size-title);
  font-weight: bold;
  margin-bottom: 4px;
}

.ranking-subtitle {
  color: var(--dark-color);
  font-size: var(--font-size-subtitle);
  margin-bottom: 16px;
}

.config-field {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.config-label {}

.config-button {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: var(--grey-color);
  padding: 8px;
  border-radius: 5px;
  cursor: pointer;
}

.filter-title {
  font-weight: bold;
}

.ranking-canvas {
  width: 100%;
  height: 800px;
  cursor: pointer;
}

.disabled {
  opacity: 0.6;
  cursor: auto;
}
</style>