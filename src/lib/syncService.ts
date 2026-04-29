/**
 * Servicio de Sincronización para Pomodoro Tasks
 * 
 * Estrategia: Offline-first con sincronización bidireccional
 * - Las operaciones se guardan primero en IndexedDB
 * - Se sincronizan con Convex cuando hay conexión
 * - Resolución de conflictos: last-write-wins con timestamp
 */

import { db } from '@/db/schema';
import type { Task, PomodoroSession } from '@/types';
import type { Id } from '../../convex/_generated/dataModel';
import type { api } from '../../convex/_generated/api';

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'session';
  data: any;
  convexId?: string;
  localId: string;
  timestamp: number;
  synced: boolean;
}

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number | null;
  pendingOperations: number;
}

class SyncService {
  private static instance: SyncService;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private state: SyncState = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSyncTime: null,
    pendingOperations: 0,
  };
  private listeners: Set<(state: SyncState) => void> = new Set();

  private constructor() {
    this.setupNetworkListeners();
    this.startSyncLoop();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  getState(): SyncState {
    return { ...this.state };
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private handleOnline() {
    this.state.isOnline = true;
    this.notifyListeners();
    console.log('[SyncService] Online - starting sync');
    void this.syncPendingChanges();
  }

  private handleOffline() {
    this.state.isOnline = false;
    this.notifyListeners();
    console.log('[SyncService] Offline - queuing operations');
  }

  private startSyncLoop() {
    // Intentar sincronizar cada 30 segundos si hay conexión
    this.syncInterval = setInterval(() => {
      if (this.state.isOnline && !this.state.isSyncing) {
        void this.syncPendingChanges();
      }
    }, 30000);
  }

  stopSyncLoop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sincronizar cambios pendientes desde IndexedDB a Convex
   */
  async syncPendingChanges(): Promise<void> {
    if (this.state.isSyncing || !this.state.isOnline) {
      return;
    }

    this.state.isSyncing = true;
    this.notifyListeners();

    try {
      // Obtener operaciones pendientes
      const pendingOps = await db.syncOperations
        .where('synced')
        .equals(0)
        .sortBy('timestamp');

      console.log(`[SyncService] Syncing ${pendingOps.length} pending operations`);

      for (const op of pendingOps) {
        try {
          await this.executeOperation(op);
          await db.syncOperations.update(op.id, { synced: true });
        } catch (error) {
          console.error(`[SyncService] Failed to sync operation ${op.id}:`, error);
          // Reintentar más tarde
        }
      }

      this.state.lastSyncTime = Date.now();
      this.state.pendingOperations = 0;
    } catch (error) {
      console.error('[SyncService] Sync failed:', error);
    } finally {
      this.state.isSyncing = false;
      this.notifyListeners();
    }
  }

  private async executeOperation(op: SyncOperation): Promise<void> {
    // Aquí se llamaría a las funciones de Convex
    // Esto es un placeholder - en producción se importa api desde convex/_generated/api
    console.log('[SyncService] Executing operation:', op);
    
    switch (op.entity) {
      case 'task':
        await this.executeTaskOperation(op);
        break;
      case 'session':
        await this.executeSessionOperation(op);
        break;
    }
  }

  private async executeTaskOperation(op: SyncOperation): Promise<void> {
    // Placeholder para operaciones de tareas
    // En producción:
    // if (op.type === 'create') {
    //   const convexId = await convex.mutation(api.tasks.createPomodoroTask, op.data);
    //   await this.updateLocalIdMapping(op.localId, convexId);
    // }
  }

  private async executeSessionOperation(op: SyncOperation): Promise<void> {
    // Placeholder para operaciones de sesiones
  }

  /**
   * Queue una operación para sincronización
   */
  async queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'synced'>): Promise<string> {
    const id = crypto.randomUUID();
    const op: SyncOperation = {
      ...operation,
      id,
      timestamp: Date.now(),
      synced: false,
    };

    await db.syncOperations.add(op);
    this.state.pendingOperations++;
    this.notifyListeners();

    // Si estamos online, intentar sincronizar inmediatamente
    if (this.state.isOnline) {
      setTimeout(() => void this.syncPendingChanges(), 1000);
    }

    return id;
  }

  /**
   * Sincronizar tareas desde Convex a IndexedDB (descarga)
   */
  async syncTasksFromConvex(
    userId: Id<'users'>,
    projectId?: Id<'projects'>
  ): Promise<Task[]> {
    console.log('[SyncService] Fetching tasks from Convex');
    
    // Placeholder - en producción:
    // const tasks = projectId
    //   ? await convex.query(api.tasks.getTasksByProject, { projectId })
    //   : await convex.query(api.tasks.getTasksByUser, { userId });
    
    // Convertir tareas de Convex a formato local y guardar en IndexedDB
    // await this.saveTasksToLocal(tasks);
    
    return [];
  }

  /**
   * Sincronizar sesiones desde Convex
   */
  async syncSessionsFromConvex(
    userId: Id<'users'>,
    startDate: number,
    endDate: number
  ): Promise<PomodoroSession[]> {
    console.log('[SyncService] Fetching sessions from Convex');
    
    // Placeholder - en producción:
    // const stats = await convex.query(api.tasks.getSessionStats, {
    //   userId,
    //   startDate,
    //   endDate,
    // });
    
    return [];
  }

  /**
   * Resolver conflictos entre local y remoto
   * Estrategia: last-write-wins basado en timestamp
   */
  resolveConflict(local: Task | PomodoroSession, remote: any): Task | PomodoroSession {
    const localTime = 'updatedAt' in local ? local.updatedAt : local.completedAt || local.startedAt;
    const remoteTime = remote.updatedAt || remote.completedAt || remote.createdAt;

    if (localTime >= remoteTime) {
      console.log('[SyncService] Keeping local version (newer)');
      return local;
    } else {
      console.log('[SyncService] Accepting remote version (newer)');
      return this.convertRemoteToLocal(remote);
    }
  }

  private convertRemoteToLocal(remote: any): Task | PomodoroSession {
    // Convertir formato de Convex a formato local
    if ('estimatedPomodoros' in remote) {
      // Es una tarea
      return {
        id: remote._id,
        projectId: remote.projectId,
        name: remote.title,
        estimatedPomodoros: remote.estimatedPomodoros || 0,
        realPomodoros: remote.realPomodoros || 0,
        status: remote.status as Task['status'],
        createdAt: remote.createdAt,
        updatedAt: remote.updatedAt || remote.createdAt,
        completedAt: remote.completedAt,
      } as Task;
    } else {
      // Es una sesión
      return {
        id: remote._id,
        taskId: remote.taskId,
        startedAt: remote.startedAt,
        completedAt: remote.completedAt || Date.now(),
        type: remote.type as PomodoroSession['type'],
        durationSeconds: remote.durationSeconds,
      } as PomodoroSession;
    }
  }

  /**
   * Forzar sincronización manual
   */
  async forceSync(): Promise<void> {
    console.log('[SyncService] Force sync triggered');
    await this.syncPendingChanges();
  }

  /**
   * Limpiar operaciones ya sincronizadas
   */
  async cleanupSyncedOperations(): Promise<void> {
    const syncedOps = await db.syncOperations.where('synced').equals(1).toArray();
    const oldOps = syncedOps.filter(
      (op) => Date.now() - op.timestamp > 7 * 24 * 60 * 60 * 1000 // 7 días
    );

    for (const op of oldOps) {
      await db.syncOperations.delete(op.id);
    }

    console.log(`[SyncService] Cleaned up ${oldOps.length} old synced operations`);
  }
}

export const syncService = SyncService.getInstance();
export type { SyncOperation, SyncState };
