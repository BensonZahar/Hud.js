package com.ynk.virtualdisplay.data.model

sealed class ShizukuState {
    data object Checking : ShizukuState()
    data object NotRunning : ShizukuState()
    data object PermissionDenied : ShizukuState()
    data object Ready : ShizukuState()
}

data class AppInfo(val name: String, val packageName: String)

data class DisplayFlag(
    val key: String,
    val bitValue: Int,
    val name: String,
    val description: String,
    val minSdk: Int,
    val isDefaultEnabled: Boolean
)

// Константы флагов виртуального дисплея (включая скрытые системные флаги)
const val VIRTUAL_DISPLAY_FLAG_PUBLIC = 1 shl 0
const val VIRTUAL_DISPLAY_FLAG_PRESENTATION = 1 shl 1
const val VIRTUAL_DISPLAY_FLAG_SECURE = 1 shl 2
const val VIRTUAL_DISPLAY_FLAG_OWN_CONTENT_ONLY = 1 shl 3
const val VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR = 1 shl 4
const val VIRTUAL_DISPLAY_FLAG_CAN_SHOW_WITH_INSECURE_KEYGUARD = 1 shl 5
const val VIRTUAL_DISPLAY_FLAG_SUPPORTS_TOUCH = 1 shl 6
const val VIRTUAL_DISPLAY_FLAG_ROTATES_WITH_CONTENT = 1 shl 7
const val VIRTUAL_DISPLAY_FLAG_DESTROY_CONTENT_ON_REMOVAL = 1 shl 8
const val VIRTUAL_DISPLAY_FLAG_SHOULD_SHOW_SYSTEM_DECORATIONS = 1 shl 9
const val VIRTUAL_DISPLAY_FLAG_TRUSTED = 1 shl 10
const val VIRTUAL_DISPLAY_FLAG_OWN_DISPLAY_GROUP = 1 shl 11
const val VIRTUAL_DISPLAY_FLAG_ALWAYS_UNLOCKED = 1 shl 12
const val VIRTUAL_DISPLAY_FLAG_TOUCH_FEEDBACK_DISABLED = 1 shl 13
const val VIRTUAL_DISPLAY_FLAG_OWN_FOCUS = 1 shl 14
const val VIRTUAL_DISPLAY_FLAG_DEVICE_DISPLAY_GROUP = 1 shl 15

// Описания приблизительные и могут быть неполными
val ALL_DISPLAY_FLAGS = listOf(
    DisplayFlag("flag_public", VIRTUAL_DISPLAY_FLAG_PUBLIC, "Public Display", "Разрешает другим приложениям выводить картинку на этот дисплей. Без флага дисплей приватный и доступен только создателю", 19, true),
    DisplayFlag("flag_presentation", VIRTUAL_DISPLAY_FLAG_PRESENTATION, "Presentation Display", "Помечает дисплей как презентационный (внешний или второй экран). Система оптимизирует его под окна Presentation", 19, true),
    DisplayFlag("flag_secure", VIRTUAL_DISPLAY_FLAG_SECURE, "Secure Display", "Защищает содержимое: запрещает скриншоты, запись экрана и зеркалирование на незащищённые дисплеи", 19, false),
    DisplayFlag("flag_own_content_only", VIRTUAL_DISPLAY_FLAG_OWN_CONTENT_ONLY, "Own Content Only", "Дисплей показывает только своё содержимое. Когда он пуст, главный экран на него не зеркалируется", 19, true),
    DisplayFlag("flag_auto_mirror", VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, "Auto Mirror", "Если на дисплее ничего нет, система автоматически зеркалирует на него главный экран. Несовместим с Own Content Only", 21, false),
    DisplayFlag("flag_can_show_with_insecure_keyguard", VIRTUAL_DISPLAY_FLAG_CAN_SHOW_WITH_INSECURE_KEYGUARD, "Show on Insecure Keyguard", "Разрешает показывать на дисплее окна и приложения, которым можно работать при небезопасной блокировке экрана", 29, false),
    DisplayFlag("flag_supports_touch", VIRTUAL_DISPLAY_FLAG_SUPPORTS_TOUCH, "Supports Touch", "Показывает, что у дисплея есть устройство ввода: касания можно передавать и внедрять", 26, true),
    DisplayFlag("flag_rotates_with_content", VIRTUAL_DISPLAY_FLAG_ROTATES_WITH_CONTENT, "Rotates with Content", "Ориентация дисплея автоматически следует за ориентацией его содержимого", 26, true),
    DisplayFlag("flag_destroy_content_on_removal", VIRTUAL_DISPLAY_FLAG_DESTROY_CONTENT_ON_REMOVAL, "Destroy Content on Removal", "При удалении дисплея принудительно закрывает все активити на нём, чтобы ничего не оставалось", 26, true),
    DisplayFlag("flag_system_decorations", VIRTUAL_DISPLAY_FLAG_SHOULD_SHOW_SYSTEM_DECORATIONS, "System Decorations", "Рисует на дисплее строку состояния, панель навигации, обои и клавиатуру (IME): полноценный системный интерфейс", 29, true),
    DisplayFlag("flag_trusted", VIRTUAL_DISPLAY_FLAG_TRUSTED, "Trusted Display", "Помечает дисплей как доверенный (нужны привилегии). Необходим для системных элементов и чувствительного ввода", 33, true),
    DisplayFlag("flag_own_display_group", VIRTUAL_DISPLAY_FLAG_OWN_DISPLAY_GROUP, "Own Display Group", "Выносит дисплей в отдельную группу дисплеев. Система не смешивает его с мультиоконностью главного экрана, стеки активити независимы", 33, true),
    DisplayFlag("flag_always_unlocked", VIRTUAL_DISPLAY_FLAG_ALWAYS_UNLOCKED, "Always Unlocked", "Дисплей всегда разблокирован: приложения на нём не блокируются экраном блокировки", 33, true),
    DisplayFlag("flag_touch_feedback_disabled", VIRTUAL_DISPLAY_FLAG_TOUCH_FEEDBACK_DISABLED, "Disable Touch Feedback", "Отключает визуальный и вибро-отклик на касания (след указателя, ряби)", 33, true),
    DisplayFlag("flag_own_focus", VIRTUAL_DISPLAY_FLAG_OWN_FOCUS, "Own Focus", "У дисплея собственный фокус: он может быть активен одновременно с главным экраном и получает свой ввод (Android 14+)", 34, true),
    DisplayFlag("flag_device_display_group", VIRTUAL_DISPLAY_FLAG_DEVICE_DISPLAY_GROUP, "Device Display Group", "Привязывает дисплей к группе устройства-компаньона, отличая её от обычной системной группы дисплеев (Android 14+)", 34, false)
)
