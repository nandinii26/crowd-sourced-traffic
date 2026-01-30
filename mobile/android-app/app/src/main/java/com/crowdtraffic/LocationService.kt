package com.crowdtraffic

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.location.Location
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import android.os.Handler
import android.os.Looper
import com.squareup.okhttp3.OkHttpClient
import com.squareup.okhttp3.Request
import com.squareup.okhttp3.RequestBody.Companion.toRequestBody
import com.squareup.okhttp3.MediaType.Companion.toMediaType
import org.json.JSONObject
import java.util.UUID

class LocationService : Service() {
    private val CHANNEL_ID = "crowd_traffic_fg"
    private val handler = Handler(Looper.getMainLooper())
    private val httpClient = OkHttpClient()
    
    // Backend URL - Change based on your setup:
    // For emulator: http://10.0.2.2:3000
    // For physical device: http://172.30.224.1:3000
    private val BACKEND_URL = "http://10.0.2.2:3000/ingest"

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(1, buildNotification())
        handler.post(sampleRunnable)
    }

    private val sampleRunnable = object : Runnable {
        override fun run() {
            // Sample location (placeholder). Replace with real location callback.
            val fakeLocation = Location("mock").apply {
                latitude = 37.7749
                longitude = -122.4194
                speed = 5.0f
            }
            sendLocationToBackend(fakeLocation)
            handler.postDelayed(this, 30_000) // sample every 30s
        }
    }

    private fun sendLocationToBackend(location: Location) {
        val payload = JSONObject().apply {
            put("anonymized_id", UUID.randomUUID().toString())
            put("latitude", location.latitude)
            put("longitude", location.longitude)
            put("speed", location.speed)
            put("heading", location.bearing)
            put("timestamp", System.currentTimeMillis())
        }

        val mediaType = "application/json; charset=utf-8".toMediaType()
        val request = Request.Builder()
            .url(BACKEND_URL)
            .post(payload.toString().toRequestBody(mediaType))
            .build()

        try {
            httpClient.newCall(request).execute().use { response ->
                if (response.isSuccessful) {
                    android.util.Log.d("LocationService", "Data sent successfully")
                } else {
                    android.util.Log.e("LocationService", "Failed: ${response.code}")
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("LocationService", "Error sending data: ${e.message}")
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(sampleRunnable)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(CHANNEL_ID, "CrowdTraffic", NotificationManager.IMPORTANCE_LOW)
            val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            nm.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("CrowdTraffic")
            .setContentText("Collecting anonymized traffic data")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .build()
    }
}
