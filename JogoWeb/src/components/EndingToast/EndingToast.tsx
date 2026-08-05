import styles from './EndingToast.module.css'

interface EndingToastProps {
  label: string
  title: string
}

export function EndingToast({ label, title }: EndingToastProps) {
  return (
    <aside className={styles.toast} role="status" aria-label="Final obtido">
      <span>{label}</span>
      <strong>{title}</strong>
    </aside>
  )
}
