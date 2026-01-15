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

class LocationService : Service() {
    private val CHANNEL_ID = "crowd_traffic_fg"
    private val handler = Handler(Looper.getMainLooper())

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(1, buildNotification())
        // In production: use FusedLocationProviderClient with optimized intervals
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
            // Build anonymized payload and POST to backend `/ingest`
            // Use optimized batching and significant-movement heuristics to save battery

            handler.postDelayed(this, 30_000) // sample every 30s (example)
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
