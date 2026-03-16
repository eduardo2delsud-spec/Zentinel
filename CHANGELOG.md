# Changelog: Zentinel

Todas las actividades importantes del proyecto se registran aquí.

## [Unreleased]

## [1.1.0] - 2026-03-16

### Added (Nuevo)
- **Progreso en Tiempo Real**: Integración de Socket.io en backend y frontend para mostrar el estado de generación de informes. [2026-03-16]
- **Renderizado de Markdown Enriquecido**: Soporte para tablas (GFM), diagramas de Mermaid y resaltado de sintaxis (react-syntax-highlighter). [2026-03-16]
- **Dashboard Estadístico**: Visualización de uso de tokens y salud del código (sentimiento) utilizando Recharts. [2026-03-16]
- **Biblioteca de Prompts**: Sistema de importación/exportación de roles en JSON y plantillas predefinidas (Tech Lead, PO, etc.). [2026-03-16]
- **Descarga de Informes**: Botón para descargar la vista previa del informe en formato Markdown (.md). [2026-03-16]
- **Secciones de Informe Enriquecidas**: Nuevos campos para "Hoy/Pendientes", "Bloqueos" y "Dudas" en la generación de informes, permitiendo un contexto más completo para la IA. [2026-03-16]
- **Informes: Historial Integrado**: Integración del historial de informes como una pestaña dentro de "Informes", con opciones de re-descarga y re-envío a Discord. [2026-03-16]
- **Informes: Edición de Reportes**: Capacidad de editar manualmente el contenido de informes generados en el historial para correcciones rápidas. [2026-03-16]
- **Proyectos: Seguridad en RAG**: Implementación de filtrado automático respetando `.gitignore`, `.dockerignore` y reglas de seguridad para archivos sensibles (`.env`, llaves, secretos). [2026-03-16]
- **Tareas: Contexto RAG Automático**: Las tareas programadas ahora pueden vincularse a proyectos para incluir contexto de código en reportes automáticos. [2026-03-16]
- **Discord: Soporte Multiusuario**: Soporte para menciones de múltiples IDs de Discord en notificaciones y tareas. [2026-03-16]
- **Gestión de Proyectos y RAG**: Nueva sección "Proyecto" que permite crear y **editar** proyectos, indexar archivos de código y utilizar ese contexto como RAG. [2026-03-16]

### Changed (Cambio)
- **CRUD Optimizado**: Proyectos y Tareas Programadas ahora son totalmente editables, facilitando ajustes de configuración sin re-crear. [2026-03-16]
- **Refinamiento de UI**: Mejora visual con iconos contextuales (`Edit`, `Save`, `X`, `Plus`) y organización por pestañas en "Informes" y "Configuración". [2026-03-16]
- **Estructura de Base de Datos**: Actualización de esquema (SQLite/Drizzle) para soportar proyectos, archivos RAG, tokens y métricas de sentimiento. [2026-03-16]

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
