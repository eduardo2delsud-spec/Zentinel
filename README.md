# 🛡️ Zentinel - Changelog Automator

Zentinel es un orquestador inteligente diseñado para transformar logs técnicos crudos en reportes de alta calidad adaptados a diferentes audiencias (Product Owners o DevOps). Construido con una arquitectura moderna de monorepo y una estética **Luxe** minimalista.

## ✨ Funciones Principales

- **Orquestador de IA Multiproveedor**: Soporte nativo para **Ollama** (ejecución local privada) y **OpenRouter** (acceso a modelos SOTA en la nube).
- **Perfiles Especializados (Cerebro)**: 
  - **Product Owner**: Traduce tecnicismos a beneficios de negocio y hitos estratégicos.
  - **DevOps/SRE**: Analiza cambios en infraestructura, base de datos y tipos de fixes técnicos.
- **Persistencia con SQLite**: Guarda automáticamente cada reporte generado en una base de datos local para auditoría y consulta futura.
- **Vista Previa de Alta Fidelidad**: Editor de dos columnas para comparar el input técnico con el reporte generado antes de compartirlo.
- **Integración con Discord**: Envía tus reportes directamente a canales de Discord con un solo clic, con formato enriquecido.

## 🛠️ Stack Tecnológico

Zentinel utiliza tecnologías state-of-the-art para garantizar velocidad y simplicidad:

### Monorepo
- **Gestión**: NPM Workspaces.
- **Estructura**: `apps/backend` y `apps/frontend`.

### Backend (apps/backend)
- **Runtime**: Node.js + TypeScript (ESM).
- **Framework**: Express 5.
- **Base de Datos**: SQLite gestionado con **Drizzle ORM**.
- **Servicios**: Sistema de proveedores para IA y gestor de Webhooks.

### Frontend (apps/frontend)
- **Framework**: React 19 + Vite + TypeScript.
- **Estilo**: **Vanilla CSS (Luxe System)**. Un diseño premium, oscuro y minimalista sin dependencias de frameworks de CSS (No Tailwind).
- **Iconos**: Lucide React.

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js v18+
- (Opcional) Ollama instalado localmente.
- (Opcional) API Key de OpenRouter.

### Configuración Inicial

1. **Instalar dependencias desde la raíz**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   Crea un archivo `.env` en `apps/backend/`:
   ```env
   PORT=3001
   OPENROUTER_API_KEY=tu_api_key_aqui
   OLLAMA_URL=http://localhost:11434
   ```

### Ejecución con Docker (Recomendado)

Para levantar todo el sistema (Backend + Frontend) de forma automática:

```bash
docker-compose up --build -d
```

- El **Frontend** estará disponible en `http://localhost:5173` (con proxy interno al backend).
- El **Backend** estará disponible en `http://localhost:3001`.

### Ejecución en Desarrollo (Manual)

Desde la raíz del proyecto, puedes arrancar ambos componentes simultáneamente:

```bash
npm install
npm run dev
```

Esto iniciará el backend en `http://localhost:3001` y el frontend en `http://localhost:5173` usando `concurrently`.

### Otros Comandos Útiles

- `npm run build`: Compila ambos proyectos para producción.
- `npm run start`: Ejecuta las versiones compiladas de ambos proyectos.

## 📁 Estructura del Proyecto

- `apps/backend/src/services/ai`: Lógica de orquestación de inteligencia artificial.
- `apps/backend/src/db`: Esquemas y configuración de la base de datos SQLite.
- `apps/frontend/src/index.css`: El sistema de diseño "Luxe" basado en variables CSS.
- `.agents/rules`: Reglas de comportamiento para el asistente de IA.

---
*Zentinel - Tu base de datos de carrera profesional, automatizada.*
