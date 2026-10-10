package com.ynk.virtualdisplay.overlay

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.SurfaceTexture
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.InputDevice
import android.view.MotionEvent
import android.view.Surface
import android.view.TextureView
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import com.ynk.virtualdisplay.core.AppScope
import com.ynk.virtualdisplay.data.repository.ConnectionStatus
import com.ynk.virtualdisplay.data.repository.IDisplayRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeoutOrNull

/**
 * Одно плавающее окно поверх всех приложений, в котором рисуется один виртуальный дисплей.
 *
 * Это обычное оверлей-окно нашего приложения (TYPE_APPLICATION_OVERLAY), а не freeform-окно системы,
 * поэтому лимит MIUI "не больше двух плавающих окон" на него не распространяется.
 *
 * Закрытие окна НЕ убивает дисплей и игру: дисплей получает запасную поверхность (ImageReader в сервисе)
 * и продолжает работать в фоне. Окно можно показать заново.
 *
 * Кнопки заголовка: ТАЧ (касания), звук (выкл/вкл звук игры), перезапуск игры (два нажатия подряд),
 * свернуть, закрыть.
 */
@SuppressLint("ClickableViewAccessibility", "SetTextI18n")
class OverlayWindow(
    private val context: Context,
    private val repository: IDisplayRepository,
    private val scope: CoroutineScope,
    val displayId: Int,
    private val title: String,
    private val vdWidth: Int,
    private val vdHeight: Int,
    startX: Int,
    startY: Int,
    startWidthPx: Int,
    /** Пакет игры на этом дисплее. Нужен кнопкам «звук» и «перезапуск»; если null, они скрыты. */
    private val packageName: String?,
    private val onClosed: (Int) -> Unit,
) {

    companion object {
        private const val TAG = "OverlayWindow"

        /** Высота заголовка в dp (используется и сервисом для раскладки сетки окон). */
        const val HEADER_DP = 30

        private const val COLOR_ON = 0xFF66BB6A.toInt()
        private const val COLOR_OFF = 0xFF888888.toInt()
        private const val COLOR_WARN = 0xFFFFA726.toInt()
        private const val RESTART_CONFIRM_MS = 2500L
    }

    private val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    private val density = context.resources.displayMetrics.density
    private fun dp(v: Int): Int = (v * density).toInt()

    private val headerHeight = dp(HEADER_DP)
    private val minWidth = dp(160)
    private val handleSize = dp(30)

    private var collapsed = false
    private var touchEnabled = true
    private var muted = false
    private var restartArmed = false
    private var restarting = false
    private var attached = false
    private var surface: Surface? = null

    private var widthPx = startWidthPx.coerceIn(minWidth, maxOf(minWidth, maxWidthForScreen()))

    private val handler = Handler(Looper.getMainLooper())
    private val disarmRestart = Runnable {
        restartArmed = false
        refreshRestartButton()
    }

    private val root = LinearLayout(context).apply {
        orientation = LinearLayout.VERTICAL
        setBackgroundColor(Color.BLACK)
    }
    private val header = LinearLayout(context).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        setBackgroundColor(0xE6202020.toInt())
    }
    private val titleView = TextView(context)
    private val touchButton = TextView(context)
    private val muteButton = TextView(context)
    private val restartButton = TextView(context)
    private val collapseButton = TextView(context)
    private val closeButton = TextView(context)
    private val content = FrameLayout(context)
    private val textureView = TextureView(context)
    private val resizeHandle = View(context)

    private val params = WindowManager.LayoutParams(
        widthPx,
        totalHeight(widthPx),
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
        PixelFormat.TRANSLUCENT,
    ).apply {
        gravity = Gravity.TOP or Gravity.START
        x = startX
        y = startY
    }

    // ---------- геометрия ----------

    private fun screenSize(): Pair<Int, Int> =
        if (Build.VERSION.SDK_INT >= 30) {
            val b = wm.maximumWindowMetrics.bounds
            b.width() to b.height()
        } else {
            val m = context.resources.displayMetrics
            m.widthPixels to m.heightPixels
        }

    private fun contentHeight(w: Int): Int = (w.toFloat() * vdHeight / vdWidth).toInt().coerceAtLeast(dp(40))

    private fun totalHeight(w: Int): Int = if (collapsed) headerHeight else headerHeight + contentHeight(w)

    /** Самая большая ширина, при которой окно целиком помещается на экране (и по ширине, и по высоте). */
    private fun maxWidthForScreen(): Int {
        val (sw, sh) = screenSize()
        val byHeight = ((sh - headerHeight).toFloat() * vdWidth / vdHeight).toInt()
        return minOf(sw, byHeight)
    }

    /** Применить новую ширину: высота считается по пропорции дисплея, окно не выходит за экран. */
    private fun applySize(requestedWidth: Int) {
        widthPx = requestedWidth.coerceIn(minWidth, maxOf(minWidth, maxWidthForScreen()))
        params.width = widthPx
        params.height = totalHeight(widthPx)

        // Высоту области с картинкой задаём явно и вместе с размером окна, чтобы они менялись синхронно.
        (content.layoutParams as? LinearLayout.LayoutParams)?.let { lp ->
            lp.height = contentHeight(widthPx)
            content.layoutParams = lp
        }

        // При изменении размера окно целиком остаётся на экране (иначе угол с ручкой уезжает за край).
        val (sw, sh) = screenSize()
        params.x = params.x.coerceIn(0, maxOf(0, sw - params.width))
        params.y = params.y.coerceIn(0, maxOf(0, sh - params.height))

        updateTitle()
        updateLayout()
    }

    private fun updateTitle() {
        // В узком окне не хватает места для полного названия: "Hassle 1" -> "H1"
        titleView.text = if (widthPx < dp(240)) title.replace("Hassle ", "H") else title
    }

    // ---------- создание интерфейса ----------

    init {
        titleView.apply {
            setTextColor(Color.WHITE)
            textSize = 12f
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
            setPadding(dp(6), 0, dp(2), 0)
            gravity = Gravity.CENTER_VERTICAL
        }
        updateTitle()
        header.addView(titleView, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.MATCH_PARENT, 1f))

        setupButton(touchButton, "ТАЧ", 11f) { toggleTouch() }
        setupButton(muteButton, "🔊", 12f) { toggleMute() }
        setupButton(restartButton, "↻", 17f) { onRestartClick() }
        setupButton(collapseButton, "—", 12f) { toggleCollapsed() }
        setupButton(closeButton, "✕", 12f) { close() }
        refreshTouchButton()
        refreshMuteButton()
        refreshRestartButton()

        header.addView(touchButton, buttonParams(34))
        if (packageName != null) {
            header.addView(muteButton, buttonParams(30))
            header.addView(restartButton, buttonParams(30))
        }
        header.addView(collapseButton, buttonParams(30))
        header.addView(closeButton, buttonParams(30))
        setupHeaderDrag()

        textureView.surfaceTextureListener = object : TextureView.SurfaceTextureListener {
            override fun onSurfaceTextureAvailable(st: SurfaceTexture, width: Int, height: Int) {
                st.setDefaultBufferSize(vdWidth, vdHeight)
                val s = Surface(st)
                surface = s
                scope.launch(Dispatchers.Main.immediate) {
                    val r = repository.setDisplaySurface(displayId, s)
                    r.exceptionOrNull()?.let { Log.e(TAG, "setDisplaySurface($displayId) failed", it) }
                }
            }

            override fun onSurfaceTextureSizeChanged(st: SurfaceTexture, width: Int, height: Int) {}

            override fun onSurfaceTextureDestroyed(st: SurfaceTexture): Boolean {
                val old = surface
                surface = null
                // null: remove() уже вернул дисплей на запасную поверхность. Повторный сброс здесь мог бы
                // перебить поверхность нового окна, если оно успело подключиться к этому же дисплею.
                if (old == null) return true
                AppScope.scope.launch(Dispatchers.Main.immediate) {
                    try {
                        // null -> сервис вернёт дисплею запасную поверхность, игра продолжит работать
                        repository.setDisplaySurface(displayId, null)
                    } finally {
                        old?.release()
                    }
                }
                return true
            }

            override fun onSurfaceTextureUpdated(st: SurfaceTexture) {}
        }
        textureView.setOnTouchListener { v, event -> forwardTouch(v, event) }

        content.addView(
            textureView,
            FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT),
        )
        resizeHandle.setBackgroundColor(0x80FFFFFF.toInt())
        content.addView(
            resizeHandle,
            FrameLayout.LayoutParams(handleSize, handleSize, Gravity.BOTTOM or Gravity.END),
        )
        setupResizeHandle()

        root.addView(header, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, headerHeight))
        root.addView(content, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, contentHeight(widthPx)))

        if (packageName != null) queryMuteState(packageName)
    }

    private fun buttonParams(widthDp: Int) = LinearLayout.LayoutParams(dp(widthDp), ViewGroup.LayoutParams.MATCH_PARENT)

    private fun setupButton(view: TextView, label: String, size: Float, onClick: () -> Unit) {
        view.apply {
            text = label
            setTextColor(Color.WHITE)
            textSize = size
            gravity = Gravity.CENTER
            includeFontPadding = false
            setOnClickListener { onClick() }
        }
    }

    // ---------- кнопки ----------

    private fun refreshTouchButton() {
        touchButton.setTextColor(if (touchEnabled) COLOR_ON else COLOR_OFF)
    }

    private fun toggleTouch() {
        touchEnabled = !touchEnabled
        refreshTouchButton()
    }

    private fun refreshMuteButton() {
        muteButton.text = if (muted) "🔇" else "🔊"
    }

    /** Узнать, выключен ли уже звук игры (настройка приложения хранится в системе и переживает перезапуск). */
    private fun queryMuteState(pkg: String) {
        scope.launch {
            val connected = withTimeoutOrNull(10_000L) {
                repository.connectionStatus.first { it == ConnectionStatus.CONNECTED }
            }
            if (connected == null) return@launch
            repository.runShell("cmd appops get $pkg PLAY_AUDIO").onSuccess { out ->
                muted = Regex("PLAY_AUDIO: *(ignore|deny|errored)").containsMatchIn(out)
                refreshMuteButton()
            }
        }
    }

    /** Звук отключается на уровне приложения (appops PLAY_AUDIO), поэтому действует сразу, без перезапуска игры. */
    private fun toggleMute() {
        val pkg = packageName ?: return
        val newMuted = !muted
        muted = newMuted
        refreshMuteButton()
        scope.launch {
            val mode = if (newMuted) "ignore" else "allow"
            repository.runShell("cmd appops set $pkg PLAY_AUDIO $mode").onFailure {
                Log.w(TAG, "mute($pkg) failed", it)
                muted = !newMuted
                refreshMuteButton()
            }
        }
    }

    private fun refreshRestartButton() {
        when {
            restarting -> {
                restartButton.text = "↻"
                restartButton.setTextColor(COLOR_OFF)
            }
            restartArmed -> {
                restartButton.text = "↻?"
                restartButton.setTextColor(COLOR_WARN)
            }
            else -> {
                restartButton.text = "↻"
                restartButton.setTextColor(Color.WHITE)
            }
        }
    }

    /** Первое нажатие подсвечивает кнопку, второе в течение пары секунд перезапускает игру (защита от случайных нажатий). */
    private fun onRestartClick() {
        if (restarting) return
        if (!restartArmed) {
            restartArmed = true
            refreshRestartButton()
            handler.postDelayed(disarmRestart, RESTART_CONFIRM_MS)
            return
        }
        handler.removeCallbacks(disarmRestart)
        restartArmed = false
        restartGame()
    }

    private fun restartGame() {
        val pkg = packageName ?: return
        restarting = true
        refreshRestartButton()
        scope.launch {
            try {
                repository.runShell("am force-stop $pkg")
                delay(800)
                repository.launchApp(pkg, displayId)
                    .onFailure { Log.w(TAG, "restart launch($pkg) failed", it) }
            } finally {
                restarting = false
                refreshRestartButton()
            }
        }
    }

    private fun toggleCollapsed() {
        collapsed = !collapsed
        // GONE уничтожает SurfaceTexture -> дисплей уходит на запасную поверхность (экономит батарею),
        // при разворачивании окно снова подключается к дисплею.
        content.visibility = if (collapsed) View.GONE else View.VISIBLE
        applySize(widthPx)
    }

    // ---------- перетаскивание и изменение размера ----------

    private fun setupHeaderDrag() {
        var downRawX = 0f
        var downRawY = 0f
        var startPosX = 0
        var startPosY = 0
        header.setOnTouchListener { _, e ->
            when (e.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    downRawX = e.rawX
                    downRawY = e.rawY
                    startPosX = params.x
                    startPosY = params.y
                }
                MotionEvent.ACTION_MOVE -> {
                    val (sw, sh) = screenSize()
                    val keep = dp(72) // сколько заголовка минимум остаётся на экране, чтобы окно можно было вернуть
                    params.x = (startPosX + (e.rawX - downRawX).toInt()).coerceIn(keep - params.width, sw - keep)
                    params.y = (startPosY + (e.rawY - downRawY).toInt()).coerceIn(0, sh - headerHeight)
                    updateLayout()
                }
            }
            true
        }
    }

    /**
     * Размер меняется за правый нижний угол с сохранением пропорций дисплея.
     * Смещение пальца проецируется на диагональ окна, поэтому угол идёт за пальцем и по горизонтали, и по вертикали.
     */
    private fun setupResizeHandle() {
        var downRawX = 0f
        var downRawY = 0f
        var startWidth = 0
        val ratio = vdHeight.toFloat() / vdWidth
        resizeHandle.setOnTouchListener { _, e ->
            when (e.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    downRawX = e.rawX
                    downRawY = e.rawY
                    startWidth = widthPx
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = e.rawX - downRawX
                    val dy = e.rawY - downRawY
                    val dw = (dx + dy * ratio) / (1f + ratio * ratio)
                    applySize(startWidth + dw.toInt())
                }
            }
            true
        }
    }

    /** Координаты касания в окне -> координаты виртуального дисплея, затем инъекция через Shizuku. */
    private fun forwardTouch(view: View, event: MotionEvent): Boolean {
        if (!touchEnabled) return true
        val vw = view.width.toFloat()
        val vh = view.height.toFloat()
        if (vw <= 0f || vh <= 0f) return true
        val sx = vdWidth / vw
        val sy = vdHeight / vh

        val count = event.pointerCount
        val props = Array(count) { MotionEvent.PointerProperties() }
        val coords = Array(count) { MotionEvent.PointerCoords() }
        for (i in 0 until count) {
            event.getPointerProperties(i, props[i])
            event.getPointerCoords(i, coords[i])
            coords[i].x = (coords[i].x * sx).coerceIn(0f, vdWidth.toFloat())
            coords[i].y = (coords[i].y * sy).coerceIn(0f, vdHeight.toFloat())
        }
        val mapped = MotionEvent.obtain(
            event.downTime,
            event.eventTime,
            event.action,
            count,
            props,
            coords,
            event.metaState,
            event.buttonState,
            event.xPrecision,
            event.yPrecision,
            0,
            event.edgeFlags,
            InputDevice.SOURCE_TOUCHSCREEN,
            event.flags,
        )
        scope.launch(Dispatchers.Main.immediate) {
            try {
                repository.injectInputWithDisplayId(mapped, displayId)
            } finally {
                mapped.recycle()
            }
        }
        return true
    }

    private fun updateLayout() {
        if (!attached) return
        try {
            wm.updateViewLayout(root, params)
        } catch (e: Exception) {
            Log.w(TAG, "updateViewLayout failed", e)
        }
    }

    fun show(): Boolean {
        if (attached) return true
        return try {
            // Окно, показанное заново или созданное у края, не должно оказаться за экраном
            applyBoundsBeforeShow()
            wm.addView(root, params)
            attached = true
            true
        } catch (e: Exception) {
            Log.e(TAG, "addView failed (нет разрешения 'Поверх других окон'?)", e)
            false
        }
    }

    private fun applyBoundsBeforeShow() {
        val (sw, sh) = screenSize()
        params.x = params.x.coerceIn(0, maxOf(0, sw - params.width))
        params.y = params.y.coerceIn(0, maxOf(0, sh - params.height))
    }

    /** Убрать окно с экрана (дисплей и игра продолжают работать). */
    fun remove() {
        handler.removeCallbacks(disarmRestart)
        if (!attached) return
        attached = false
        try {
            wm.removeView(root)
        } catch (e: Exception) {
            Log.w(TAG, "removeView failed", e)
        }
        // Дисплей возвращаем на запасную поверхность сразу и в области процесса. Раньше это делал
        // колбэк TextureView уже после остановки сервиса, когда его корутины отменены, и дисплей оставался
        // привязан к уничтоженной поверхности (игра шла в фоне, но кадры уходили в никуда).
        val old = surface
        surface = null
        if (old != null) {
            AppScope.scope.launch(Dispatchers.Main.immediate) {
                try {
                    repository.setDisplaySurface(displayId, null)
                } finally {
                    old.release()
                }
            }
        }
    }

    private fun close() {
        remove()
        onClosed(displayId)
    }
}
