#include <jni.h>
#include <string>
#include <algorithm>
#include <cctype>

extern "C" JNIEXPORT jstring JNICALL
Java_com_jarvis_assistant_nativebridge_NativeEngine_normalizeCommand(JNIEnv* env, jobject, jstring input) {
    if (input == nullptr) return env->NewStringUTF("");
    const char* raw = env->GetStringUTFChars(input, nullptr);
    std::string value(raw ? raw : "");
    if (raw) env->ReleaseStringUTFChars(input, raw);
    std::transform(value.begin(), value.end(), value.begin(), [](unsigned char c){ return static_cast<char>(std::tolower(c)); });
    value.erase(value.begin(), std::find_if(value.begin(), value.end(), [](unsigned char c){ return !std::isspace(c); }));
    value.erase(std::find_if(value.rbegin(), value.rend(), [](unsigned char c){ return !std::isspace(c); }).base(), value.end());
    return env->NewStringUTF(value.c_str());
}
