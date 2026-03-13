---
name: project-overview
description: High-level overview of the Zentinel project.
activation: Always On
---

# Zentinel Project Overview

Zentinel is designed to automate the creation of high-quality changelogs using AI. It bridges the gap between raw technical logs and stakeholder-ready reports.

## Key Features
1. **Multi-model**: Switch between local Ollama models for privacy or OpenRouter for high-end models.
2. **Dual Perspective**: Generate reports from a Product Owner or DevOps viewpoint.
3. **History**: Every generated report is stored locally for future reference (sqlite).
4. **Instant Sharing**: Send reports to Discord with one click.

## Local Files of Interest
- `apps/backend/zentinel.db`: The local database.
- `apps/backend/src/services/ai/prompt.manager.ts`: Where the system prompts live.
- `apps/frontend/src/index.css`: The "Luxe" theme definition.
