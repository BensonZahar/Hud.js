package com.ynk.virtualdisplay.overlay

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.content.ContextCompat
import com.ynk.virtualdisplay.MyApplication
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel

/**
 * Держит плавающие окна дисплеев. Работает как foreground-сервис, чтобы система не убивала
 * процесс приложения, пока окна на экране.
 */
class OverlayService : Service() {

    companion object {
        private const val TAG = "OverlayService"
        private const val CHANNEL_ID = "overlay_windows"
        private const val NOTIFICATION_ID = 4201

        const val ACTION_SHOW = "com.ynk.virtualdisplay.overlay.SHOW"
        const val ACTION_HIDE = "com.ynk.virtualdisplay.overlay.HIDE"
        const val ACTION_HIDE_ALL = "com.ynk.virtualdisplay.overlay.HIDE_ALL"

        private const val EXTRA_DISPLAY_ID = "display_id"
        private const val EXTRA_TITLE = "title"
        private const val EXTRA_WIDTH = "vd_width"
        private const val EXTRA_HEIGHT = "vd_height"
        private const val EXTRA_SLOT = "slot"
        private const val EXTRA_PACKAGE = "package"

        @Volatile
        var running: Boolean = false
            private set

        /** Показать окно для дисплея. slot (0,1,2...) определяет место в сетке на экране телефона. */
        fun show(
            context: Context,
            displayId: Int,
            title: String,
            vdWidth: Int,
            vdHeight: Int,
            slot: Int,
            packageName: String? = null,
        ) {
            val intent = Intent(context, OverlayService::class.java).apply {
                action = ACTION_SHOW
                putExtra(EXTRA_DISPLAY_ID, displayId)
                putExtra(EXTRA_TITLE, title)
                putExtra(EXTRA_WIDTH, vdWidth)
                putExtra(EXTRA_HEIGHT, vdHeight)
                putExtra(EXTRA_SLOT, slot)
                putExtra(EXTRA_PACKAGE, packageName)
            }
            ContextCompat.startForegroundService(context, intent)
        }

        fun hideAll(context: Context) {
            if (!running) return
            context.startService(Intent(context, OverlayService::class.java).apply { action = ACTION_HIDE_ALL })
        }
    }

    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private val windows = HashMap<Int, OverlayWindow>()

    override fun onCreate() {
        super.onCreate()
        running = true
        createChannel()
        val notification = buildNotification()
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
        // Привязка к Shizuku-сервису нужна окнам для вывода картинки и касаний, даже если главный экран закрыт.
        val repository = (application as MyApplication).displayRepository
        repository.bindService(this)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent == null) {
            if (windows.isEmpty()) stopSelf()
            return START_NOT_STICKY
        }
        when (intent.action) {
            ACTION_SHOW -> handleShow(intent)
            ACTION_HIDE -> {
                hide(intent.getIntExtra(EXTRA_DISPLAY_ID, -1))
                if (windows.isEmpty()) stopSelf()
            }
            ACTION_HIDE_ALL -> {
                hideAll()
                stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    private fun handleShow(intent: Intent) {
        val displayId = intent.getIntExtra(EXTRA_DISPLAY_ID, -1)
        val vdWidth = intent.getIntExtra(EXTRA_WIDTH, 0)
        val vdHeight = intent.getIntExtra(EXTRA_HEIGHT, 0)
        if (displayId < 0 || vdWidth <= 0 || vdHeight <= 0) {
            Log.w(TAG, "handleShow: bad extras id=$displayId size=${vdWidth}x$vdHeight")
            return
        }
        // Уже есть окно для этого дисплея - пересоздаём (на случай зависшего окна)
        windows.remove(displayId)?.remove()

        val title = intent.getStringExtra(EXTRA_TITLE) ?: "Display $displayId"
        val slot = intent.getIntExtra(EXTRA_SLOT, windows.size)
        val packageName = intent.getStringExtra(EXTRA_PACKAGE)

        // Сетка в 2 колонки на экране телефона
        val metrics = resources.displayMetrics
        val margin = (6 * metrics.density).toInt()
        val columns = 2
        val winWidth = (metrics.widthPixels - margin * (columns + 1)) / columns
        val winHeight = (OverlayWindow.HEADER_DP * metrics.density).toInt() + (winWidth.toFloat() * vdHeight / vdWidth).toInt()
        val col = slot % columns
        val row = slot / columns
        val x = margin + col * (winWidth + margin)
        val y = (36 * metrics.density).toInt() + row * (winHeight + margin)

        val repository = (application as MyApplication).displayRepository
        val window = OverlayWindow(
            context = this,
            repository = repository,
            scope = scope,
            displayId = displayId,
            title = title,
            vdWidth = vdWidth,
            vdHeight = vdHeight,
            startX = x,
            startY = y,
            startWidthPx = winWidth,
            packageName = packageName,
            onClosed = { id ->
                windows.remove(id)
                if (windows.isEmpty()) stopSelf()
            },
        )
        if (window.show()) {
            windows[displayId] = window
        } else if (windows.isEmpty()) {
            stopSelf()
        }
    }

    private fun hide(displayId: Int) {
        windows.remove(displayId)?.remove()
    }

    private fun hideAll() {
        windows.values.toList().forEach { it.remove() }
        windows.clear()
    }

    override fun onDestroy() {
        hideAll()
        scope.cancel()
        running = false
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createChannel() {
        val manager = getSystemService(NotificationManager::class.java)
        val channel = NotificationChannel(CHANNEL_ID, "Плавающие окна", NotificationManager.IMPORTANCE_LOW)
        manager.createNotificationChannel(channel)
    }

    private fun buildNotification(): Notification {
        val stopIntent = PendingIntent.getService(
            this,
            0,
            Intent(this, OverlayService::class.java).apply { action = ACTION_HIDE_ALL },
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
        return Notification.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_menu_view)
            .setContentTitle("Окна дисплеев открыты")
            .setContentText("Нажмите, чтобы убрать окна (игры продолжат работать)")
            .setContentIntent(stopIntent)
            .setOngoing(true)
            .build()
    }
}
