# Changelog: Zentinel

Todas las actividades importantes del proyecto se registran aquí.

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
