'use client';

import { useCallback, useMemo, useState } from 'react';
import { useVirtualTabs } from './useVirtualTabs';

export function useVirtualTabDraft<T>(initialState: T) {
  const {
    activeSecondaryTabId,
    dirtyStateBySecondaryTabId,
    getDraftState,
    setSecondaryDirty,
    updateSecondaryDraftState,
  } = useVirtualTabs();
  const [localDraft, setLocalDraft] = useState<T>(initialState);
  const [localDirty, setLocalDirty] = useState(false);

  const storedDraft = activeSecondaryTabId ? getDraftState(activeSecondaryTabId) : undefined;
  const draft = useMemo(() => {
    if (!activeSecondaryTabId) return localDraft;
    if (storedDraft && typeof storedDraft === 'object' && Object.keys(storedDraft).length > 0) {
      return storedDraft as T;
    }
    return initialState;
  }, [activeSecondaryTabId, initialState, localDraft, storedDraft]);

  const setDraft = useCallback(
    (next: T | ((previous: T) => T)) => {
      if (!activeSecondaryTabId) {
        setLocalDraft((previous) =>
          typeof next === 'function' ? (next as (previousValue: T) => T)(previous) : next,
        );
        return;
      }

      updateSecondaryDraftState(activeSecondaryTabId, (previous: unknown) => {
        const previousDraft =
          previous && typeof previous === 'object' && Object.keys(previous).length > 0
            ? (previous as T)
            : initialState;
        return typeof next === 'function'
          ? (next as (previousValue: T) => T)(previousDraft)
          : next;
      });
    },
    [activeSecondaryTabId, initialState, updateSecondaryDraftState],
  );

  const patchDraft = useCallback(
    (partial: Partial<T>) => {
      setDraft((previous) => ({ ...(previous as object), ...partial }) as T);
    },
    [setDraft],
  );

  const setDirty = useCallback(
    (dirty: boolean) => {
      if (!activeSecondaryTabId) {
        setLocalDirty(dirty);
        return;
      }
      setSecondaryDirty(activeSecondaryTabId, dirty);
    },
    [activeSecondaryTabId, setSecondaryDirty],
  );

  const resetDraft = useCallback(
    (next?: T) => {
      const value = next ?? initialState;
      if (!activeSecondaryTabId) {
        setLocalDraft(value);
        setLocalDirty(false);
        return;
      }
      updateSecondaryDraftState(activeSecondaryTabId, value);
      setSecondaryDirty(activeSecondaryTabId, false);
    },
    [activeSecondaryTabId, initialState, setSecondaryDirty, updateSecondaryDraftState],
  );

  return {
    draft,
    setDraft,
    patchDraft,
    dirty: activeSecondaryTabId
      ? Boolean(dirtyStateBySecondaryTabId[activeSecondaryTabId])
      : localDirty,
    setDirty,
    secondaryTabId: activeSecondaryTabId,
    resetDraft,
  };
}
