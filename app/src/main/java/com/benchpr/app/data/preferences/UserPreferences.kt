package com.benchpr.app.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.doublePreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_settings")

class UserPreferences(private val context: Context) {

    companion object {
        val KEY_TARGET_1RM = doublePreferencesKey("target_1rm")
        val KEY_WEIGHT_UNIT = stringPreferencesKey("weight_unit")
    }

    val target1RM: Flow<Double> = context.dataStore.data.map { preferences ->
        preferences[KEY_TARGET_1RM] ?: 100.0
    }

    val weightUnit: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_WEIGHT_UNIT] ?: "kg"
    }

    suspend fun updateTarget1RM(newTarget: Double) {
        context.dataStore.edit { preferences ->
            preferences[KEY_TARGET_1RM] = newTarget
        }
    }

    suspend fun updateWeightUnit(unit: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_WEIGHT_UNIT] = unit
        }
    }
}
