package com.jarvis.assistant.nativebridge

/** JNI bridge for small native operations. */
object NativeEngine {
    init { System.loadLibrary("jarvis_native") }
    external fun normalizeCommand(input: String): String
}
