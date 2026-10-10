package com.ynk.virtualdisplay.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.grid.rememberLazyGridState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Add
import androidx.compose.ui.window.Dialog
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ynk.virtualdisplay.data.repository.ConnectionStatus
import com.ynk.virtualdisplay.ui.display.DisplayActivity
import com.ynk.virtualdisplay.ui.main.MainViewModel
import com.ynk.virtualdisplay.ui.components.DisplayItem
import com.ynk.virtualdisplay.ui.components.AppSelectionDialog

private data class DisplayPreset(val name: String, val width: Int, val height: Int, val dpi: Int)

@Composable
fun VirtualDisplayScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val displays = uiState.displays
    val orphanDisplayIds = uiState.orphanDisplayIds
    val status = uiState.statusMessage
    
    var showAppSelectionDialogForDisplayId by remember { mutableStateOf<Int?>(null) }
    var showCreateDialog by remember { mutableStateOf(false) }
    var showErrorDialog by remember { mutableStateOf(false) }

    val gridState = rememberLazyGridState()
    val isFabExpanded by remember {
        derivedStateOf {
            gridState.firstVisibleItemIndex == 0 && gridState.firstVisibleItemScrollOffset < 100
        }
    }

    val presets = remember(context) {
        val dm = context.resources.displayMetrics
        listOf(
            DisplayPreset("Этот телефон", dm.widthPixels, dm.heightPixels, dm.densityDpi),
            DisplayPreset("Телефон 720p", 720, 1280, 320),
            DisplayPreset("Планшет 2.5K", 2560, 1600, 320),
            DisplayPreset("ТВ 1080p", 1920, 1080, 320)
        )
    }

    LaunchedEffect(Unit) {
        viewModel.refreshDisplays(context)
    }

    // App Selection Dialog Handler
    showAppSelectionDialogForDisplayId?.let { displayId ->
        AppSelectionDialog(
            onDismiss = { showAppSelectionDialogForDisplayId = null },
            onAppSelected = { appInfo ->
                viewModel.launchSelectedApp(context, displayId, appInfo.packageName)
                showAppSelectionDialogForDisplayId = null
            }
        )
    }

    // Gradient Background
    val backgroundBrush = Brush.verticalGradient(
        colors = listOf(
            MaterialTheme.colorScheme.background,
            MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.25f)
        )
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(backgroundBrush)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // 1. 顶部操作栏
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Виртуальные дисплеи",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.ExtraBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    color = MaterialTheme.colorScheme.onBackground,
                    modifier = Modifier.weight(1f)
                )
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    TextButton(
                        onClick = { viewModel.forceRestartService(context) },
                        colors = ButtonDefaults.textButtonColors(
                            contentColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Text("Перезапуск", fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1, softWrap = false)
                    }
                    IconButton(
                        onClick = { viewModel.refreshDisplays(context) },
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                            .size(36.dp)
                    ) {
                        Icon(
                            Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // 2. 服务连接状态条
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
                    .border(1.dp, Color.White.copy(alpha = 0.05f), RoundedCornerShape(10.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                val connectionStatus = uiState.connectionStatus
                val (statusText, statusColor) = when (connectionStatus) {
                    ConnectionStatus.CONNECTED -> "Сервис: подключён" to Color(0xFF26A69A)
                    ConnectionStatus.BINDING -> "Сервис: подключение..." to Color(0xFFFFB74D)
                    ConnectionStatus.DISCONNECTED -> "Сервис: отключён" to Color(0xFFEF5350)
                    ConnectionStatus.ERROR -> "Сервис: ошибка" to Color(0xFFEF5350)
                    ConnectionStatus.IDLE -> "Сервис: ожидание" to Color(0xFF78909C)
                }

                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(statusColor, RoundedCornerShape(4.dp))
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Text(
                    text = statusText,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = statusColor
                )

                Spacer(modifier = Modifier.weight(1f))

                val isError = status.startsWith("Error:")
                Text(
                    text = "Подсказка: $status",
                    fontSize = 10.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    color = if (isError)
                        MaterialTheme.colorScheme.error.copy(alpha = 0.85f)
                    else
                        MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                    modifier = if (isError) Modifier.clickable { showErrorDialog = true } else Modifier
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 4. 显示器列表头部
            Text(
                text = "Активные экраны",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            // 5. 显示器网格
            if (displays.isEmpty()) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.1f))
                        .border(1.dp, Color.White.copy(alpha = 0.03f), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Нет активных виртуальных дисплеев",
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            } else {
                LazyVerticalGrid(
                    state = gridState,
                    columns = GridCells.Fixed(2),
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(bottom = 72.dp)
                ) {
                    items(displays, key = { it.id }) { displayInfo ->
                        DisplayItem(
                            displayInfo = displayInfo,
                            repository = viewModel.repository,
                            isOrphan = displayInfo.id in orphanDisplayIds,
                            onPlay = {
                                val intent = Intent(context, DisplayActivity::class.java).apply {
                                    putExtra("display_id", displayInfo.id)
                                }
                                context.startActivity(intent)
                            },
                            onDelete = { viewModel.releaseDisplay(displayInfo.id, context) },
                            onLaunchApp = { showAppSelectionDialogForDisplayId = displayInfo.id }
                        )
                    }
                }
            }
        }

        // 错误详情弹窗
        if (showErrorDialog) {
            AlertDialog(
                onDismissRequest = { showErrorDialog = false },
                title = { Text("Ошибка", fontWeight = FontWeight.Bold) },
                text = {
                    Text(
                        text = status,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                confirmButton = {
                    TextButton(onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("Журнал ошибки", status))
                        Toast.makeText(context, "Скопировано", Toast.LENGTH_SHORT).show()
                        showErrorDialog = false
                    }) {
                        Text("Копировать")
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showErrorDialog = false }) {
                        Text("Закрыть")
                    }
                }
            )
        }

        // 6. 新建屏幕弹窗 (Creation Dialog)
        if (showCreateDialog) {

            Dialog(onDismissRequest = { showCreateDialog = false }) {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, Color.White.copy(alpha = 0.08f), RoundedCornerShape(16.dp))
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Новый виртуальный дисплей",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // 输入行
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = uiState.inputWidth,
                                onValueChange = { viewModel.updateInputs(width = it) },
                                label = { Text("Ширина") },
                                modifier = Modifier.weight(1f),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp)
                            )
                            OutlinedTextField(
                                value = uiState.inputHeight,
                                onValueChange = { viewModel.updateInputs(height = it) },
                                label = { Text("Высота") },
                                modifier = Modifier.weight(1f),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp)
                            )
                            OutlinedTextField(
                                value = uiState.inputDpi,
                                onValueChange = { viewModel.updateInputs(dpi = it) },
                                label = { Text("DPI") },
                                modifier = Modifier.weight(0.8f),
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                shape = RoundedCornerShape(10.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // 预设选择器
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            presets.forEach { preset ->
                                val isSelected = uiState.inputWidth == preset.width.toString() &&
                                                 uiState.inputHeight == preset.height.toString() &&
                                                 uiState.inputDpi == preset.dpi.toString()
                                
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(
                                            if (isSelected) MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                                            else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                                        )
                                        .border(
                                            width = 1.dp,
                                            color = if (isSelected) MaterialTheme.colorScheme.primary else Color.White.copy(alpha = 0.08f),
                                            shape = RoundedCornerShape(8.dp)
                                        )
                                        .clickable {
                                            viewModel.updateInputs(
                                                width = preset.width.toString(),
                                                height = preset.height.toString(),
                                                dpi = preset.dpi.toString()
                                            )
                                        }
                                        .padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = preset.name,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            OutlinedButton(
                                onClick = { showCreateDialog = false },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text("Отмена", fontWeight = FontWeight.Bold)
                            }

                            Button(
                                onClick = {
                                    viewModel.createVirtualDisplay(context)
                                    showCreateDialog = false
                                },
                                modifier = Modifier.weight(1.5f),
                                shape = RoundedCornerShape(10.dp),
                                enabled = !uiState.isLoading
                            ) {
                                if (uiState.isLoading) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(18.dp),
                                        strokeWidth = 2.dp,
                                        color = MaterialTheme.colorScheme.onPrimary
                                    )
                                } else {
                                    Text("Создать и запустить", fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }

        // 7. 中间偏下悬浮 + 号按钮
        FloatingActionButton(
            onClick = { showCreateDialog = true },
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 24.dp),
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary,
            shape = RoundedCornerShape(50)
        ) {
            Row(
                modifier = Modifier
                    .padding(horizontal = if (isFabExpanded) 16.dp else 0.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Новый дисплей"
                )
                if (isFabExpanded) {
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Новый дисплей",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }
}


