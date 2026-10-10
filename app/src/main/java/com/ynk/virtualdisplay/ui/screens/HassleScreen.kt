package com.ynk.virtualdisplay.ui.screens

import android.content.Context
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.ynk.virtualdisplay.data.repository.ConnectionStatus
import com.ynk.virtualdisplay.hassle.HassleConfig
import com.ynk.virtualdisplay.hassle.HassleController
import com.ynk.virtualdisplay.hassle.HassleState
import com.ynk.virtualdisplay.ui.main.MainViewModel
import com.ynk.virtualdisplay.core.AppScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

private const val PREFS = "hassle_prefs"

@Composable
fun HassleScreen(viewModel: MainViewModel) {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences(PREFS, Context.MODE_PRIVATE) }
    val controller = remember { HassleController(context, viewModel.repository) }

    val selected = remember {
        mutableStateListOf<Int>().apply {
            val saved = prefs.getString("selected", "1,2,3,4,5,6") ?: ""
            addAll(saved.split(",").mapNotNull { it.trim().toIntOrNull() }.filter { it in 1..6 })
        }
    }
    var width by remember { mutableStateOf(prefs.getString("width", "1280") ?: "1280") }
    var height by remember { mutableStateOf(prefs.getString("height", "720") ?: "720") }
    var dpi by remember { mutableStateOf(prefs.getString("dpi", "240") ?: "240") }
    var delaySec by remember { mutableStateOf(prefs.getString("delay", "6") ?: "6") }

    fun saveSettings() {
        prefs.edit()
            .putString("selected", selected.sorted().joinToString(","))
            .putString("width", width)
            .putString("height", height)
            .putString("dpi", dpi)
            .putString("delay", delaySec)
            .apply()
    }

    // Операции идут в области процесса, а не ViewModel: если закрыть приложение из «Недавних»
    // посреди запуска, остальные игры всё равно запустятся.
    fun runOp(block: suspend () -> Unit) {
        AppScope.scope.launch {
            HassleState.busy = true
            try {
                block()
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                HassleState.add("Ошибка: ${e.message}")
            } finally {
                HassleState.busy = false
            }
        }
    }

    val numberOptions = KeyboardOptions(keyboardType = KeyboardType.Number)

    Column(
        modifier = Modifier
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text("Hassle: окна на телефоне", style = MaterialTheme.typography.titleLarge)
        Text(
            "Каждое выбранное окно Hassle запускается на своём виртуальном дисплее и показывается " +
                "плавающим окном поверх всех приложений. Окон может быть больше двух: это окна " +
                "самого приложения, а не системные плавающие окна MIUI.",
            style = MaterialTheme.typography.bodySmall,
        )

        Text("Какие окна запускать", style = MaterialTheme.typography.titleMedium)
        // Три равные колонки: подпись не переносится («Hassl / e 3») даже на узком экране или с крупным шрифтом.
        // Нажатие на подпись тоже переключает галочку.
        for (row in listOf(listOf(1, 2, 3), listOf(4, 5, 6))) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                for (n in row) {
                    val toggle = { checked: Boolean ->
                        if (checked) {
                            if (n !in selected) selected.add(n)
                        } else {
                            selected.remove(n)
                        }
                        saveSettings()
                    }
                    Row(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { toggle(n !in selected) },
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Checkbox(
                            checked = n in selected,
                            onCheckedChange = { toggle(it) },
                        )
                        Text(
                            "Hassle $n",
                            maxLines = 1,
                            softWrap = false,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        }

        Text("Параметры дисплея", style = MaterialTheme.typography.titleMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = width,
                onValueChange = {
                    width = it.filter(Char::isDigit)
                    saveSettings()
                },
                label = { Text("Ширина") },
                singleLine = true,
                keyboardOptions = numberOptions,
                modifier = Modifier.weight(1f),
            )
            OutlinedTextField(
                value = height,
                onValueChange = {
                    height = it.filter(Char::isDigit)
                    saveSettings()
                },
                label = { Text("Высота") },
                singleLine = true,
                keyboardOptions = numberOptions,
                modifier = Modifier.weight(1f),
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = dpi,
                onValueChange = {
                    dpi = it.filter(Char::isDigit)
                    saveSettings()
                },
                label = { Text("DPI") },
                singleLine = true,
                keyboardOptions = numberOptions,
                modifier = Modifier.weight(1f),
            )
            OutlinedTextField(
                value = delaySec,
                onValueChange = {
                    delaySec = it.filter(Char::isDigit)
                    saveSettings()
                },
                label = { Text("Пауза между запусками, с") },
                singleLine = true,
                keyboardOptions = numberOptions,
                modifier = Modifier.weight(1f),
            )
        }

        Button(
            enabled = !HassleState.busy,
            modifier = Modifier.fillMaxWidth(),
            onClick = {
                saveSettings()
                val w = width.toIntOrNull() ?: 0
                val h = height.toIntOrNull() ?: 0
                val d = dpi.toIntOrNull() ?: 0
                val pause = delaySec.toIntOrNull() ?: 6
                if (w <= 0 || h <= 0 || d <= 0) {
                    HassleState.add("Проверьте ширину, высоту и DPI.")
                } else if (viewModel.repository.connectionStatus.value != ConnectionStatus.CONNECTED) {
                    HassleState.add("Нет связи с Shizuku-сервисом. Запустите Shizuku и перезайдите в приложение.")
                } else {
                    val slots = selected.sorted()
                    runOp { controller.start(slots, w, h, d, pause, HassleState::add) }
                }
            },
        ) {
            Text("Запустить выбранные")
        }

        OutlinedButton(
            enabled = !HassleState.busy,
            modifier = Modifier.fillMaxWidth(),
            onClick = { controller.showExisting(HassleState::add) },
        ) {
            Text("Показать окна заново")
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(
                modifier = Modifier.weight(1f),
                onClick = { controller.hideWindows() },
            ) {
                Text("Убрать окна")
            }
            OutlinedButton(
                enabled = !HassleState.busy,
                modifier = Modifier.weight(1f),
                onClick = { runOp { controller.stopAll(HassleState::add) } },
            ) {
                Text("Остановить всё")
            }
        }

        Text(
            "Убрать окна: игры продолжают работать в фоне. Остановить всё: игры закрываются, дисплеи удаляются.",
            style = MaterialTheme.typography.bodySmall,
        )

        Text("Журнал", style = MaterialTheme.typography.titleMedium)
        if (HassleState.log.isEmpty()) {
            Text("Пока пусто.", style = MaterialTheme.typography.bodySmall)
        } else {
            for (line in HassleState.log) {
                Text(line, style = MaterialTheme.typography.bodySmall)
            }
        }

        Text(
            "Если окна не появляются: включите «Поверх других окон» и, на MIUI, «Всплывающие окна " +
                "в фоновом режиме» для этого приложения, а в настройках батареи поставьте «Нет ограничений». " +
                "Пакеты игр: " + HassleConfig.PACKAGES.joinToString(", "),
            style = MaterialTheme.typography.bodySmall,
        )
    }
}
