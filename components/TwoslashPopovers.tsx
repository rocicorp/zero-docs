'use client';

import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from '@floating-ui/dom';
import {useEffect} from 'react';

const TRIGGER_SELECTOR =
  '.twoslash .twoslash-hover, .twoslash .twoslash-error-hover';
const POPUP_SELECTOR = '.twoslash-popup-container';
const COMPLETION_TRIGGER_SELECTOR = '.twoslash .twoslash-completion-cursor';
const COMPLETION_LIST_SELECTOR = '.twoslash-completion-list';
const INLINE_POPUP_CLASS = 'twoslash-popup-container-inline';
const INLINE_COMPLETION_CLASS = 'twoslash-completion-list-inline';
const FLOATING_POPUP_CLASS = 'twoslash-floating';

type TriggerController = {
  destroy: () => void;
  syncPersistent: () => void;
};

function isPersistentQuery(trigger: HTMLElement) {
  return (
    trigger.classList.contains('twoslash-query-persisted') ||
    trigger.classList.contains('twoslash-query-presisted')
  );
}

function isVisible(element: HTMLElement) {
  return element.isConnected && element.getClientRects().length > 0;
}

function copyThemeAttributes(source: HTMLElement, target: HTMLElement) {
  const themeSource = source.closest<HTMLElement>('[data-theme]');
  const theme = themeSource?.getAttribute('data-theme');
  if (theme) {
    target.setAttribute('data-theme', theme);
  }
}

