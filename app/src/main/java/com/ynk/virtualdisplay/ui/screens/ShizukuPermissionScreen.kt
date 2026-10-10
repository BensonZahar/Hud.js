package com.ynk.virtualdisplay.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.ynk.virtualdisplay.data.model.ShizukuState

@Composable
fun ShizukuPermissionScreen(
    state: ShizukuState,
    onRetry: () -> Unit,
    onRequestPermission: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        val title = if (state is ShizukuState.NotRunning) "Shizuku не запущен" else "Нет разрешения Shizuku"
        val description = if (state is ShizukuState.NotRunning) {
            "Приложению нужен Shizuku. Убедитесь, что сервис Shizuku запущен."
        } else {
            "Приложению нужно разрешение Shizuku для системных операций. Выдайте разрешение, чтобы продолжить."
        }

        Text(
            text = title,
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.error,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = description,
            style = MaterialTheme.typography.bodyLarge,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        if (state is ShizukuState.NotRunning) {
            Button(onClick = onRetry) {
                Text("Проверить снова")
            }
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                OutlinedButton(onClick = onRetry) {
                    Text("Проверить снова")
                }
                Button(onClick = onRequestPermission) {
                    Text("Запросить разрешение")
                }
            }
        }
    }
}
