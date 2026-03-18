# Changelog: Zentinel

Todas las actividades importantes del proyecto se registran aquí.

## [1.2.0] - 2026-03-18

### Added (Nuevo)
- **Generación Manual de Informes**: Nueva opción para generar reportes extrayendo datos directamente del changelog sin usar IA, con plantillas personalizables. [2026-03-18]
- **Tareas: Modo Manual**: Soporte para programar tareas automáticas en modo manual (sin IA). [2026-03-18]
- **Filtros de Historial**: Sistema de filtrado avanzado en el historial de reportes por modo (IA/Manual), fecha (desde/hasta) y fuente de datos. [2026-03-18]
- **ReportService (Backend)**: Nueva arquitectura de servicios para compartir lógica de generación entre la UI y el programador de tareas. [2026-03-18]
- **Persistencia Extendida**: Inclusión de `source_id` en la tabla de reportes para trazabilidad total de la fuente de datos. [2026-03-18]

### Changed (Cambio)
- **Discord: Robustez en Envío**: Implementación de troceado automático de mensajes (límite de 2000 caracteres) para evitar errores 400 de Discord API en reportes extensos. [2026-03-18]

### Fixed (Corrección)
- **Discord: Error 400 (Bad Request)**: Solucionado el problema de rechazo de mensajes por exceder límites de "embeds". [2026-03-18]
- **Backend: Estabilidad en /api/reports**: Corregido error 500 causado por desincronización de esquema de base de datos. [2026-03-18]


### Added (Nuevo)
- **Progreso en Tiempo Real**: Integración de Socket.io en backend y frontend para mostrar el estado de generación de informes. [2026-03-16]
- **Renderizado de Markdown Enriquecido**: Soporte para tablas (GFM), diagramas de Mermaid y resaltado de sintaxis (react-syntax-highlighter). [2026-03-16]
- **Dashboard Estadístico**: Visualización de uso de tokens y salud del código (sentimiento) utilizando Recharts. [2026-03-16]
- **Biblioteca de Prompts**: Sistema de importación/exportación de roles en JSON y plantillas predefinidas (Tech Lead, PO, etc.). [2026-03-16]
- **Descarga de Informes**: Botón para descargar la vista previa del informe en formato Markdown (.md). [2026-03-16]
- **Secciones de Informe Enriquecidas**: Nuevos campos para "Hoy/Pendientes", "Bloqueos" y "Dudas" en la generación de informes, permitiendo un contexto más completo para la IA. [2026-03-16]
- **Informes: Historial Integrado**: Integración del historial de informes como una pestaña dentro de "Informes", con opciones de re-descarga y re-envío a Discord. [2026-03-16]
- **Informes: Edición de Reportes**: Capacidad de editar manualmente el contenido de informes generados en el historial para correcciones rápidas. [2026-03-16]
- **Discord: Gestión de Canales**: Soporte para guardar múltiples Webhooks con nombres descriptivos. [2026-03-16]
- **Discord: Directorio de Menciones**: Sistema de gestión de usuarios para mencionar sin usar IDs numéricos. [2026-03-16]
- **Tareas e Informes: Selectores Inteligentes**: Integración de selectores para Modelos, Webhooks y Menciones. [2026-03-16]
- **Proyectos: Seguridad en RAG**: Filtrado automático respetando `.gitignore`, `.dockerignore` y reglas de seguridad. [2026-03-16]
- **Tareas: Contexto RAG Automático**: Vinculación de tareas a proyectos para incluir contexto de código. [2026-03-16]
- **Gestión de Proyectos y RAG**: Nueva sección "Proyecto" para crear, editar y indexar código como RAG. [2026-03-16]

### Changed (Cambio)
- **Limpieza de Código y Estándares**: Ejecución de Biome para corregir errores de accesibilidad, tipado estricto (eliminación de `any`) y mejores prácticas de React. [2026-03-16]
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
