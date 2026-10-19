package com.jarvis.assistant.ui.settings

import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.LinearLayout
import android.widget.RadioGroup
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SwitchCompat
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.jarvis.assistant.JarvisApp
import com.jarvis.assistant.R
import com.jarvis.assistant.util.ThemeManager

class OverlayAvatarActivity : AppCompatActivity() {
    private val preferences get() = JarvisApp.instance.preferences
    private val avatars = listOf("JARVIS", "Orb", "Robot", "Ghost", "Cat", "Alien", "Star", "Flower", "Cloud", "Hexagon", "Droid", "Mech")
    override fun onCreate(savedInstanceState: Bundle?) {
        ThemeManager.applyTheme(this); super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_overlay_avatar)
        ThemeManager.applyDynamicBackground(findViewById(R.id.overlayAvatarRoot))
        findViewById<android.view.View>(R.id.btnBack).setOnClickListener { finish() }
        val toggle = findViewById<SwitchCompat>(R.id.switchOverlayEnabled).apply {
            isChecked = preferences.isTaskOverlayEnabled
            setOnCheckedChangeListener { _, enabled -> preferences.isTaskOverlayEnabled = enabled }
        }
        val modeGroup = findViewById<RadioGroup>(R.id.radioOverlayMode)
        modeGroup.check(if (preferences.taskOverlayMode == "working") R.id.rbOverlayWorking else R.id.rbOverlayAlways)
        modeGroup.setOnCheckedChangeListener { _, id -> preferences.taskOverlayMode = if (id == R.id.rbOverlayWorking) "working" else "always" }
        val spinner = findViewById<android.widget.Spinner>(R.id.spinnerOverlayEdge)
        val edges = listOf("right", "left", "top", "bottom")
        spinner.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, edges)
        spinner.setSelection(edges.indexOf(preferences.taskOverlayEdge).coerceAtLeast(0))
        spinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: android.view.View?, position: Int, id: Long) {
                edges.getOrNull(position)?.let { preferences.taskOverlayFreePosition = false; preferences.taskOverlayEdge = it }
            }
            override fun onNothingSelected(parent: AdapterView<*>?) = Unit
        }
        val gallery = findViewById<RecyclerView>(R.id.avatarGallery)
        gallery.layoutManager = GridLayoutManager(this, 3)
        gallery.adapter = AvatarAdapter { selected -> preferences.taskOverlayAvatar = selected.lowercase() }
    }
    private inner class AvatarAdapter(private val select: (String) -> Unit) : RecyclerView.Adapter<AvatarHolder>() {
        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AvatarHolder {
            val box = LinearLayout(parent.context).apply { orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER; setPadding(12,18,12,18); isClickable = true; isFocusable = true }
            val glyph = TextView(parent.context).apply { textSize = 28f; gravity = Gravity.CENTER }
            val label = TextView(parent.context).apply { textSize = 12f; gravity = Gravity.CENTER; setTextColor(0xffdce8f5.toInt()) }
            box.addView(glyph, LinearLayout.LayoutParams(-1, 66)); box.addView(label, LinearLayout.LayoutParams(-1, -2))
            return AvatarHolder(box, glyph, label)
        }
        override fun getItemCount() = avatars.size
        override fun onBindViewHolder(holder: AvatarHolder, position: Int) {
            val name = avatars[position]; holder.label.text = name
            holder.glyph.text = when(name) { "Cat" -> "🐈"; "Ghost" -> "👻"; "Alien" -> "👽"; "Robot", "Droid", "Mech" -> "🤖"; "Star" -> "✦"; "Flower" -> "✿"; "Cloud" -> "☁"; else -> "◉" }
            holder.itemView.setOnClickListener { select(name); notifyDataSetChanged() }
            holder.itemView.alpha = if (preferences.taskOverlayAvatar.equals(name, true)) 1f else .72f
        }
    }
    private class AvatarHolder(v: android.view.View, val glyph: TextView, val label: TextView) : RecyclerView.ViewHolder(v)
}
