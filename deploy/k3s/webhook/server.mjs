import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";

const port = Number(process.env.PORT ?? "8080");
const deployPath = process.env.DEPLOY_PATH ?? "/__deploy";
const deploymentName = process.env.TARGET_DEPLOYMENT ?? "eya46eya46";
const containerName = process.env.TARGET_CONTAINER ?? "app";
const imageRepository = requireEnv("ALLOWED_IMAGE_REPOSITORY");
const webhookToken = requireEnv("DEPLOY_WEBHOOK_TOKEN");
const rolloutTimeoutMs = Number(process.env.ROLLOUT_TIMEOUT_MS ?? "210000");
const namespace = requireEnv("POD_NAMESPACE");
const apiHost = requireEnv("KUBERNETES_SERVICE_HOST");
const apiPort = process.env.KUBERNETES_SERVICE_PORT_HTTPS ?? "443";
const deploymentPath = `/apis/apps/v1/namespaces/${encodeURIComponent(namespace)}/deployments/${encodeURIComponent(deploymentName)}`;
const imagePattern = new RegExp(`^${escapeRegExp(imageRepository)}:[0-9a-f]{40}$`);
const commitPattern = /^[0-9a-f]{40}$/;

let deploymentInProgress = false;
const jobs = new Map();

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://deploy-webhook");

  if (request.method === "GET" && url.pathname === "/healthz") {
    return sendJson(response, 200, { status: "ok" });
  }

  const statusPrefix = `${deployPath}/status/`;
  if (request.method === "GET" && url.pathname.startsWith(statusPrefix)) {
    if (!isAuthorized(request.headers.authorization)) {
      return sendJson(response, 401, { error: "unauthorized" });
    }

    const commit = url.pathname.slice(statusPrefix.length);
    if (!commitPattern.test(commit)) {
      return sendJson(response, 400, { error: "invalid commit SHA" });
    }

    const job = jobs.get(`${imageRepository}:${commit}`);
    if (!job) return sendJson(response, 404, { error: "deployment job was not found" });
    return sendJson(
      response,
      job.status === "running" ? 202 : job.status === "deployed" || job.status === "unchanged" ? 200 : 500,
      job
    );
  }

  if (request.method !== "POST" || url.pathname !== deployPath) {
    return sendJson(response, 404, { error: "not found" });
  }

  if (!isAuthorized(request.headers.authorization)) {
    return sendJson(response, 401, { error: "unauthorized" });
  }

  if (deploymentInProgress) {
    return sendJson(response, 409, { error: "another deployment is in progress" });
  }

  try {
    const payload = JSON.parse(await readBody(request));
    const image = payload?.image;
    if (typeof image !== "string" || !imagePattern.test(image)) {
      return sendJson(response, 400, {
        error: `image must match ${imageRepository}:<40-character commit SHA>`,
      });
    }

    deploymentInProgress = true;
    setJob(image, { status: "running", image });
    void deployImage(image)
      .then((job) => setJob(image, job))
      .finally(() => {
        deploymentInProgress = false;
      });

    return sendJson(response, 202, { status: "accepted", image });
  } catch (error) {
    return sendJson(response, 400, { error: errorMessage(error) });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`[deploy] webhook listening on :${port}${deployPath}`);
});

async function deployImage(image) {
  let previousImage;
  let updateStarted = false;

  try {
    const currentDeployment = await kubernetesRequest(deploymentPath);
    previousImage = getContainerImage(currentDeployment);

    if (previousImage === image) return { status: "unchanged", image };

    console.log(`[deploy] ${previousImage} -> ${image}`);
    const updatedDeployment = await patchImage(image, `Webhook deploy ${image}`);
    updateStarted = true;
    await waitForRollout(updatedDeployment.metadata.generation, rolloutTimeoutMs);

    console.log(`[deploy] rollout completed: ${image}`);
    return { status: "deployed", image };
  } catch (error) {
    console.error("[deploy] rollout failed:", error);

    if (updateStarted && previousImage) {
      try {
        console.warn(`[deploy] rolling back to ${previousImage}`);
        const rollbackDeployment = await patchImage(previousImage, `Automatic rollback to ${previousImage}`);
        await waitForRollout(rollbackDeployment.metadata.generation, rolloutTimeoutMs);
        return {
          error: errorMessage(error),
          status: "rolled_back",
          image: previousImage,
        };
      } catch (rollbackError) {
        console.error("[deploy] rollback failed:", rollbackError);
        return {
          error: errorMessage(error),
          status: "rollback_failed",
          rollbackError: errorMessage(rollbackError),
        };
      }
    }

    return { status: "failed", image, error: errorMessage(error) };
  }
}

function setJob(image, job) {
  jobs.delete(image);
  jobs.set(image, job);
  if (jobs.size > 20) jobs.delete(jobs.keys().next().value);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function readText(path) {
  const { readFile } = await import("node:fs/promises");
  return (await readFile(path, "utf8")).trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isAuthorized(authorization) {
  if (!authorization) return false;
  const actual = Buffer.from(authorization);
  const expected = Buffer.from(`Bearer ${webhookToken}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function readBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > 4096) throw new Error("request body is too large");
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function getContainerImage(deployment) {
  const container = deployment.spec?.template?.spec?.containers?.find((item) => item.name === containerName);
  if (!container?.image) throw new Error(`container ${containerName} was not found`);
  return container.image;
}

async function patchImage(image, changeCause) {
  return kubernetesRequest(deploymentPath, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/strategic-merge-patch+json",
    },
    body: JSON.stringify({
      metadata: {
        annotations: {
          "kubernetes.io/change-cause": changeCause,
        },
      },
      spec: {
        template: {
          spec: {
            containers: [{ name: containerName, image }],
          },
        },
      },
    }),
  });
}

async function waitForRollout(generation, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const deployment = await kubernetesRequest(deploymentPath);
    const desired = deployment.spec?.replicas ?? 1;
    const status = deployment.status ?? {};
    const progressDeadlineExceeded = status.conditions?.some(
      (condition) => condition.type === "Progressing" && condition.reason === "ProgressDeadlineExceeded"
    );

    if (progressDeadlineExceeded) throw new Error("deployment exceeded its progress deadline");

    if (
      status.observedGeneration >= generation &&
      status.updatedReplicas === desired &&
      status.readyReplicas === desired &&
      status.availableReplicas === desired &&
      (status.unavailableReplicas ?? 0) === 0
    ) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`deployment did not become ready within ${timeoutMs}ms`);
}

async function kubernetesRequest(path, init = {}) {
  // Projected ServiceAccount tokens rotate, so read the current token for every request.
  const serviceAccountToken = await readText("/var/run/secrets/kubernetes.io/serviceaccount/token");
  const response = await fetch(`https://${apiHost}:${apiPort}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${serviceAccountToken}`,
      Accept: "application/json",
      ...init.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Kubernetes API ${response.status}: ${data.message ?? response.statusText}`);
  }
  return data;
}
