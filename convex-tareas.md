## Tarea 1: Instalar Convex

- Usar pnpm (repo tiene pnpm-lock.yaml).
- Ejecutar: pnpm add convex
- Ejecutar: npx convex dev (desde la raíz del repo)
- Ejecutar: npx convex codegen (después de crear schema)
- Verificar que se crea convex/\_generated/
- NO modificar archivos en convex/\_generated/

## Tarea 2: Crear schema.ts

- Crear convex/schema.ts con el schema acordado.
- Incluir tablas: users, projects, agents, tasks, taskLogs, taskComments.
- Ejecutar npx convex codegen tras guardar schema.ts.

## Tarea 3: Crear auth.config.ts

- Crear convex/auth.config.ts con:
  export default { providers: [] };
- No implementar autenticación.

## Tarea 4: Crear archivos de dominio (vacíos inicialmente)

- Crear:
  - convex/tasks.ts
  - convex/agents.ts
  - convex/logs.ts
  - convex/comments.ts
  - convex/watchdog.ts
  - convex/crons.ts
- No crear subcarpetas. Un archivo por dominio.

## Tarea 5: Implementar mutations en tasks.ts

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

## Tarea 6: Implementar queries en tasks.ts

- listByProject(projectId)
- listByStatus(status)
- getTask(taskId)

## Tarea 7: Implementar watchdog

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
