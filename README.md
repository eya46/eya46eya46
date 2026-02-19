## eya46.com

> .env

```env
WAKATIME_TOKEN=
HALO_URL=
HALO_TOKEN=
NEZHA_HOST=
```

```shell
docker run -d --name eya46eya46 -e WAKATIME_TOKEN= -e HALO_URL= -e HALO_TOKEN= -e NEZHA_HOST= -p 4321:4321 eya46/eya46eya46:latest

docker run -d --name eya46eya46 --env-file .env -p 4321:4321 eya46/eya46eya46:latest
```
