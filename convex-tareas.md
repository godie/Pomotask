## [x] Tarea 1: Instalar Convex

- Usar pnpm (repo tiene pnpm-lock.yaml).
- Ejecutar: pnpm add convex
- Ejecutar: npx convex dev (desde la raíz del repo)
- Ejecutar: npx convex codegen (después de crear schema)
- Verificar que se crea convex/\_generated/
- NO modificar archivos en convex/\_generated/

## [x] Tarea 2: Crear schema.ts

- Crear convex/schema.ts con el schema acordado.
- Incluir tablas: users, projects, agents, tasks, taskLogs, taskComments.
- Ejecutar npx convex codegen tras guardar schema.ts.

## [x] Tarea 3: Crear auth.config.ts

- Crear convex/auth.config.ts con:
  export default { providers: [] };
- No implementar autenticación.

## [x] Tarea 4: Crear archivos de dominio (vacíos inicialmente)

- Crear:
  - convex/tasks.ts
  - convex/agents.ts
  - convex/logs.ts
  - convex/comments.ts
  - convex/watchdog.ts
  - convex/crons.ts
- No crear subcarpetas. Un archivo por dominio.

## [x] Tarea 5: Implementar mutations en tasks.ts

- Implementar:
  - createTask: inserta task con status "pending", retryCount: 0.
  - claimTask(agentId, type):
    - Usar .withIndex("by_status_type") y .first().
    - Excluir waitingForClarification: true.
    - Patch atómico a status "in_progress", claimedBy, startedAt.
    - Devolver null si no hay tarea.
  - reportProgress(taskId, agentId, message, level): inserta taskLog.
  - completeTask(taskId, agentId, prUrl, commitSha, resultType, resultPayload):
    - Patch a status "completed", endedAt.
    - Insertar log de completado.
  - failTask(taskId, agentId, reason):
    - Incrementar retryCount.
    - Si retryCount >= maxRetries → status "failed".
    - Si no → status "pending".
- Reglas:
  - No usar any.
  - No usar .collect() en queries.

## [x] Tarea 6: Implementar queries en tasks.ts

- [x] listByProject(projectId) - filtros por projectId, usa .take(100)
- [x] listByStatus(status) - filtros por status, usa .take(100)
- [x] getTask(taskId) - usa .get() para obtener una tarea específica
- Tests escritos en src/tests/convex/tasks.test.ts

## [x] Tarea 7: Implementar watchdog

- En convex/watchdog.ts: resetStuckTasks como internalMutation.
  - Buscar tasks in_progress con startedAt > 30 min.
  - Excluir waitingForClarification: true.
  - Resetear a pending o marcar failed si retryCount >= maxRetries.
- En convex/crons.ts: registrar resetStuckTasks cada 10 minutos.

## Tarea 8: Integrar Convex en el frontend

- Crear src/lib/convex.ts:
  import { ConvexReactClient } from "convex/react";
  export const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
- En main.tsx:
  - Importar ConvexProvider de "convex/react".
  - Envolver <App /> con <ConvexProvider client={convex}>.
- No modificar otros componentes.

## Tarea 9: Actualizar variables de entorno

- Añadir a .env.example:
  VITE_CONVEX_URL=https://<tu-deployment>.convex.cloud
- Documentar en .env.example: # GitHub Secrets necesario para CI/CD: # CONVEX_DEPLOY_KEY=<deploy key del Convex dashboard>

## Tarea 10: Prueba funcional mínima

- Crear una tarea desde el frontend usando useMutation(api.tasks.createTask).
- Verificar que aparece en Convex Dashboard.
- Verificar que npx convex dev no lanza errores.
- Verificar que pnpm build pasa sin errores.
- Verificar que el deploy en Cloudflare Pages sigue funcionando.

## Tarea 11: Documentar cambios

- Actualizar contexto-convex.md si algo cambió.
- Actualizar .env.example con todas las variables necesarias.

## Tarea 12: Crear journal del agente

- Crear carpeta `.jules/` en la raíz del repo si no existe.
- Crear archivo `.jules/convex.md` con este contenido inicial:

      # Convex Agent Journal

      Este archivo documenta SOLO aprendizajes críticos descubiertos durante
      la integración de Convex en Pomotask. No es un log de actividad.

      ## Cuándo agregar una entrada

      Solo cuando descubras:
      - Un comportamiento inesperado de Convex específico a este repo
      - Un fix que tuvo efectos secundarios no obvios
      - Un patrón reutilizable para este proyecto
      - Una restricción importante que no está en el contexto

      ## Cuándo NO agregar una entrada

      - Tareas completadas sin problemas
      - Buenas prácticas genéricas
      - Información ya documentada en contexto-convex.md

      ## Formato

      ## YYYY-MM-DD - [Título corto]
      **Problema:** [Qué encontraste]
      **Aprendizaje:** [Por qué existía o por qué no era obvio]
      **Prevención:** [Cómo evitarlo la próxima vez]

- Agregar `.jules/` al `.gitignore` NO — este archivo debe commitearse.
- No crear entradas todavía. El agente las crea cuando las necesite.
