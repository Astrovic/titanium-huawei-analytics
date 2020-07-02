package huawei.analytics

import android.os.Bundle
import com.huawei.hms.analytics.HiAnalytics
import com.huawei.hms.analytics.HiAnalyticsInstance
import com.huawei.hms.analytics.HiAnalyticsTools
import org.appcelerator.kroll.KrollDict
import org.appcelerator.kroll.KrollModule
import org.appcelerator.kroll.annotations.Kroll
import org.appcelerator.kroll.annotations.Kroll.method
import org.appcelerator.kroll.annotations.Kroll.module
import org.appcelerator.kroll.annotations.Kroll.setProperty
import org.appcelerator.kroll.common.Log
import org.appcelerator.titanium.TiApplication
import org.appcelerator.titanium.TiBlob
import org.appcelerator.titanium.io.TiBaseFile
import org.appcelerator.titanium.util.TiConvert
import java.io.IOException


@module(name = "TitaniumHuaweiAnalytics", id = "huawei.analytics")
class TitaniumHuaweiAnalyticsModule : KrollModule() {

    private lateinit var instance: HiAnalyticsInstance

    @method
    fun configure() {
        HiAnalyticsTools.enableLog()
        instance = HiAnalytics.getInstance(TiApplication.getAppCurrentActivity())
    }

    @method
    fun log(key: String, value: KrollDict) {
        instance.onEvent(key, mapToBundle(value))
    }

    @method
    @setProperty
    fun setAnalyticsEnabled(analyticsEnabled: Boolean) {
        instance.setAnalyticsEnabled(analyticsEnabled)
    }

    private fun mapToBundle(map: Map<String, Any?>?): Bundle? {
        if (map == null) return Bundle()
        val bundle = Bundle(map.size)
        for (key in map.keys) {
            val value = map[key]
            if (value == null) {
                bundle.putString(key, null)
            } else if (value is TiBlob) {
                bundle.putByteArray(key, value.bytes)
            } else if (value is TiBaseFile) {
                try {
                    bundle.putByteArray(key, value.read().bytes)
                } catch (e: IOException) {
                    Log.e("FacebookModule-Util",
                            "Unable to put '" + key + "' value into bundle: " + e.getLocalizedMessage(), e)
                }
            } else {
                bundle.putString(key, TiConvert.toString(value))
            }
        }
        return bundle
    }
}