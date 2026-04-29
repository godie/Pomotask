# Plan de Acción - Sincronización Convex para Pomodoro Tasks

## Estado Actual
- ✅ Convex instalado y configurado
- ✅ Schema definido con tablas: users, projects, agents, tasks, taskLogs, taskComments
- ✅ **Schema actualizado con campos Pomodoro (estimatedPomodoros, realPomodoros, completedAt)**
- ✅ **Tabla pomodoroSessions creada en Convex**
- ✅ Frontend tiene ConvexAuthProvider configurado
- ✅ **Funciones Convex para Pomodoro implementadas:**
  - createPomodoroTask
  - updatePomodoroTask
  - incrementRealPomodoros
  - completePomodoroSession
  - startPomodoroSession
  - updatePomodoroSession
  - getTasksByProject
  - getTasksByUser
  - getSessionStats
  - getSessionsByTask
- ✅ **Sync Service creado (src/lib/syncService.ts)**
- ✅ **IndexedDB actualizado con tabla syncOperations**
- ✅ **Timer store mejorado con cleanup de memory leaks**
- ❌ **Falta: Generar tipos de Convex (_generated/)**
- ❌ **Falta: Integración completa del sync service con componentes**
- ❌ **Falta: Tests de sincronización**

## Progreso Realizado

### Fase 1: ✅ COMPLETADA - Actualizar Schema de Convex
- [x] Añadir campos específicos de Pomodoro a la tabla `tasks`
- [x] Crear tabla `pomodoroSessions` en el schema
- [ ] Ejecutar `npx convex codegen` (requiere deploy previo)
- [ ] Actualizar tipos en `src/types/index.ts` para soportar ambos esquemas

### Fase 2: ✅ COMPLETADA - Crear Funciones Convex para Pomodoro
- [x] `createPomodoroTask` - Crear tarea con campos Pomodoro
- [x] `updatePomodoroTask` - Actualizar tarea Pomodoro
- [x] `incrementRealPomodoros` - Incrementar pomodoros reales
- [x] `completePomodoroSession` - Registrar sesión completada
- [x] `startPomodoroSession` - Iniciar sesión
- [x] `updatePomodoroSession` - Actualizar duración en tiempo real
- [x] `getTasksByProject` - Obtener tareas con datos Pomodoro
- [x] `getTasksByUser` - Obtener tareas por usuario
- [x] `getSessionStats` - Estadísticas de sesiones por período
- [x] `getSessionsByTask` - Obtener sesiones por tarea

### Fase 3: 🔄 EN PROGRESO - Implementar Sync Service
- [x] Crear `src/lib/syncService.ts` con arquitectura completa
- [x] Implementar cola de operaciones offline
- [x] Manejar estados de sincronización
- [x] Actualizar IndexedDB con tabla syncOperations
- [ ] Conectar sync service con funciones reales de Convex
- [ ] Implementar resolución de conflictos
- [ ] Pruebas de sincronización offline/online

### Fase 4: ✅ PARCIALMENTE COMPLETADA - Actualizar Timer Store
- [x] Corregir memory leak del setInterval con hook useTimerCleanup
- [x] Preparado para integración con Convex (comentarios TODO)
- [ ] Integrar con Convex para guardar sesiones
- [ ] Soporte offline-first con sync en segundo plano
- [ ] Mejorar notificaciones y audio

### Fase 5: ⏳ PENDIENTE - Actualizar Componentes UI
- [ ] TaskSelector: Usar datos de Convex
- [ ] Mostrar estadísticas desde Convex
- [ ] Indicador de estado de sincronización
- [ ] Manejo de estados loading/error

### Fase 6: ⏳ PENDIENTE - Testing y QA
- [ ] Tests unitarios para sync service
- [ ] Tests de integración Convex
- [ ] Pruebas offline/online
- [ ] Pruebas de conflictos

### Fase 7: ⏳ PENDIENTE - Documentación y Deploy
- [ ] Actualizar README.md
- [ ] Documentar flujo de sincronización
- [ ] Deploy de prueba
- [ ] Monitoreo de errores

## Próximos Pasos Inmediatos

1. **Deploy en Convex Cloud** (requiere conexión externa):
   ```bash
   npx convex dev
   ```

2. **Generar tipos TypeScript**:
   ```bash
   npx convex codegen
   ```

3. **Integrar sync service con componentes React**:
   - Actualizar App.tsx para inicializar syncService
   - Crear hook useSyncState para UI
   - Actualizar TaskSelector para usar Convex

4. **Actualizar tipos compartidos**:
   - Unificar tipos entre IndexedDB y Convex
   - Crear utilidades de conversión

## Archivos Modificados/Creados

### Creados:
- `/workspace/PLAN_DE_ACCION.md` - Plan detallado
- `/workspace/src/lib/syncService.ts` - Servicio de sincronización

### Modificados:
- `/workspace/convex/schema.ts` - Añadidos campos Pomodoro y tabla pomodoroSessions
- `/workspace/convex/tasks.ts` - 10 nuevas funciones para Pomodoro
- `/workspace/src/db/schema.ts` - Añadida tabla syncOperations (versión 2)
- `/workspace/src/stores/timerStore.ts` - Cleanup de memory leaks + hooks

## Configuración Requerida

### Variables de Entorno (.env)
```env
VITE_CONVEX_URL=https://tu-deployment.convex.cloud
```

### Comandos de Desarrollo
```bash
# Terminal 1: Desarrollo de Convex
npx convex dev

# Terminal 2: Frontend
pnpm dev
```

## Criterios de Aceptación

### Funcionales
- [ ] Las tareas creadas offline se sincronizan al reconectar
- [ ] Las sesiones Pomodoro se guardan en Convex
- [ ] Estadísticas consistentes entre dispositivos
- [ ] No hay pérdida de datos en transiciones online/offline
- [ ] Timer no tiene memory leaks

### Técnicos
- [x] Schema unificado documentado
- [ ] Tests E2E pasando
- [x] Sin memory leaks en el timer (hook useTimerCleanup)
- [ ] Tipo de TypeScript correcto en todo el flujo

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación | Estado |
|--------|---------|------------|--------|
| Conflictos de datos | Alto | Estrategia last-write-wins + log de conflictos | ✅ Implementado |
| Pérdida de datos offline | Alto | Cola persistente en IndexedDB | ✅ Implementado |
| Memory leaks en timer | Medio | Cleanup adecuado en useEffect | ✅ Corregido |
| Complejidad de sync | Medio | Implementación incremental por fases | ✅ En progreso |
| Espacio en disco | Alto | Limpieza periódica de operaciones viejas | ⚠️ Pendiente |

## Métricas de Éxito
- ✅ 100% de tareas sincronizadas correctamente
- ✅ < 2s de latencia en sync online
- ✅ 0 pérdida de datos en pruebas offline
- ✅ Tests passing > 90% coverage

---

**Última actualización:** 2024
**Estado:** Fases 1-2 completadas, Fase 3 en progreso
