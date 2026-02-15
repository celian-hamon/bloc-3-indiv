.PHONY: start stop restart build test lint format logs clean \
       test-local lint-fix format-check ci coverage security \
       minikube-start minikube-build k8s-apply k8s-delete k8s-status k8s-logs

# ─────────────────────────────────────────────
# Docker Compose (local development)
# ─────────────────────────────────────────────
start:
	docker compose up -d --build

stop:
	docker compose down

restart:
	docker compose down
	docker compose up -d --build

build:
	docker compose build

logs:
	docker compose logs -f

clean:
	docker compose down -v

# ─────────────────────────────────────────────
# Test & Quality
# ─────────────────────────────────────────────
test:
	docker compose exec web pytest tests/ -v

test-local:
	pytest tests/ -v

coverage:
	pytest tests/ -v --cov=app --cov-report=term-missing

lint:
	python -m ruff check app/ tests/

lint-fix:
	python -m ruff check app/ tests/ --fix

format:
	python -m ruff format app/ tests/

format-check:
	python -m ruff format --check app/ tests/

security:
	pip-audit -r requirements.txt

# ─────────────────────────────────────────────
# All checks (mirrors CI pipeline)
# ─────────────────────────────────────────────
ci: lint format-check security test-local

# ─────────────────────────────────────────────
# Minikube / Kubernetes
# ─────────────────────────────────────────────
minikube-start:
	minikube status || minikube start

minikube-build:
	@echo "Building Docker image inside Minikube..."
	eval $$(minikube docker-env) && docker build -t collector-api:latest .

k8s-apply:
	kubectl apply -f k8s/namespace.yml
	kubectl apply -f k8s/configmap.yml
	kubectl apply -f k8s/secret.yml
	kubectl apply -f k8s/postgres.yml
	kubectl apply -f k8s/app.yml

k8s-delete:
	kubectl delete -f k8s/app.yml --ignore-not-found
	kubectl delete -f k8s/postgres.yml --ignore-not-found
	kubectl delete -f k8s/secret.yml --ignore-not-found
	kubectl delete -f k8s/configmap.yml --ignore-not-found
	kubectl delete -f k8s/namespace.yml --ignore-not-found

k8s-status:
	kubectl get all -n collector

k8s-logs:
	kubectl logs -n collector -l app=collector-api --tail=100 -f

k8s-url:
	minikube service collector-api -n collector --url
