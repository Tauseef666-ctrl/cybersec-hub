package com.cybersec.hub;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.JavascriptInterface;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.BufferedReader;

public class MainActivity extends Activity {
    private WebView webView;
    private FrameLayout container;
    private boolean immersiveMode = true;
    private static final int IMMERSIVE_FLAGS =
        View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
        View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
        View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
        View.SYSTEM_UI_FLAG_FULLSCREEN |
        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(Color.parseColor("#0a0d0d"));
        getWindow().setNavigationBarColor(Color.BLACK);

        container = new FrameLayout(this);
        setContentView(container);

        webView = new WebView(this);
        container.addView(webView, new FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT));

        setupWebView();
        applyImmersiveMode();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                String url = request.getUrl().toString();
                if (url.startsWith("file:///android_asset")) return false;
                if (url.startsWith("http://localhost") || url.startsWith("http://127.")) return false;
                if (url.startsWith("http://10.") || url.startsWith("http://192.") ||
                    url.startsWith("http://172.")) return false;
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                startActivity(intent);
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                view.loadUrl("file:///android_asset/index.html");
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage msg) { return true; }

            @Override
            public void onProgressChanged(WebView view, int newProgress) {}
        });

        webView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String ua, String disp, String mime, long len) {
                try {
                    DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
                    req.setMimeType(mime);
                    req.addRequestHeader("Cookie", CookieManager.getInstance().getCookie(url));
                    req.addRequestHeader("User-Agent", ua);
                    req.setDescription("Downloading...");
                    req.setTitle(URLUtil.guessFileName(url, disp, mime));
                    req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    req.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS,
                        URLUtil.guessFileName(url, disp, mime));
                    DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    dm.enqueue(req);
                    Toast.makeText(MainActivity.this, "Downloading...", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Download failed", Toast.LENGTH_SHORT).show();
                }
            }
        });

        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        String url = getIntent().getDataString();
        if (url == null || url.isEmpty()) {
            url = "file:///android_asset/index.html";
        }
        webView.loadUrl(url);

        webView.setOnKeyListener(new View.OnKeyListener() {
            @Override
            public boolean onKey(View v, int keyCode, KeyEvent event) {
                if (keyCode == KeyEvent.KEYCODE_VOLUME_UP) {
                    webView.evaluateJavascript("if(window._openTerminal)window._openTerminal()", null);
                    return true;
                }
                if (keyCode == KeyEvent.KEYCODE_VOLUME_DOWN) {
                    webView.evaluateJavascript("if(window._closeTerminal)window._closeTerminal()", null);
                    return true;
                }
                return false;
            }
        });
    }

    private void setupWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        s.setTextZoom(100);
        s.setDatabaseEnabled(true);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        String ua = s.getUserAgentString();
        if (!ua.contains("CyberSecHub")) {
            s.setUserAgentString(ua + " CyberSecHubApp/2.0");
        }
    }

    private void applyImmersiveMode() {
        if (immersiveMode) {
            webView.setSystemUiVisibility(IMMERSIVE_FLAGS);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus && immersiveMode) {
            applyImmersiveMode();
        }
    }

    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applyImmersiveMode();
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            webView.evaluateJavascript(
                "(function(){" +
                "var sm=document.getElementById('sm');" +
                "if(sm&&sm.classList.contains('show')){sm.classList.remove('show');return 'handled'}" +
                "var sc=document.getElementById('shortcutModal');" +
                "if(sc&&sc.classList.contains('show')){sc.classList.remove('show');return 'handled'}" +
                "var sp=document.getElementById('syncPanel');" +
                "if(sp&&sp.classList.contains('show')){sp.classList.remove('show');return 'handled'}" +
                "var tp=document.getElementById('termPanel');" +
                "if(tp&&tp.classList.contains('show')){if(window._closeTerminal)window._closeTerminal();return 'handled'}" +
                "return 'exit'" +
                "})()",
                new ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String val) {
                        if (val != null && val.contains("exit")) {
                            if (webView.canGoBack()) {
                                webView.goBack();
                            } else {
                                moveTaskToBack(true);
                            }
                        }
                    }
                });
            return true;
        }
        if (keyCode == KeyEvent.KEYCODE_MENU) {
            webView.evaluateJavascript("document.getElementById('sb').classList.toggle('open');document.getElementById('sOv').classList.toggle('show')", null);
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
        applyImmersiveMode();
        webView.evaluateJavascript(
            "(function(){if(typeof update==='function')update();return 'ok'})()",
            null);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) webView.destroy();
        super.onDestroy();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
        webView.restoreState(savedInstanceState);
    }

    class AndroidBridge {
        @JavascriptInterface
        public void exportProgress(String json) {
            try {
                File file = new File(getFilesDir(), "cybersec_sync.json");
                FileWriter w = new FileWriter(file);
                w.write(json);
                w.close();

                ClipboardManager cb = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                ClipData clip = ClipData.newPlainText("CyberSec Progress", json);
                cb.setPrimaryClip(clip);

                vibrate(200);
                postToast("Progress exported & copied to clipboard!", Toast.LENGTH_SHORT);
            } catch (Exception e) {
                postToast("Export failed: " + e.getMessage(), Toast.LENGTH_SHORT);
            }
        }

        @JavascriptInterface
        public String importProgress() {
            try {
                ClipboardManager cb = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                ClipData clip = cb.getPrimaryClip();
                if (clip != null && clip.getItemCount() > 0) {
                    CharSequence text = clip.getItemAt(0).getText();
                    if (text != null) return text.toString();
                }
            } catch (Exception e) {}
            return "";
        }

        @JavascriptInterface
        public void shareProgress(String text) {
            try {
                Intent intent = new Intent(Intent.ACTION_SEND);
                intent.setType("text/plain");
                intent.putExtra(Intent.EXTRA_SUBJECT, "CyberSec Hub Progress");
                intent.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(intent, "Share via"));
            } catch (Exception e) {
                postToast("Share failed", Toast.LENGTH_SHORT);
            }
        }

        @JavascriptInterface
        public void vibrateDevice(int ms) {
            vibrate(ms);
        }

        @JavascriptInterface
        public void showToast(String msg) {
            postToast(msg, Toast.LENGTH_SHORT);
        }

        @JavascriptInterface
        public void showLongToast(String msg) {
            postToast(msg, Toast.LENGTH_LONG);
        }

        @JavascriptInterface
        public void saveToFile(String filename, String data) {
            try {
                File file = new File(getFilesDir(), filename);
                FileWriter w = new FileWriter(file);
                w.write(data);
                w.close();
            } catch (Exception e) {}
        }

        @JavascriptInterface
        public String loadFromFile(String filename) {
            try {
                File file = new File(getFilesDir(), filename);
                if (!file.exists()) return "";
                BufferedReader r = new BufferedReader(new FileReader(file));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = r.readLine()) != null) sb.append(line).append("\n");
                r.close();
                return sb.toString().trim();
            } catch (Exception e) { return ""; }
        }

        @JavascriptInterface
        public void setKeepScreenOn(boolean on) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                    else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                }
            });
        }

        @JavascriptInterface
        public String getDeviceName() {
            return Build.MANUFACTURER + " " + Build.MODEL;
        }

        @JavascriptInterface
        public boolean isInstalled() {
            return true;
        }

        @JavascriptInterface
        public void openUrl(String url) {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
        }

        @JavascriptInterface
        public void copyToClipboard(String text) {
            ClipboardManager cb = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
            ClipData clip = ClipData.newPlainText("CyberSec", text);
            cb.setPrimaryClip(clip);
            vibrate(100);
            postToast("Copied to clipboard!", Toast.LENGTH_SHORT);
        }

        @JavascriptInterface
        public String readFromClipboard() {
            try {
                ClipboardManager cb = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                ClipData clip = cb.getPrimaryClip();
                if (clip != null && clip.getItemCount() > 0) {
                    CharSequence text = clip.getItemAt(0).getText();
                    if (text != null) return text.toString();
                }
            } catch (Exception e) {}
            return "";
        }

        @JavascriptInterface
        public void openInBrowser(String url) {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
        }
    }

    private void vibrate(int ms) {
        try {
            Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (v != null && v.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    v.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    v.vibrate(ms);
                }
            }
        } catch (Exception e) {}
    }

    private void postToast(final String msg, final int duration) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Toast.makeText(MainActivity.this, msg, duration).show();
            }
        });
    }
}
