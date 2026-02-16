# JMeter Load Tests — Collector API

Tests de charge pour l'API Collector utilisant [Apache JMeter](https://jmeter.apache.org/).

## Prérequis

- **Apache JMeter 5.6+** — [télécharger ici](https://jmeter.apache.org/download_jmeter.cgi)
- Ajouter `JMETER_HOME/bin` au `PATH` système
- L'API Collector doit tourner sur `http://localhost:8000`

## Structure

```
jmeter/
├── collector-load-test.jmx   # Plan de test JMeter
├── results.jtl                # Résultats bruts (généré)
├── report/                    # Rapport HTML (généré)
└── README.md
```

## Plan de test

| Thread Group | Threads | Ramp-up | Loops | Scénario |
|---|---|---|---|---|
| **setUp** | 1 | 1s | 1 | Register admin + seller, login, créer une catégorie |
| **TG1 — Public Browsing** | 50 | 10s | 10 | `GET /articles`, `GET /articles/{id}`, `GET /categories`, `/docs` |
| **TG2 — Authenticated CRUD** | 20 | 10s | 5 | Create → Update → Approve → Profile → Delete article |
| **TG3 — Auth Stress** | 30 | 5s | 5 | Register (emails uniques) + Login en rafale |

## Lancer les tests

### Mode CLI (headless — recommandé)

```bash
# Depuis la racine du projet
make load-test
```

Ou directement :

```bash
jmeter -n -t jmeter/collector-load-test.jmx \
       -l jmeter/results.jtl \
       -e -o jmeter/report/
```

Le rapport HTML est généré dans `jmeter/report/`. Ouvrir `jmeter/report/index.html` dans un navigateur.

### Mode GUI (debug)

```bash
make load-test-gui
```

> **Note :** Le mode GUI ne doit être utilisé que pour le debug. Les tests réels doivent être lancés en mode CLI.

## Configuration

Les variables suivantes sont configurables dans le Test Plan (User Defined Variables) :

| Variable | Défaut | Description |
|---|---|---|
| `PROTOCOL` | `http` | Protocole (http/https) |
| `HOST` | `localhost` | Hôte cible |
| `PORT` | `8000` | Port de l'API |
| `API_PREFIX` | `/api/v1` | Préfixe des routes |

Pour les surcharger en CLI :

```bash
jmeter -n -t jmeter/collector-load-test.jmx \
       -JHOST=collector.local -JPORT=443 -JPROTOCOL=https \
       -l jmeter/results.jtl -e -o jmeter/report/
```

## Interpréter les résultats

- **Summary Report** : vue globale (avg, min, max, throughput, error %)
- **Aggregate Report** : statistiques détaillées par sampler
- **Rapport HTML** (`jmeter/report/index.html`) : graphiques interactifs, distribution des temps de réponse, etc.
