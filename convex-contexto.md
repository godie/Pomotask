# Contexto para integrar Convex en Pomotask

Este documento define el alcance, restricciones y lineamientos para integrar Convex
en el repositorio actual de Pomotask. Cualquier agente que trabaje en esta integración
debe seguir estas reglas estrictamente.

## 1. Estructura del repositorio

El repositorio actual NO debe reestructurarse. No mover carpetas existentes.
La integración de Convex debe vivir en:

    pomotask/
      convex/
        schema.ts
        auth.config.ts
        crons.ts
        tasks.ts
        agents.ts
        logs.ts
        comments.ts
        watchdog.ts

El frontend existente permanece en:

    pomotask/src/

Cloudflare Pages depende de esta estructura. No modificarla.

## 2. Convex

### 2.1 Ubicación

El backend Convex debe vivir en `pomotask/convex/`.

### 2.2 Cliente generado

Convex genera su cliente SIEMPRE en:

    pomotask/convex/_generated/

NO modificar ningún archivo dentro de `_generated/`.
NO mover esta carpeta.
Si se modifica cualquier archivo en `_generated/`, el proyecto queda roto.

El frontend importa desde:

    import { api } from "../../convex/_generated/api";

Los archivos dentro de `convex/` importan desde:

    import { internal } from "./_generated/api";

No invertir estas rutas.

### 2.3 Comandos

Los comandos válidos para desarrollo son:

    npx convex dev
    npx convex codegen

No agregar scripts adicionales.
Ejecutar `npx convex codegen` después de cualquier cambio en `schema.ts`.

### 2.4 Variables de entorno

El frontend necesita:

    VITE_CONVEX_URL=https://<tu-deployment>.convex.cloud

El deploy de Cloudflare Pages necesita en GitHub Secrets:

    CONVEX_DEPLOY_KEY=<deploy key del Convex dashboard>

Ambas variables deben estar documentadas en `.env.example`.
No hardcodear URLs ni keys en el código.

### 2.5 Gestor de paquetes

Este repo usa `pnpm`. Usar siempre `pnpm` para instalar dependencias.
No usar `npm install` ni `yarn add` — rompe el lockfile existente.

## 3. Alcance de esta integración

### 3.1 Lo que sí se debe implementar

- Crear `convex/` con schema y funciones.
- Implementar mutations y queries mínimas:
  - createTask
  - claimTask
  - reportProgress
  - completeTask
  - failTask
- Integrar ConvexProvider en el frontend sin romper el build actual.
- Crear watchdog como scheduled function registrada en `crons.ts`.

### 3.2 Lo que NO se debe hacer

- No mover `src/` ni `public/`.
- No crear un monorepo.
- No modificar configuración de Cloudflare Pages.
- No agregar dependencias innecesarias.
- No crear lógica de agentes dentro del repo UI.
- No crear CLI dentro de este repo.
- No implementar autenticación todavía.
- No modificar archivos en `convex/_generated/`.

## 4. Autenticación

Convex Auth NO se implementa en esta fase.
`auth.config.ts` debe existir con este contenido exacto:

    export default { providers: [] };

Las mutations deben aceptar `agentId` como string explícito.
No validar identidad todavía.
La autenticación real se implementará en otra fase.

## 5. Watchdog

`watchdog.ts` contiene la lógica del cron como `internalMutation`.
`crons.ts` es el único archivo donde se registran todos los crons del proyecto.
La lógica del watchdog puede vivir en `watchdog.ts` y ser importada por `crons.ts`.

Ejemplo de estructura correcta:

    // convex/watchdog.ts
    import { internalMutation } from "./_generated/server";

    export const resetStuckTasks = internalMutation({
      handler: async (ctx) => {
        // lógica de reset
      },
    });

    // convex/crons.ts
    import { cronJobs } from "convex/server";
    import { internal } from "./_generated/api";

    const crons = cronJobs();
    crons.interval(
      "reset stuck tasks",
      { minutes: 10 },
      internal.watchdog.resetStuckTasks
    );
    export default crons;

## 6. Interacción con el frontend

El frontend debe poder:

- Crear tareas.
- Ver tareas en tiempo real.
- Ver logs.

Para integrar Convex en React:

- Instalar con `pnpm add convex`.
- Crear `src/lib/convex.ts` que exporte el cliente React.
- Envolver `<App />` con `<ConvexProvider>` en `main.tsx`.
- Usar `import.meta.env.VITE_CONVEX_URL` como URL, nunca hardcodeada.

**Cliente correcto**:

- En frontend React usar `ConvexReactClient` (desde `convex/react`).
- En Node/CLI usar `ConvexClient` (desde `convex`).

No implementar UI nueva más allá de lo necesario para probar Convex.

## 7. Interacción con agentes externos

Los agentes NO viven en este repo.
Los agentes NO deben modificar este repo.
Los agentes solo interactúan vía Convex mutations.

## 8. Estándares de código

- TypeScript estricto. No usar `any`.
- No usar lógica duplicada.
- No mezclar lógica de UI con lógica de Convex.
- Un archivo por dominio en `convex/` — no fragmentar en subcarpetas.
- Queries y mutations en el mismo archivo por dominio.
- No modificar archivos en `convex/_generated/`.

## 9. Resultado esperado

Al finalizar la integración:

- Convex debe estar funcionando en el repo.
- El frontend debe poder leer/escribir datos vía Convex.
- El watchdog debe estar registrado en `crons.ts`.
- `.env.example` debe estar actualizado.
- No debe romperse el deploy actual.
- No debe cambiar la estructura del repo.

## 10. Journal del agente

Existe un archivo `.jules/convex.md` con aprendizajes críticos de integraciones anteriores.
Leerlo antes de empezar cualquier tarea.
Actualizarlo solo cuando se descubra algo no obvio o inesperado.
No duplicar información que ya está en este documento.
No duplicar información que ya está en convex-contexto.md.

### 2.6 Archivos ignorados

`convex/_generated/` debe estar en `.gitignore`.
Se regenera automáticamente con `npx convex dev` o `npx convex codegen`.
Nunca commitear archivos generados.
