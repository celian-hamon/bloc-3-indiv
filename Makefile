.PHONY: start stop restart build test lint format logs clean \
       test-local lint-fix format-check ci coverage security \
       minikube-start minikube-build k8s-apply k8s-delete k8s-status k8s-logs \
       monitoring-apply monitoring-delete monitoring-status \
       tls-generate traefik-apply traefik-delete \
       deploy-all destroy-all \
       load-test load-test-gui load-test-clean

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
	docker compose exec web pytest . -v

test-local:
	cd backend && pytest tests/ -v

coverage:
	cd backend && pytest tests/ -v --cov=app --cov-report=term-missing

lint:
	cd backend && python3 -m ruff check app/ tests/

lint-fix:
	cd backend && python3 -m ruff check app/ tests/ --fix

format:
	cd backend && python3 -m ruff format app/ tests/

format-check:
	cd backend && python3 -m ruff format --check app/ tests/

security:
	cd backend && pip-audit -r requirements.txt

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
	minikube image build -t collector-api:latest ./backend
	minikube image build -t collector-frontend:latest ./frontend

k8s-apply:
	kubectl apply -f k8s/namespace.yml
	kubectl apply -f k8s/configmap.yml
	kubectl apply -f k8s/secret.yml
	kubectl apply -f k8s/postgres.yml
	kubectl apply -f k8s/app.yml
	kubectl apply -f k8s/frontend.yml

k8s-delete:
	kubectl delete -f k8s/frontend.yml --ignore-not-found
	kubectl delete -f k8s/app.yml --ignore-not-found
	kubectl delete -f k8s/postgres.yml --ignore-not-found
	kubectl delete -f k8s/secret.yml --ignore-not-found
	kubectl delete -f k8s/configmap.yml --ignore-not-found
	kubectl delete -f k8s/namespace.yml --ignore-not-found

k8s-status:
	kubectl get all -n collector

k8s-logs:
	kubectl logs -n collector -l app=collector-api --tail=100 -f

# ─────────────────────────────────────────────
# TLS — Self-signed certificate (dev/Minikube)
# ─────────────────────────────────────────────
tls-generate:
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
		-keyout k8s/tls.key -out k8s/tls.crt \
		-subj "/CN=collector.local" \
		-addext "subjectAltName=DNS:collector.local,DNS:grafana.collector.local,DNS:prometheus.collector.local,DNS:app.celianhamon.fr"
	kubectl create secret tls collector-tls \
		--cert=k8s/tls.crt --key=k8s/tls.key \
		-n collector --dry-run=client -o yaml | kubectl apply -f -
	@echo TLS certificate created and applied.

# ─────────────────────────────────────────────
# Traefik Ingress Controller
# ─────────────────────────────────────────────
traefik-apply:
	kubectl apply -f k8s/traefik.yml
	kubectl apply -f k8s/ingress.yml

traefik-delete:
	kubectl delete -f k8s/ingress.yml --ignore-not-found
	kubectl delete -f k8s/traefik.yml --ignore-not-found

# ─────────────────────────────────────────────
# Monitoring (Prometheus + Grafana)
# ─────────────────────────────────────────────
monitoring-apply:
	kubectl apply -f k8s/prometheus.yml
	kubectl apply -f k8s/grafana-dashboards.yml
	kubectl apply -f k8s/grafana.yml

monitoring-delete:
	kubectl delete -f k8s/grafana.yml --ignore-not-found
	kubectl delete -f k8s/grafana-dashboards.yml --ignore-not-found
	kubectl delete -f k8s/prometheus.yml --ignore-not-found

monitoring-status:
	kubectl get pods -n collector
	kubectl get svc -n collector

# ─────────────────────────────────────────────
# Full deploy (app + monitoring + ingress)
# ─────────────────────────────────────────────
k8s-start: minikube-start minikube-build k8s-apply monitoring-apply tls-generate traefik-apply
	@echo ──────────────────────────────────────
	@echo Deployment complete. Waiting for pods...
	@echo ──────────────────────────────────────
	kubectl wait --for=condition=ready pod -l app=postgres -n collector --timeout=60s
	kubectl wait --for=condition=ready pod -l app=collector-api -n collector --timeout=60s
	kubectl get all -n collector
	@echo ──────────────────────────────────────
	@echo Access via:
	@echo   API:        https://collector.local:30443
	@echo   Grafana:    https://grafana.collector.local:30443
	@echo   Prometheus: https://prometheus.collector.local:30443
	@echo   Traefik:    http://collector.local:30088/dashboard/
	@echo ──────────────────────────────────────

deploy-all: k8s-apply monitoring-apply tls-generate traefik-apply

destroy-all:
	kubectl delete -f k8s/ingress.yml --ignore-not-found
	kubectl delete -f k8s/traefik.yml --ignore-not-found
	kubectl delete -f k8s/grafana.yml --ignore-not-found
	kubectl delete -f k8s/grafana-dashboards.yml --ignore-not-found
	kubectl delete -f k8s/prometheus.yml --ignore-not-found
	kubectl delete -f k8s/frontend.yml --ignore-not-found
	kubectl delete -f k8s/app.yml --ignore-not-found
	kubectl delete -f k8s/postgres.yml --ignore-not-found
	kubectl delete -f k8s/secret.yml --ignore-not-found
	kubectl delete -f k8s/configmap.yml --ignore-not-found
	kubectl delete -f k8s/namespace.yml --ignore-not-found
	@echo All resources deleted.

# ─────────────────────────────────────────────
# Load Testing (JMeter)
# ─────────────────────────────────────────────
load-test:
	rm -rf jmeter/report
	jmeter -n -t jmeter/collector-load-test.jmx -l jmeter/results.jtl -e -o jmeter/report/
	@echo ──────────────────────────────────────
	@echo Load test complete. Open jmeter/report/index.html for results.
	@echo ──────────────────────────────────────

load-test-gui:
	jmeter -t jmeter/collector-load-test.jmx

load-test-clean:
	rm -f jmeter/results.jtl
	rm -rf jmeter/report
	@echo JMeter results cleaned.
