<script setup lang="ts">
import { ref, computed } from "vue";
import { useNezha } from "../../composables/useNezha";
import type { NezhaData } from "../../types/nezha";
import { formatSpeed, barColor, formatBytes, formatUptime, formatTime, formatDateTime } from "../../utils/format";

const props = defineProps<{ preload?: NezhaData | null }>();

const { servers, total, online, offline, connected, updateTime } = useNezha(props.preload ?? undefined);

const currentDetailId = ref<number | null>(null);

const currentServer = computed(() => {
  if (currentDetailId.value === null) return null;
  return servers.value.find((s) => s.id === currentDetailId.value) ?? null;
});

const infoCards = computed(() => {
  const s = currentServer.value;
  if (!s) return [];
  const cpuNames = (s.cpuInfo || []).filter((c) => c).join(", ") || "-";
  const gpuNames = (s.gpuInfo || []).filter((g) => g).join(", ") || "-";
  return [
    { label: "状态", value: s.online ? "在线" : "离线" },
    { label: "运行时间", value: formatUptime(s.uptime) },
    ...(s.version ? [{ label: "Agent 版本", value: s.version }] : []),
    { label: "架构", value: `${s.platform} ${s.arch}` },
    { label: "内存总量", value: formatBytes(s.memTotal) },
    { label: "硬盘总量", value: formatBytes(s.diskTotal) },
    { label: "系统", value: s.platform && s.platformVersion ? `${s.platform} ${s.platformVersion}` : s.platform || "-" },
    { label: "CPU 型号", value: cpuNames },
    ...(gpuNames !== "-" ? [{ label: "GPU 型号", value: gpuNames }] : []),
    { label: "负载", value: `${s.load1.toFixed(2)} / ${s.load5.toFixed(2)} / ${s.load15.toFixed(2)}` },
    { label: "上传总流量", value: formatBytes(s.netInTransfer) },
    { label: "下载总流量", value: formatBytes(s.netOutTransfer) },
    { label: "TCP 连接", value: String(s.tcpConn) },
    { label: "UDP 连接", value: String(s.udpConn) },
    { label: "进程数", value: String(s.processCount) },
    { label: "启动时间", value: formatTime(s.bootTime) },
    { label: "最后活跃", value: s.lastActive ? formatDateTime(s.lastActive) : "-" },
  ];
});

const metricBars = computed(() => {
  const s = currentServer.value;
  if (!s || !s.online) return [];
  return [
    { label: "CPU", pct: s.cpu },
    { label: "内存", pct: s.memPct },
    { label: "硬盘", pct: s.diskPct },
    { label: "Swap", pct: s.swapPct },
  ];
});

function showDetail(id: number) {
  currentDetailId.value = id;
}

function goBack() {
  currentDetailId.value = null;
}
</script>

