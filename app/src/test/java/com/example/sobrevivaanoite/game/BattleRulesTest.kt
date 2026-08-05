package com.example.sobrevivaanoite.game

import org.junit.Assert.assertEquals
import org.junit.Test

class BattleRulesTest {

    @Test
    fun `esquiva perfeita na direção correta realiza parry`() {
        val result = BattleRules.resolveEnemyAttack(
            attackDirection = AttackDirection.LEFT,
            dodgeDirection = AttackDirection.LEFT,
            dodgeTiming = DodgeTiming.PERFECT
        )

        assertEquals(EnemyAttackResolution.PARRY, result)
    }

    @Test
    fun `esquiva antecipada na direção correta evita o golpe sem parry`() {
        val result = BattleRules.resolveEnemyAttack(
            attackDirection = AttackDirection.RIGHT,
            dodgeDirection = AttackDirection.RIGHT,
            dodgeTiming = DodgeTiming.EARLY
        )

        assertEquals(EnemyAttackResolution.DODGED_EARLY, result)
    }

    @Test
    fun `esquiva para o lado errado recebe o golpe`() {
        val result = BattleRules.resolveEnemyAttack(
            attackDirection = AttackDirection.LEFT,
            dodgeDirection = AttackDirection.RIGHT,
            dodgeTiming = DodgeTiming.PERFECT
        )

        assertEquals(EnemyAttackResolution.PLAYER_HIT, result)
    }

    @Test
    fun `jogador sem esquiva recebe o golpe`() {
        val result = BattleRules.resolveEnemyAttack(
            attackDirection = AttackDirection.RIGHT,
            dodgeDirection = null,
            dodgeTiming = DodgeTiming.NONE
        )

        assertEquals(EnemyAttackResolution.PLAYER_HIT, result)
    }

    @Test
    fun `esquiva na direção correta fora da janela recebe o golpe`() {
        val result = BattleRules.resolveEnemyAttack(
            attackDirection = AttackDirection.LEFT,
            dodgeDirection = AttackDirection.LEFT,
            dodgeTiming = DodgeTiming.NONE
        )

        assertEquals(EnemyAttackResolution.PLAYER_HIT, result)
    }

    @Test
    fun `dano inimigo reduz a vida do jogador`() {
        assertEquals(85, BattleRules.playerHpAfterHit(100))
    }

    @Test
    fun `vida do jogador nunca fica negativa`() {
        assertEquals(0, BattleRules.playerHpAfterHit(10))
    }

    @Test
    fun `ataque causa mais dano quando inimigo está atordoado`() {
        assertEquals(3, BattleRules.damageForAttack(enemyIsStunned = false))
        assertEquals(10, BattleRules.damageForAttack(enemyIsStunned = true))
        assertEquals(90, BattleRules.enemyHpAfterAttack(100, enemyIsStunned = true))
        assertEquals(0, BattleRules.enemyHpAfterAttack(2, enemyIsStunned = false))
    }

    @Test
    fun `combo acelera ataques sem ultrapassar o limite`() {
        assertEquals(250L, BattleRules.attackSpeedAfterCombo(250L, comboStep = 1))
        assertEquals(175L, BattleRules.attackSpeedAfterCombo(250L, comboStep = 2))
        assertEquals(100L, BattleRules.attackSpeedAfterCombo(125L, comboStep = 3))
        assertEquals(100L, BattleRules.attackSpeedAfterCombo(100L, comboStep = 4))
    }
}
