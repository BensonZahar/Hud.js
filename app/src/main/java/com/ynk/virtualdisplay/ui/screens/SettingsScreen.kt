package com.ynk.virtualdisplay.ui.screens

import android.content.Context
import android.os.Build
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ynk.virtualdisplay.BuildConfig
import com.ynk.virtualdisplay.data.repository.ConnectionStatus
import com.ynk.virtualdisplay.ui.main.MainViewModel
import com.ynk.virtualdisplay.data.model.ALL_DISPLAY_FLAGS

@Composable
fun SettingsScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    // SharedPreferences for persistent settings
    val prefs = remember { context.getSharedPreferences("virtual_display_settings", Context.MODE_PRIVATE) }

    // States for display flags (loaded dynamically from SharedPreferences)
    val flagStates = remember {
        mutableStateMapOf<String, Boolean>().apply {
            ALL_DISPLAY_FLAGS.forEach { flag ->
                put(flag.key, prefs.getBoolean(flag.key, flag.isDefaultEnabled))
            }
        }
    }
    var flagsExpanded by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Системные настройки",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.ExtraBold,
            color = MaterialTheme.colorScheme.onBackground
        )

        // 2. Display Flags 配置卡片
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.15f)
            ),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(16.dp))
                .clickable { flagsExpanded = !flagsExpanded }
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Флаги виртуального дисплея",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        TextButton(
                            onClick = {
                                ALL_DISPLAY_FLAGS.forEach { flag ->
                                    flagStates[flag.key] = flag.isDefaultEnabled
                                    prefs.edit().putBoolean(flag.key, flag.isDefaultEnabled).apply()
                                }
                            },
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                            modifier = Modifier.height(28.dp)
                        ) {
                            Text("Сбросить", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (flagsExpanded) "▲" else "▼",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                        )
                    }
                }

                AnimatedVisibility(visible = flagsExpanded) {
                    Column {
                        Spacer(modifier = Modifier.height(8.dp))

                        val supportedFlags = remember {
                            ALL_DISPLAY_FLAGS.filter { it.minSdk <= Build.VERSION.SDK_INT }
                        }

                        supportedFlags.forEachIndexed { index, flag ->
                            SettingSwitchRow(
                                title = flag.name,
                                description = flag.description + " (минимум: API ${flag.minSdk})",
                                checked = flagStates[flag.key] ?: flag.isDefaultEnabled,
                                onCheckedChange = { isChecked ->
                                    flagStates[flag.key] = isChecked
                                    prefs.edit().putBoolean(flag.key, isChecked).apply()
                                }
                            )
                            if (index < supportedFlags.lastIndex) {
                                HorizontalDivider(color = Color.White.copy(alpha = 0.05f))
                            }
                        }
                    }
                }
            }
        }

        // 2.5 操作与手势设置
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.15f)
            ),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(16.dp))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "Управление и жесты",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(8.dp))
                HorizontalDivider(color = Color.White.copy(alpha = 0.05f))
                
                var captureBack by remember {
                    mutableStateOf(prefs.getBoolean("capture_back", false))
                }
                SettingSwitchRow(
                    title = "Перехват кнопки «Назад»",
                    description = "При управлении виртуальным дисплеем жест или кнопка «Назад» телефона передаётся на виртуальный экран, чтобы не выходить из окна дисплея",
                    checked = captureBack,
                    onCheckedChange = { isChecked ->
                        captureBack = isChecked
                        prefs.edit().putBoolean("capture_back", isChecked).apply()
                    }
                )
            }
        }

        // 3. 服务诊断与系统信息卡片
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.15f)
            ),
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(16.dp))
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    text = "Состояние сервиса и системы",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                HorizontalDivider(color = Color.White.copy(alpha = 0.05f))

                // 连接状态
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Привилегированный сервис",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    val connectionStatus = uiState.connectionStatus
                    val (statusText, statusColor) = when (connectionStatus) {
                        ConnectionStatus.CONNECTED -> "Подключён" to Color(0xFF26A69A)
                        ConnectionStatus.BINDING -> "Подключение..." to Color(0xFFFFB74D)
                        ConnectionStatus.DISCONNECTED -> "Отключён" to Color(0xFFEF5350)
                        ConnectionStatus.ERROR -> "Ошибка" to Color(0xFFEF5350)
                        ConnectionStatus.IDLE -> "Ожидание" to Color(0xFF78909C)
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(statusColor, RoundedCornerShape(4.dp))
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = statusText,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = statusColor
                        )
                    }
                }

                // 构建参数
                val dirtyMark = if (BuildConfig.GIT_DIRTY) " ●dirty" else ""
                SystemInfoRow("Версия приложения", "v${BuildConfig.VERSION_NAME} (code ${BuildConfig.VERSION_CODE})")
                SystemInfoRow("Git Commit", "${BuildConfig.GIT_HASH}$dirtyMark")
                SystemInfoRow("Время сборки", BuildConfig.BUILD_TIME)
                SystemInfoRow("Версия Android", "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})")


            }
        }
    }
}

@Composable
private fun SettingSwitchRow(
    title: String,
    description: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f).padding(end = 16.dp)) {
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = description,
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                lineHeight = 14.sp
            )
        }
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

@Composable
private fun SystemInfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            fontSize = 13.sp,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
            fontWeight = FontWeight.Medium
        )
    }
}
