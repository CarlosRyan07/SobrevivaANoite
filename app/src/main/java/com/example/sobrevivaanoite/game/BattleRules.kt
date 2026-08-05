package com.example.sobrevivaanoite.game

enum class EnemyAttackResolution {
    PARRY,
    DODGED_EARLY,
    PLAYER_HIT
}

/**
 * Regras determinísticas da batalha, separadas do Android e das animações.
 *
 * Manter estes cálculos aqui permite validá-los com testes unitários rápidos,
 * sem precisar iniciar um emulador.
 */
object BattleRules {
    const val PLAYER_MAX_HP = 100
    const val ENEMY_MAX_HP = 700
    const val ENEMY_DAMAGE = 15
    const val NORMAL_ATTACK_DAMAGE = 3
    const val STUNNED_ATTACK_DAMAGE = 10
    const val INITIAL_ATTACK_SPEED_MS = 250L
    const val MIN_ATTACK_SPEED_MS = 100L
    const val COMBO_SPEED_STEP_MS = 75L

    fun resolveEnemyAttack(
        attackDirection: AttackDirection,
        dodgeDirection: AttackDirection?,
        dodgeTiming: DodgeTiming
    ): EnemyAttackResolution {
        val correctDirection = attackDirection == dodgeDirection
        return when {
            correctDirection && dodgeTiming == DodgeTiming.PERFECT -> EnemyAttackResolution.PARRY
            correctDirection && dodgeTiming == DodgeTiming.EARLY -> EnemyAttackResolution.DODGED_EARLY
            else -> EnemyAttackResolution.PLAYER_HIT
        }
    }

    fun playerHpAfterHit(currentHp: Int): Int =
        (currentHp - ENEMY_DAMAGE).coerceAtLeast(0)

    fun damageForAttack(enemyIsStunned: Boolean): Int =
        if (enemyIsStunned) STUNNED_ATTACK_DAMAGE else NORMAL_ATTACK_DAMAGE

    fun enemyHpAfterAttack(currentHp: Int, enemyIsStunned: Boolean): Int =
        (currentHp - damageForAttack(enemyIsStunned)).coerceAtLeast(0)

    fun attackSpeedAfterCombo(currentSpeedMs: Long, comboStep: Int): Long =
        if (comboStep >= 2) {
            (currentSpeedMs - COMBO_SPEED_STEP_MS).coerceAtLeast(MIN_ATTACK_SPEED_MS)
        } else {
            currentSpeedMs
        }
}
