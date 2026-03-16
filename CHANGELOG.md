# Changelog: Zentinel

Todas las actividades importantes del proyecto se registran aquí.

## [Unreleased]

### Added (Nuevo)
- **Progreso en Tiempo Real**: Integración de Socket.io en backend y frontend para mostrar el estado de generación de informes. [2026-03-16]
- **Renderizado de Markdown Enriquecido**: Soporte para tablas (GFM), diagramas de Mermaid y resaltado de sintaxis (react-syntax-highlighter). [2026-03-16]
- **Dashboard Estadístico**: Visualización de uso de tokens y salud del código (sentimiento) utilizando Recharts. [2026-03-16]
- **Biblioteca de Prompts**: Sistema de importación/exportación de roles en JSON y plantillas predefinidas (Tech Lead, PO, etc.). [2026-03-16]
- **Descarga de Informes**: Botón para descargar la vista previa del informe en formato Markdown (.md). [2026-03-16]
- **Secciones de Informe Enriquecidas**: Nuevos campos para "Hoy/Pendientes", "Bloqueos" y "Dudas" en la generación de informes, permitiendo un contexto más completo para la IA. [2026-03-16]

### Changed (Cambio)
- **Estructura de Base de Datos**: Añadidas columnas `tokensUsed` y `sentimentScore` a la tabla de reportes para analíticas. [2026-03-16]
- **Configuración Reorganizada**: Nueva interfaz por pestañas (API, Modelos, Prompts, Discord) para una mejor gestión. [2026-03-16]

### Fixed (Corrección)
- **Tipado TypeScript**: Resolución de errores de tipos en componentes principales (`Informes`, `Configuracion`, `Dashboard`). [2026-03-16]
- **Dependencias**: Solución de conflictos de peer dependencies en el frontend. [2026-03-16]

## [1.0.0] - 2026-03-13

### Añadido
- **Estructura Monorepo**: Configuración de NPM Workspaces con carpetas `backend` y `frontend`.
- **Backend Orquestador**:
  - Interfaz común para proveedores de IA.
  - Implementación de **Ollama** y **OpenRouter**.
  - Administrador de Prompts con perfiles de **Product Owner** y **DevOps**.
  - Integración de Webhooks de **Discord**.
- **Persistencia de Datos**:
  - Configuración de **SQLite** con **Drizzle ORM**.
  - Guardado automático de cada reporte generado en la base de datos `zentinel.db`.
- **Frontend Luxe**:
  - Interfaz premium estilizada con **Vanilla CSS**.
  - Dashboard interactivo para entrada de datos, configuración de IA y previsualización.
- **Configuración de Agente**:
  - Carpeta `.agents` con reglas específicas de Tech Stack y Coding Style.
- **Verificación**: Versión compilada con éxito tanto en backend como frontend.
