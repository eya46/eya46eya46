# k3s 部署

要求：服务器已安装 k3s，`kubectl get nodes` 可正常执行。没有独立 `kubectl` 时使用 `sudo k3s kubectl`。

## 1. 配置 Traefik 入口

模板默认使用 80。需要其他入口端口时，修改服务器副本中的 `ports.web.exposedPort`：

```sh
sudo install -d -m 700 /opt/eya46eya46/config
sudo cp deploy/k3s/traefik-config.example.yaml /opt/eya46eya46/config/traefik-config.yaml
sudoedit /opt/eya46eya46/config/traefik-config.yaml
```

应用配置：

```sh
kubectl apply -f /opt/eya46eya46/config/traefik-config.yaml
kubectl -n kube-system rollout status deployment/traefik --timeout=5m
kubectl -n kube-system get service traefik
```

用防火墙限制 Traefik 入口，只允许受信任的反向代理访问。

## 2. 创建 Secret

```sh
kubectl apply -f deploy/k3s/namespace.yaml
```

创建 `/opt/eya46eya46/config/app.env`，值不要加引号：

```env
WAKATIME_TOKEN=
HALO_URL=
HALO_TOKEN=
NEZHA_HOST=
UPTIME_KUMA_URL=
UPTIME_KUMA_SLUG=
```

```sh
sudo chmod 600 /opt/eya46eya46/config/app.env
kubectl -n eya46eya46 create secret generic eya46eya46-env \
  --from-env-file=/opt/eya46eya46/config/app.env \
  --dry-run=client -o yaml | kubectl apply -f -

sudo sh -c 'umask 077; openssl rand -hex 32 | tr -d "\n" > /opt/eya46eya46/config/webhook-token'
kubectl -n eya46eya46 create secret generic deploy-webhook-secret \
  --from-file=token=/opt/eya46eya46/config/webhook-token \
  --dry-run=client -o yaml | kubectl apply -f -
```

## 3. 部署

```sh
kubectl kustomize deploy/k3s
kubectl apply -k deploy/k3s
kubectl -n eya46eya46 rollout status deployment/eya46eya46 --timeout=5m
kubectl -n eya46eya46 get pods,service,ingress
```

## 4. 配置 CNB

启用自动部署时，在 `master.push[0]` 下添加：

```yaml
imports: https://cnb.cool/eya46/eya46eya46secrets/-/blob/main/envs.yml
```

并在该私密文件中配置：

```yaml
DEPLOY_WEBHOOK_URL: https://www.eya46.com/__deploy
DEPLOY_WEBHOOK_TOKEN: 与 /opt/eya46eya46/config/webhook-token 相同的值
```

未配置 `imports` 或 Webhook 变量时只构建镜像；配置后会继续调用 Webhook 发布。

## 5. 日常命令

```sh
# 状态
kubectl -n eya46eya46 get pods -w

# 日志
kubectl -n eya46eya46 logs deployment/eya46eya46 --tail=200
kubectl -n eya46eya46 logs deployment/deploy-webhook --tail=200

# 发布历史和回滚
kubectl -n eya46eya46 rollout history deployment/eya46eya46
kubectl -n eya46eya46 rollout undo deployment/eya46eya46
kubectl -n eya46eya46 rollout status deployment/eya46eya46 --timeout=5m

# 更新 app.env 后重新导入并重启
kubectl -n eya46eya46 create secret generic eya46eya46-env \
  --from-env-file=/opt/eya46eya46/config/app.env \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl -n eya46eya46 rollout restart deployment/eya46eya46
```
