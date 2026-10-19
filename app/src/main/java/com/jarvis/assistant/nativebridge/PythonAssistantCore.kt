package com.jarvis.assistant.nativebridge

import android.content.Context
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform

/** Optional deterministic intent helper. AI requests still use the configured Gemini connection. */
object PythonAssistantCore {
    fun classifyIntent(context: Context, text: String): String {
        return try {
            if (!Python.isStarted()) Python.start(AndroidPlatform(context.applicationContext))
            Python.getInstance().getModule("jarvis_core").callAttr("classify_intent", text).toString()
        } catch (_: Exception) { "general" }
    }
}
