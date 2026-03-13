---
name: maintenance
description: Reglas de mantenimiento y formateo del proyecto.
activation: Always On
---

# Mantenimiento y Formateo

Para mantener la consistencia del código, este proyecto utiliza **Biome**.

## Reglas de Formateo
- **SIEMPRE** ejecuta el formateo después de realizar cambios significativos en cualquier archivo (JS, TS, JSON, CSS).
- El comando de formateo es: `npm run format`.
- **NO** utilices Prettier ni ESLint para el formateo; Biome es la única fuente de verdad.

## Automatización
- Después de que el asistente termine una tarea de edición, debe ejecutar `npx @biomejs/biome format --write .` para asegurar que todo el proyecto cumpla con los estándares.
