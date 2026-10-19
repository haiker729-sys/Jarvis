package com.jarvis.assistant.ui.orb

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RadialGradient
import android.graphics.Shader
import android.graphics.Color
import android.util.AttributeSet
import android.view.View
import android.view.animation.LinearInterpolator
import kotlin.math.min

/** Native Canvas-based JARVIS orb. No WebView, HTML, CSS or JavaScript. */
class JarvisOrbView @JvmOverloads constructor(
    context: Context, attrs: AttributeSet? = null
) : View(context, attrs) {
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private var phase = 0f
    private var state = "idle"
    private var accent = Color.rgb(0, 190, 255)
    private var backgroundTint = Color.TRANSPARENT
    private val animator = ValueAnimator.ofFloat(0f, 1f).apply {
        duration = 3600L; repeatCount = ValueAnimator.INFINITE; interpolator = LinearInterpolator()
        addUpdateListener { phase = it.animatedValue as Float; invalidate() }
    }
    init { setLayerType(View.LAYER_TYPE_SOFTWARE, null); animator.start() }
    fun setState(next: String) { state = next.lowercase(); invalidate() }
    fun setTheme(theme: String, customHex: String? = null) {
        accent = when (theme.lowercase()) {
            "red" -> Color.rgb(255, 70, 90)
            "sunset" -> Color.rgb(255, 130, 70)
            "custom" -> try { Color.parseColor(customHex) } catch (_: Exception) { Color.rgb(0,190,255) }
            "light" -> Color.rgb(35, 145, 255)
            else -> Color.rgb(0, 190, 255)
        }
        invalidate()
    }
    fun setExternalAudio(amp: Float, bass: Float, high: Float) { phase += (amp.coerceIn(0f,1f) * .05f); invalidate() }
    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val cx = width / 2f; val cy = height / 2f; val radius = min(width, height) * .31f
        if (width <= 0 || height <= 0) return
        val intensity = when (state) { "listening" -> 1.0f; "speaking" -> .9f; "thinking" -> .72f; else -> .55f }
        paint.style = Paint.Style.FILL
        paint.shader = RadialGradient(cx, cy, radius * 1.9f,
            intArrayOf(withAlpha(accent, (75 * intensity).toInt()), withAlpha(accent, 18), Color.TRANSPARENT),
            floatArrayOf(0f, .55f, 1f), Shader.TileMode.CLAMP)
        canvas.drawCircle(cx, cy, radius * 1.9f, paint); paint.shader = null
        paint.style = Paint.Style.STROKE
        paint.strokeWidth = 2.2f
        paint.color = withAlpha(accent, 100)
        canvas.drawCircle(cx, cy, radius * (1.28f + .04f * kotlin.math.sin(phase * 6.28f)), paint)
        paint.strokeWidth = 1.2f
        for (i in 0..2) {
            paint.color = withAlpha(accent, 170 - i * 35)
            canvas.drawArc(cx-radius*(.8f+i*.16f), cy-radius*(.8f+i*.16f), cx+radius*(.8f+i*.16f), cy+radius*(.8f+i*.16f), phase*360f+i*110f, 105f, false, paint)
        }
        paint.style = Paint.Style.FILL
        paint.shader = RadialGradient(cx-radius*.22f, cy-radius*.28f, radius*1.35f,
            intArrayOf(Color.WHITE, accent, withAlpha(accent, 210)), null, Shader.TileMode.CLAMP)
        canvas.drawCircle(cx, cy, radius * (.82f + .025f*kotlin.math.sin(phase*6.28f)), paint)
        paint.shader = null
        paint.color = Color.WHITE
        paint.textAlign = Paint.Align.CENTER
        paint.textSize = radius * .23f
        paint.typeface = android.graphics.Typeface.create("sans-serif-medium", android.graphics.Typeface.BOLD)
        canvas.drawText("J", cx, cy + radius*.08f, paint)
    }
    private fun withAlpha(color: Int, alpha: Int) = (color and 0x00ffffff) or (alpha.coerceIn(0,255) shl 24)
    override fun onDetachedFromWindow() { animator.cancel(); super.onDetachedFromWindow() }
    override fun onAttachedToWindow() { super.onAttachedToWindow(); if (!animator.isStarted) animator.start() }
}
