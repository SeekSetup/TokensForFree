APP := CLIProxyAPIPlus

.PHONY: run build test fmt tidy web-dev web-build web-build-embed

run:
	go run ./cmd/server

build:
	go build -o ./bin/$(APP) ./cmd/server

test:
	go test ./...

fmt:
	go fmt ./...

tidy:
	go mod tidy

web-dev:
	npm --prefix ./web run dev

web-build:
	npm --prefix ./web run build

web-build-embed:
	npm --prefix ./web run build:embed
