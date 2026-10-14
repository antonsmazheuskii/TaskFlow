import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { cn, ui } from '../../lib/ui'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      element.tabIndex !== -1,
  )
}

export function Modal({ title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    const previousActive = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    if (!dialog.open) {
      dialog.showModal()
    }

    const focusables = getFocusableElements(dialog)
    const initialFocus = closeButtonRef.current ?? focusables[0] ?? dialog
    initialFocus.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab' || !dialogRef.current) {
        return
      }

      const elements = getFocusableElements(dialogRef.current)

      if (elements.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
        return
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    function handleCancel(event: Event) {
      event.preventDefault()
      onCloseRef.current()
    }

    dialog.addEventListener('cancel', handleCancel)
    dialog.addEventListener('keydown', handleKeyDown)

    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      dialog.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow

      if (dialog.open) {
        dialog.close()
      }

      if (previousActive && typeof previousActive.focus === 'function') {
        previousActive.focus()
      }
    }
  }, [])

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'fixed inset-0 z-50 m-auto max-h-[min(90vh,44rem)] w-[min(100%-2rem,36rem)]',
        'open:flex open:flex-col overflow-hidden border-0 bg-transparent p-0',
        'shadow-none outline-none animate-modal-in',
        'backdrop:bg-slate-950/45 backdrop:backdrop-blur-[2px] dark:backdrop:bg-black/60',
      )}
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
    >
      <div
        className={cn(
          ui.card,
          'flex max-h-[min(90vh,44rem)] w-full flex-col overflow-hidden shadow-md',
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2
            id={titleId}
            className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50"
          >
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            className={ui.btnIcon}
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </dialog>
  )
}
