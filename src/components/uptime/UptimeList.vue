<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { UptimeData } from '../../types/uptime';

const props = defineProps<{
  initialData: UptimeData | null;
  title: string;
}>();

const data = ref<UptimeData | null>(props.initialData);
const loading = ref(false);

// 辅助函数：获取形如 "4-6 19h" 或 "19h" 的简单时间格式
const formatSimpleTime = () => {
  const d = new Date();
  // 您可以根据喜好调整，这里我们只取 "日-时" 格式类似首页的显示，
  // 为了简单，我们先显示完整的小时分钟，或者保持简洁
  return `${d.getHours()}h${d.getMinutes()}m`;
};

const lastUpdate = ref(formatSimpleTime());
const countdown = ref(15);
let pollInterval: ReturnType<typeof setInterval> | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;

const fetchData = async () => {
  try {
    const res = await fetch('/api/uptime');
    if (res.ok) {
      const json = await res.json();
      if (json) {
        data.value = json;
        lastUpdate.value = formatSimpleTime();
      }
    }
  } catch (error) {
    console.error('Failed to fetch uptime data:', error);
  } finally {
    countdown.value = 15; // 重置倒计时
  }
};

onMounted(() => {
  // 每 15 秒前端轮询一次
  pollInterval = setInterval(fetchData, 15000);
  
  // 每 1 秒更新一次倒计时
  countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    }
  }, 1000);
});

onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>

<template>
  <div>
    <!-- 顶部标题和倒计时 -->
    <div class="flex items-center gap-x-1.5 overflow-hidden mb-4">
      <h2 class="shrink-0 text-xl font-black text-gray-600 select-none flex items-center">
        <span class="mr-2 inline-block h-5 w-[4px] shrink-0 rounded-full bg-blue-500"></span>
        {{ title }}
      </h2>
      
      <div class="ml-auto flex items-center gap-3">
        <span class="min-w-0 shrink overflow-hidden text-sm whitespace-nowrap text-gray-500 select-none flex items-center gap-1">
          <span>{{ countdown }}s</span>
          <svg class="size-[1rem]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"><path d="M6.64 9.788a.75.75 0 0 1 .53.918a5 5 0 0 0 7.33 5.624a.75.75 0 1 1 .75 1.3a6.501 6.501 0 0 1-9.529-7.312a.75.75 0 0 1 .919-.53M8.75 6.37a6.5 6.5 0 0 1 9.529 7.312a.75.75 0 1 1-1.45-.388A5.001 5.001 0 0 0 9.5 7.67a.75.75 0 1 1-.75-1.3"/><path d="M5.72 9.47a.75.75 0 0 1 1.06 0l2.5 2.5a.75.75 0 1 1-1.06 1.06l-1.97-1.97l-1.97 1.97a.75.75 0 0 1-1.06-1.06zm9 1.5a.75.75 0 0 1 1.06 0l1.97 1.97l1.97-1.97a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 0-1.06"/></g></svg>
          <span>{{ lastUpdate }}</span>
        </span>
      </div>
    </div>
    
    <template v-if="data">
      <div class="space-y-5">
        <template v-for="group in data.publicGroupList" :key="group.id">
          <!-- 这里假设服务组有多个，可以不显示组名，或者作为提示信息 -->
          <div
            v-for="monitor in group.monitorList"
            :key="monitor.id"
            class="rounded-xl border border-white/20 bg-white/15 p-3 shadow-sm backdrop-blur-lg transition-transform hover:scale-[1.02]"
          >
            <!-- 卡片标题栏 -->
            <div class="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
              <h3 class="text-lg font-bold text-gray-800 flex items-center">
                {{ monitor.name }}
              </h3>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1">
                  <span
                    class="h-2 w-2 rounded-full"
                    :class="{
                      'bg-green-500': monitor.status === 1,
                      'bg-red-500': monitor.status === 0,
                      'bg-yellow-500': monitor.status === 2,
                      'bg-blue-500': monitor.status === 3,
                      'bg-gray-400': ![0, 1, 2, 3].includes(monitor.status ?? -1),
                    }"
                  ></span>
                  <span
                    class="text-sm font-semibold"
                    :class="{
                      'text-green-600': monitor.status === 1,
                      'text-red-600': monitor.status === 0,
                      'text-yellow-600': monitor.status === 2,
                      'text-blue-600': monitor.status === 3,
                      'text-gray-600': ![0, 1, 2, 3].includes(monitor.status ?? -1),
                    }"
                  >
                    {{
                      monitor.status === 1
                        ? '在线'
                        : monitor.status === 0
                          ? '离线'
                          : monitor.status === 2
                            ? '挂起'
                            : monitor.status === 3
                              ? '维护'
                              : '未知'
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 卡片内容区 -->
            <div class="flex justify-between text-sm text-gray-600 mb-3 px-1">
              <span>{{ monitor.ping !== undefined && monitor.ping !== null ? `Ping 延迟: ${monitor.ping} ms` : 'Ping: -' }}</span>
              <span class="font-medium">{{ monitor.uptime24h !== undefined ? `24小时可用率: ${(monitor.uptime24h * 100).toFixed(2)}%` : '可用率: -' }}</span>
            </div>
            
            <!-- 瓷砖图 -->
            <div class="flex h-8 w-full gap-1 overflow-hidden rounded px-1">
              <div
                v-for="(_, i) in 40"
                :key="i"
                class="flex-1 transition-opacity hover:opacity-80 rounded-sm"
                :class="[
                  (monitor.heartbeats && monitor.heartbeats[monitor.heartbeats.length - 40 + i])
                    ? (monitor.heartbeats[monitor.heartbeats.length - 40 + i].status === 1
                        ? 'bg-green-500'
                        : monitor.heartbeats[monitor.heartbeats.length - 40 + i].status === 0
                          ? 'bg-red-500'
                          : monitor.heartbeats[monitor.heartbeats.length - 40 + i].status === 2
                            ? 'bg-yellow-500'
                            : monitor.heartbeats[monitor.heartbeats.length - 40 + i].status === 3
                              ? 'bg-blue-500'
                              : 'bg-gray-300/50')
                    : 'bg-gray-300/50'
                ]"
                :title="
                  (monitor.heartbeats && monitor.heartbeats[monitor.heartbeats.length - 40 + i])
                    ? `${monitor.heartbeats[monitor.heartbeats.length - 40 + i].time} - ${
                        monitor.heartbeats[monitor.heartbeats.length - 40 + i].status === 1 ? '在线' : 
                        monitor.heartbeats[monitor.heartbeats.length - 40 + i].status === 0 ? '离线' : 
                        monitor.heartbeats[monitor.heartbeats.length - 40 + i].status === 2 ? '挂起' : 
                        monitor.heartbeats[monitor.heartbeats.length - 40 + i].status === 3 ? '维护' : '未知'
                      } ${monitor.heartbeats[monitor.heartbeats.length - 40 + i].ping ? `(${monitor.heartbeats[monitor.heartbeats.length - 40 + i].ping}ms)` : ''}`
                    : '无数据'
                "
              ></div>
            </div>
          </div>
        </template>
      </div>
    </template>
    <template v-else>
      <div class="mt-4 text-center text-gray-600">
        <p>暂无数据或无法连接到监控服务。</p>
      </div>
    </template>
  </div>
</template>
