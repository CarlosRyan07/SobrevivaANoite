import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import styles from './WordButton.module.css'

type WordButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>

export function WordButton({ children, className, ...props }: WordButtonProps) {
  return (
    <button
      {...props}
      className={`${styles.button} ${className ?? ''}`.trim()}
    >
      <span className={styles.label}>{children}</span>
    </button>
  )
}
