# 📄 Especificaciones Técnicas: Zentinel

Este documento detalla la arquitectura, el diseño de servicios y la infraestructura del proyecto **Zentinel - Changelog Automator**.

## 1. Arquitectura del Sistema

Zentinel está construido bajo una arquitectura de **Monorepo** utilizando **NPM Workspaces**, lo que permite compartir configuraciones y facilitar la gestión de dependencias en un entorno unificado.

### Estructura de Directorios
```text
/
├── apps/
│   ├── backend/          # Microservicio Express 5 (Runtime: Node.js/TSX)
│   └── frontend/         # SPA React 19 (Build: Vite)
├── .agents/              # Reglas de comportamiento para asistencia IA
├── docker-compose.yml    # Orquestación de contenedores
└── package.json          # Root manager con scripts Concurrent/Workspaces
```

---

## 2. Backend (Orquestador)

El backend actúa como un orquestador de Inteligencia Artificial y un gestor de persistencia.

### Stack Tecnológico
- **Core**: Node.js (ESM) + TypeScript.
- **Framework**: Express 5 (soporte nativo para promesas en rutas).
- **ORM**: Drizzle ORM (Type-safe SQL).
- **Database**: SQLite vía `better-sqlite3`.

### Orquestador de IA (Service Provider Pattern)
Se implementó una abstracción `IAIService` para desacoplar la lógica de negocio del proveedor de IA:
- **OllamaService**: Conexión local vía puerto `11434`.
- **OpenRouterService**: Integración vía API REST con cabeceras personalizadas.
- **AIServiceFactory**: Singleton que instancia el proveedor basado en la configuración dinámica.

### Esquema de Base de Datos
Ubicación: `apps/backend/src/db/schema.ts`
- **reports**: Almacena `id`, `content` (Markdown), `provider`, `model`, `role` y `created_at`.
- **settings**: Almacena configuraciones clave-valor (`OLLAMA_URL`, `OPENROUTER_API_KEY`) para evitar la edición manual de archivos `.env`.

---

## 3. Frontend (Dashboard Luxe)

El frontend prioriza la performance y la estética premium sin el overhead de frameworks CSS pesados.

### Stack Tecnológico
- **Framework**: React 19.
- **Transmisión de Datos**: Axios con base URL dinámica.
- **Estilos**: **Vanilla CSS Luxe System**. Uso intensivo de variables CSS (`:root`) para manejar el diseño oscuro y glassmorphism.

### Sistema de Diseño
El archivo `index.css` define un sistema de cuadrícula y tarjetas de cristal:
- **Gradients**: Uso de `background: linear-gradient` para acentos visuales.
- **Micro-animaciones**: Transiciones de 0.3s en hover y estados de carga.

---

## 4. Gestión de Prompts y Roles

El "cerebro" del sistema se divide en `PromptManager`, que inyecta prompts de sistema especializados:
- **PRODUCT_OWNER**: Enfocado en "Business Value", hitos y lenguaje de alto nivel.
- **DEVOPS**: Enfocado en infraestructura, breaking changes técnicos y estabilidad del sistema.

---

## 5. Docker e Infraestructura

Zentinel utiliza contenedores aislados y orquestados para asegurar que el entorno de desarrollo sea idéntico al de producción.

### Contenedor Backend
- **Imagen**: `node:20-alpine`.
- **Build**: Compilación TypeScript en tiempo de construcción.
- **Persistencia**: Volumen montado para `zentinel.db`.

### Contenedor Frontend
- **Estrategia**: Multi-stage build.
- **Stage 1**: Build de producción con Vite.
- **Stage 2**: Servido por **Nginx**.
- **Proxy**: Nginx redirige todas las peticiones `/api/*` al contenedor `zentinel-backend:3001`.

---

## 6. API Endpoints

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/generate` | Orchesta el llamado a la IA y persiste el reporte. |
| `GET` | `/api/models` | Consulta modelos disponibles (Ollama tags o OpenRouter list). |
| `GET` | `/api/settings` | Obtiene la configuración dinámica. |
| `POST` | `/api/settings` | Actualiza llaves de API o URLs de forma persistente. |

---

## 7. Scripts de Control (Root)

- `npm run dev`: Lanza backend y frontend simultáneamente con `concurrently`.
- `npm run build`: Pipeline de compilación total de la solución.
- `npm run start`: Ejecución de artefactos productivos compilados.

---
*Documentación generada para el equipo técnico de DelSud.*