<template>
  <div class="space-y-4">
    <div class="-mt-4 flex items-baseline gap-x-1.5 overflow-hidden mb-4">
      <h2 class="shrink-0 text-xl font-bold flex items-center">
        <span class="mr-2 inline-block h-5 w-[4px] rounded-full bg-blue-500"></span>
        探针状态
      </h2>
      <span class="ml-auto min-w-0 shrink overflow-hidden text-sm whitespace-nowrap text-gray-500 select-none flex items-center gap-1">
        <span>{{ updateTime }}</span>
        <span class="h-2 w-2 rounded-full" :class="connected ? 'bg-green-500' : 'bg-gray-400'"></span>
      </span>
    </div>

    <!-- 概览卡片 -->
    <div class="grid grid-cols-3 gap-3">
      <div class="rounded-xl border border-white/20 bg-white/15 p-3 shadow-sm backdrop-blur-lg">
        <p class="text-sm text-gray-500">总数</p>
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-blue-500"></span>
          <span class="text-xl font-semibold">{{ total || "-" }}</span>
        </div>
      </div>
      <div class="rounded-xl border border-white/20 bg-white/15 p-3 shadow-sm backdrop-blur-lg">
        <p class="text-sm text-gray-500">在线</p>
        <div class="flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
          <span class="text-xl font-semibold">{{ online || "-" }}</span>
        </div>
      </div>
      <div class="rounded-xl border border-white/20 bg-white/15 p-3 shadow-sm backdrop-blur-lg">
        <p class="text-sm text-gray-500">离线</p>
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-red-500"></span>
          <span class="text-xl font-semibold">{{ offline || "-" }}</span>
        </div>
      </div>
    </div>

    <!-- 服务器列表 -->
    <template v-if="currentDetailId === null">
      <div class="grid gap-3 sm:grid-cols-2">
        <template v-if="servers.length">
          <div
            v-for="s in servers"
            :key="s.id"
            class="rounded-xl border border-white/20 bg-white/15 p-3 shadow-sm backdrop-blur-lg"
          >
            <div class="mb-2 flex items-center gap-2">
              <span class="h-2 w-2 rounded-full" :class="s.online ? 'bg-green-500' : 'bg-red-500'"></span>
              <span class="text-sm font-semibold">{{ s.name }}</span>
              <a
                class="ml-auto cursor-pointer text-sm text-blue-500 hover:underline hover:underline-offset-4"
                @click="showDetail(s.id)"
                >详情</a
              >
            </div>
            <template v-if="s.online">
              <div class="mb-2 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p class="text-gray-500">CPU</p>
                  <p class="font-semibold">{{ s.cpu.toFixed(1) }}%</p>
                  <div class="mt-1 h-1 rounded-full bg-gray-200">
                    <div
                      class="h-1 rounded-full"
                      :class="barColor(s.cpu)"
                      :style="{ width: Math.min(s.cpu, 100) + '%' }"
                    ></div>
                  </div>
                </div>
                <div>
                  <p class="text-gray-500">内存</p>
                  <p class="font-semibold">{{ s.memPct.toFixed(1) }}%</p>
                  <div class="mt-1 h-1 rounded-full bg-gray-200">
                    <div
                      class="h-1 rounded-full"
                      :class="barColor(s.memPct)"
                      :style="{ width: Math.min(s.memPct, 100) + '%' }"
                    ></div>
                  </div>
                </div>
                <div>
                  <p class="text-gray-500">硬盘</p>
                  <p class="font-semibold">{{ s.diskPct.toFixed(1) }}%</p>
                  <div class="mt-1 h-1 rounded-full bg-gray-200">
                    <div
                      class="h-1 rounded-full"
                      :class="barColor(s.diskPct)"
                      :style="{ width: Math.min(s.diskPct, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="flex gap-3 text-xs text-gray-500">
                <span>&uarr; {{ formatSpeed(s.netOutSpeed) }}</span>
                <span>&darr; {{ formatSpeed(s.netInSpeed) }}</span>
              </div>
            </template>
            <p v-else class="text-xs text-gray-400">离线</p>
          </div>
        </template>
        <div
          v-else
          class="rounded-xl border border-white/20 bg-white/15 p-6 text-center text-gray-400 shadow-sm backdrop-blur-lg sm:col-span-2"
        >
          数据加载中...
        </div>
      </div>
    </template>

    <!-- 服务器详情 -->
    <template v-else>
      <div v-if="currentServer">
        <div class="mb-4 flex items-center gap-3">
          <a class="cursor-pointer text-sm text-blue-500 hover:underline hover:underline-offset-4" @click="goBack">
            返回
          </a>
          <span class="text-lg font-semibold">{{ currentServer.name }}</span>
          <span v-if="currentServer.online" class="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
            在线
          </span>
          <span v-else class="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">离线</span>
        </div>

        <div class="flex flex-wrap gap-3">
          <div
            v-for="(card, i) in infoCards"
            :key="i"
            class="min-w-35 rounded-xl border border-white/20 bg-white/15 p-3 shadow-sm backdrop-blur-lg"
          >
            <p class="mb-1 text-xs text-gray-500">{{ card.label }}</p>
            <p class="text-sm font-semibold break-all">{{ card.value }}</p>
          </div>
        </div>

        <div
          v-if="metricBars.length"
          class="mt-4 rounded-xl border border-white/20 bg-white/15 p-4 shadow-sm backdrop-blur-lg"
        >
          <p class="mb-3 text-sm font-semibold">实时指标</p>
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="(bar, i) in metricBars" :key="i">
              <div class="mb-1 flex justify-between text-xs">
                <span class="text-gray-500">{{ bar.label }}</span>
                <span class="font-semibold">{{ bar.pct.toFixed(1) }}%</span>
              </div>
              <div class="h-2 rounded-full bg-gray-200">
                <div
                  class="h-2 rounded-full"
                  :class="barColor(bar.pct)"
                  :style="{ width: Math.min(bar.pct, 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
          <div class="mt-3 flex gap-4 text-xs text-gray-500">
            <span>&uarr; {{ formatSpeed(currentServer.netOutSpeed) }}</span>
            <span>&darr; {{ formatSpeed(currentServer.netInSpeed) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
