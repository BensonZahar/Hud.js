package com.ynk.virtualdisplay.core

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

/**
 * Область корутин на всё время жизни процесса. Нужна для операций, которые не должны обрываться
 * вместе с экраном или сервисом: запуск игр по очереди, возврат дисплея на запасную поверхность
 * при закрытии окна.
 */
object AppScope {
    val scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
}
