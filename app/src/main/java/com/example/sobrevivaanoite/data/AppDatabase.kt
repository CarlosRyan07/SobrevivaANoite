package com.example.sobrevivaanoite.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [MatchHistory::class], version = 1)
abstract class AppDatabase : RoomDatabase() {

    abstract fun matchHistoryDao(): MatchHistoryDao

    companion object {
        // A anotação @Volatile garante que a instância seja sempre a mais atual
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            // Retorna a instância se já existir, senão, cria uma nova
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "sobreviva_a_noite_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}