import { ref, onMounted, onUnmounted } from "vue";
import dayjs from "dayjs";
import type { ProcessedServer, NezhaRawData, NezhaData } from "../types/nezha";
import { processRawData } from "../utils/nezha-process";

const WS_PATH = "/api/v1/ws/server";
const MAX_RETRY = 30;
const RETRY_INTERVAL = 3000;

export function useNezha(initial?: NezhaData) {
  const servers = ref<ProcessedServer[]>(initial?.servers ?? []);
  const total = ref(initial?.total ?? 0);
  const online = ref(initial?.online ?? 0);
  const offline = ref(initial?.offline ?? 0);
  const connected = ref(false);
  const updateTime = ref(initial ? new Date().toLocaleTimeString("zh-CN", { hour12: false }) : "");

  let ws: WebSocket | null = null;
  let retryCount = 0;
  let closed = false;

  function handleMessage(raw: NezhaRawData) {
    const data = processRawData(raw);
    servers.value = data.servers;
    total.value = data.total;
    online.value = data.online;
    offline.value = data.offline;
    updateTime.value = dayjs().format("HH:mm:ss");
  }

  function disconnect() {
    closed = true;
    if (ws) {
      ws.onclose = null;
      ws.close();
      ws = null;
    }
  }

  function connect() {
    disconnect();
    closed = false;
    retryCount = 0;

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${location.host}${WS_PATH}`;

    function doConnect() {
      if (closed) return;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        retryCount = 0;
        connected.value = true;
      };

      ws.onmessage = (ev) => {
        try {
          handleMessage(JSON.parse(ev.data));
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        connected.value = false;
        if (!closed && retryCount < MAX_RETRY) {
          retryCount++;
          setTimeout(doConnect, RETRY_INTERVAL);
        }
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    doConnect();
  }

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    disconnect();
  });

  return { servers, total, online, offline, connected, updateTime };
}
