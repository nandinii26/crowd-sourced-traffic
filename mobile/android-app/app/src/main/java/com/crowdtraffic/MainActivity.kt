package com.crowdtraffic

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Simple UI should request consent and start LocationService
        // For scaffold, we directly start the service (in real app show consent screen)
        val intent = Intent(this, LocationService::class.java)
        startForegroundService(intent)
        finish()
    }
}