function createPopover(trigger: HTMLElement): TriggerController | null {
  const sourcePopup = trigger.querySelector<HTMLElement>(POPUP_SELECTOR);
  if (!sourcePopup) return null;

  const popover = sourcePopup.cloneNode(true) as HTMLElement;
  popover.classList.remove(INLINE_POPUP_CLASS);
  popover.classList.add(FLOATING_POPUP_CLASS, 'vp-copy-ignore');
  popover.setAttribute('role', 'tooltip');
  popover.setAttribute('aria-hidden', 'true');
  copyThemeAttributes(sourcePopup, popover);

  sourcePopup.classList.add(INLINE_POPUP_CLASS);
  document.body.appendChild(popover);

  const persistent = isPersistentQuery(trigger);
  let isOpen = false;
  let pointerOnTrigger = false;
  let pointerOnPopover = false;
  let cleanupPositioning: (() => void) | undefined;
  let hideTimer: number | undefined;

  const clearHideTimer = () => {
    if (hideTimer !== undefined) {
      window.clearTimeout(hideTimer);
      hideTimer = undefined;
    }
  };

  const updatePosition = async () => {
    if (!isOpen) return;

    if (!isVisible(trigger)) {
      close();
      return;
    }

    const {x, y} = await computePosition(trigger, popover, {
      placement: 'bottom-start',
      strategy: 'fixed',
      middleware: [offset(8), flip({padding: 8}), shift({padding: 8})],
    });

    Object.assign(popover.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  };

  function show() {
    clearHideTimer();
    if (!isVisible(trigger)) return;

    if (isOpen) {
      void updatePosition();
      return;
    }

    isOpen = true;
    popover.style.display = 'inline-flex';
    popover.setAttribute('aria-hidden', 'false');
    cleanupPositioning = autoUpdate(trigger, popover, updatePosition);
    void updatePosition();
  }

  function close() {
    clearHideTimer();
    isOpen = false;
    cleanupPositioning?.();
    cleanupPositioning = undefined;
    popover.style.display = 'none';
    popover.setAttribute('aria-hidden', 'true');
  }

  function hide() {
    if (persistent) return;
    close();
  }

  const hideSoon = () => {
    if (persistent) return;
    clearHideTimer();
    hideTimer = window.setTimeout(() => {
      if (!pointerOnTrigger && !pointerOnPopover) hide();
    }, 80);
  };

  const onTriggerPointerEnter = () => {
    pointerOnTrigger = true;
    show();
  };
  const onTriggerPointerLeave = () => {
    pointerOnTrigger = false;
    hideSoon();
  };
  const onPopoverPointerEnter = () => {
    pointerOnPopover = true;
    clearHideTimer();
  };
  const onPopoverPointerLeave = () => {
    pointerOnPopover = false;
    hideSoon();
  };
  const onFocusIn = () => show();
  const onFocusOut = () => hideSoon();
  const onTriggerClick = () => {
    if (!persistent) show();
  };
  const onDocumentPointerDown = (event: PointerEvent) => {
    if (persistent || !isOpen) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (trigger.contains(target) || popover.contains(target)) return;
    hide();
  };

  trigger.addEventListener('pointerenter', onTriggerPointerEnter);
  trigger.addEventListener('pointerleave', onTriggerPointerLeave);
  trigger.addEventListener('focusin', onFocusIn);
  trigger.addEventListener('focusout', onFocusOut);
  trigger.addEventListener('click', onTriggerClick);
  popover.addEventListener('pointerenter', onPopoverPointerEnter);
  popover.addEventListener('pointerleave', onPopoverPointerLeave);
  document.addEventListener('pointerdown', onDocumentPointerDown, true);

  const syncPersistent = () => {
    if (!persistent) return;
    if (isVisible(trigger)) show();
    else close();
  };

  syncPersistent();

  return {
    syncPersistent,
    destroy() {
      clearHideTimer();
      cleanupPositioning?.();
      trigger.removeEventListener('pointerenter', onTriggerPointerEnter);
      trigger.removeEventListener('pointerleave', onTriggerPointerLeave);
      trigger.removeEventListener('focusin', onFocusIn);
      trigger.removeEventListener('focusout', onFocusOut);
      trigger.removeEventListener('click', onTriggerClick);
      popover.removeEventListener('pointerenter', onPopoverPointerEnter);
      popover.removeEventListener('pointerleave', onPopoverPointerLeave);
      document.removeEventListener('pointerdown', onDocumentPointerDown, true);
      sourcePopup.classList.remove(INLINE_POPUP_CLASS);
      popover.remove();
    },
  };
}

function createCompletionPopover(
  trigger: HTMLElement,
): TriggerController | null {
  const sourceList = trigger.querySelector<HTMLElement>(
    COMPLETION_LIST_SELECTOR,
  );
  if (!sourceList) return null;

  const popover = sourceList.cloneNode(true) as HTMLElement;
  popover.classList.remove(INLINE_COMPLETION_CLASS);
  popover.classList.add(FLOATING_POPUP_CLASS, 'vp-copy-ignore');
  popover.setAttribute('role', 'listbox');
  popover.setAttribute('aria-hidden', 'true');
  copyThemeAttributes(sourceList, popover);

  sourceList.classList.add(INLINE_COMPLETION_CLASS);
  document.body.appendChild(popover);

  let isOpen = false;
  let cleanupPositioning: (() => void) | undefined;

  const updatePosition = async () => {
    if (!isOpen) return;

    if (!isVisible(trigger)) {
      close();
      return;
    }

    const {x, y} = await computePosition(trigger, popover, {
      placement: 'bottom-start',
      strategy: 'fixed',
      middleware: [offset(4), flip({padding: 8}), shift({padding: 8})],
    });

    Object.assign(popover.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  };

  function show() {
    if (!isVisible(trigger)) return;

    if (isOpen) {
      void updatePosition();
      return;
    }

    isOpen = true;
    popover.style.display = 'flex';
    popover.setAttribute('aria-hidden', 'false');
    cleanupPositioning = autoUpdate(trigger, popover, updatePosition);
    void updatePosition();
  }

  function close() {
    isOpen = false;
    cleanupPositioning?.();
    cleanupPositioning = undefined;
    popover.style.display = 'none';
    popover.setAttribute('aria-hidden', 'true');
  }

  const syncPersistent = () => {
    if (isVisible(trigger)) show();
    else close();
  };

  syncPersistent();

  return {
    syncPersistent,
    destroy() {
      cleanupPositioning?.();
      sourceList.classList.remove(INLINE_COMPLETION_CLASS);
      popover.remove();
    },
  };
}

export default function TwoslashPopovers() {
  useEffect(() => {
    const controllers = new Map<HTMLElement, TriggerController>();
    let scanFrame: number | undefined;

    const scan = () => {
      scanFrame = undefined;

      document
        .querySelectorAll<HTMLElement>(TRIGGER_SELECTOR)
        .forEach(trigger => {
          if (controllers.has(trigger)) return;
          const controller = createPopover(trigger);
          if (controller) controllers.set(trigger, controller);
        });

      document
        .querySelectorAll<HTMLElement>(COMPLETION_TRIGGER_SELECTOR)
        .forEach(trigger => {
          if (controllers.has(trigger)) return;
          const controller = createCompletionPopover(trigger);
          if (controller) controllers.set(trigger, controller);
        });

      controllers.forEach((controller, trigger) => {
        if (!trigger.isConnected) {
          controller.destroy();
          controllers.delete(trigger);
          return;
        }
        controller.syncPersistent();
      });
    };

    const scheduleScan = () => {
      if (scanFrame !== undefined) return;
      scanFrame = window.requestAnimationFrame(scan);
    };

    scan();

    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'hidden', 'data-state', 'aria-hidden'],
    });

    return () => {
      if (scanFrame !== undefined) {
        window.cancelAnimationFrame(scanFrame);
      }
      observer.disconnect();
      controllers.forEach(controller => controller.destroy());
      controllers.clear();
    };
  }, []);

  return null;
}
