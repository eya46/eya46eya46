## eya46.com

k3s 部署、滚动更新和 Webhook 配置见 [deploy/k3s/README.md](deploy/k3s/README.md)。

> .env

```env
WAKATIME_TOKEN=
HALO_URL=
HALO_TOKEN=
NEZHA_HOST=
UPTIME_KUMA_URL=
UPTIME_KUMA_SLUG=
```

```shell
docker run -d --name eya46eya46 -e WAKATIME_TOKEN= -e HALO_URL= -e HALO_TOKEN= -e NEZHA_HOST= -e UPTIME_KUMA_URL= -e UPTIME_KUMA_SLUG= -p 4321:4321 eya46/eya46eya46:latest

docker run -d --name eya46eya46 --env-file .env -p 4321:4321 eya46/eya46eya46:latest
```
