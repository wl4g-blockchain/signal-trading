# The Signal Trading

> A fully customizable trading AI based strategies workflow platform.

## Features

- [x] Unified and fully customizable AI based trading strategy workflow.
- [] Rich trading strategy workflow template market.
- [] Smooth historical data backtesting simulation trading service.
- [] Detailed trading strategy execution performance report.

## Development

- [Develop of Frontend](./frontend/README.md)
- [Develop of Contracts](./contracts/README.md)
- [Develop of Backend](./backend/README.md)

## Installation

### With Docker Compose (TODO)

```bash
cd ./tools/deploy/docker
docker-compose up -d
```

### With Helm (TODO)

```bash
cd ./tools/deploy/helm
helm -n signal-trading upgrade -i --create-namespace \
signal-trading \
--set image.repository=wl4g/signal-trading
--set image.tag=latest \
./signal-trading
```
