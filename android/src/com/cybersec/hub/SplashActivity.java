package com.cybersec.hub;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.LinearGradient;
import android.graphics.Paint;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;

public class SplashActivity extends Activity {
    private SplashView splashView;
    private Handler handler;
    private Runnable transitionRunnable;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setStatusBarColor(Color.parseColor("#0a0d0d"));
        getWindow().setNavigationBarColor(Color.parseColor("#0a0d0d"));

        splashView = new SplashView(this);
        setContentView(splashView);

        handler = new Handler();
        transitionRunnable = new Runnable() {
            @Override
            public void run() {
                Intent i = new Intent(SplashActivity.this, MainActivity.class);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                startActivity(i);
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
                finish();
            }
        };
    }

    @Override
    protected void onDestroy() {
        if (handler != null && transitionRunnable != null) {
            handler.removeCallbacks(transitionRunnable);
        }
        super.onDestroy();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            splashView.startTime = System.currentTimeMillis();

            final Runnable animator = new Runnable() {
                @Override
                public void run() {
                    if (isFinishing()) return;
                    long elapsed = System.currentTimeMillis() - splashView.startTime;
                    splashView.progress = Math.min(elapsed / 2200f, 1f);
                    splashView.invalidate();
                    if (elapsed < 2400) {
                        splashView.postDelayed(this, 16);
                    }
                }
            };
            splashView.postDelayed(animator, 50);
            handler.postDelayed(transitionRunnable, 3000);
        }
    }

    class SplashView extends View {
        Paint hexStroke, hexFill, centerDot, namePaint, subPaint, authorPaint;
        Paint glowPaint, dotPaint, linePaint, bgPaint, vPaint;
        Typeface mono, sans;
        float progress = 0f;
        long startTime = 0;
        float[][] particles = new float[25][4];

        public SplashView(Activity ctx) {
            super(ctx);
            setLayerType(LAYER_TYPE_HARDWARE, null);
            mono = Typeface.create("monospace", Typeface.BOLD);
            sans = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL);

            bgPaint = new Paint();
            bgPaint.setColor(Color.parseColor("#0a0d0d"));

            hexStroke = new Paint(Paint.ANTI_ALIAS_FLAG);
            hexStroke.setColor(Color.parseColor("#4ade80"));
            hexStroke.setStyle(Paint.Style.STROKE);
            hexStroke.setStrokeWidth(4f);
            hexStroke.setStrokeCap(Paint.Cap.ROUND);
            hexStroke.setStrokeJoin(Paint.Join.ROUND);

            hexFill = new Paint(Paint.ANTI_ALIAS_FLAG);
            hexFill.setColor(Color.parseColor("#4ade80"));
            hexFill.setStyle(Paint.Style.FILL);

            centerDot = new Paint(Paint.ANTI_ALIAS_FLAG);
            centerDot.setColor(Color.parseColor("#4ade80"));
            centerDot.setStyle(Paint.Style.FILL);

            namePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            namePaint.setColor(Color.WHITE);
            namePaint.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
            namePaint.setTextAlign(Paint.Align.CENTER);

            subPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            subPaint.setColor(Color.parseColor("#4ade80"));
            subPaint.setTypeface(mono);
            subPaint.setTextAlign(Paint.Align.CENTER);

            authorPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            authorPaint.setColor(Color.parseColor("#777777"));
            authorPaint.setTypeface(sans);
            authorPaint.setTextAlign(Paint.Align.CENTER);

            linePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            linePaint.setColor(Color.parseColor("#4ade80"));
            linePaint.setStrokeWidth(1.5f);
            linePaint.setStrokeCap(Paint.Cap.ROUND);

            glowPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            glowPaint.setColor(Color.parseColor("#4ade80"));
            glowPaint.setMaskFilter(new android.graphics.BlurMaskFilter(80, android.graphics.BlurMaskFilter.Blur.NORMAL));

            dotPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            dotPaint.setColor(Color.parseColor("#4ade80"));

            vPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            vPaint.setColor(Color.parseColor("#444444"));
            vPaint.setTypeface(sans);
            vPaint.setTextAlign(Paint.Align.CENTER);

            for (int i = 0; i < particles.length; i++) {
                particles[i][0] = (float)(Math.random());
                particles[i][1] = (float)(Math.random());
                particles[i][2] = (float)(Math.random() * 2.5f + 0.5f);
                particles[i][3] = (float)(Math.random() * 0.004f + 0.001f);
            }
        }

        @Override
        protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            int w = getWidth(), h = getHeight();
            if (w == 0 || h == 0) return;

            float cx = w / 2f;
            float cy = h * 0.36f;
            float hexR = Math.min(w, h) * 0.12f;

            canvas.drawColor(Color.parseColor("#0a0d0d"));

            // Background glow
            float glowA = ease(progress, 0.05f, 0.5f);
            glowPaint.setAlpha((int)(glowA * 25));
            canvas.drawCircle(cx, cy, h * 0.22f, glowPaint);

            // Grid lines (subtle)
            Paint gridPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            gridPaint.setColor(Color.parseColor("#4ade80"));
            gridPaint.setStrokeWidth(0.5f);
            float gridAlpha = ease(progress, 0.0f, 0.3f);
            gridPaint.setAlpha((int)(gridAlpha * 15));
            float gridSpacing = 30f;
            for (float x = cx - hexR * 2; x <= cx + hexR * 2; x += gridSpacing) {
                canvas.drawLine(x, cy - hexR * 1.5f, x, cy + hexR * 1.5f, gridPaint);
            }
            for (float y = cy - hexR * 1.5f; y <= cy + hexR * 1.5f; y += gridSpacing) {
                canvas.drawLine(cx - hexR * 2, y, cx + hexR * 2, y, gridPaint);
            }

            // Floating particles
            float partAlpha = ease(progress, 0.1f, 1f);
            dotPaint.setAlpha((int)(partAlpha * 45));
            for (int i = 0; i < particles.length; i++) {
                particles[i][1] -= particles[i][3];
                if (particles[i][1] < -0.05f) {
                    particles[i][1] = 1.05f;
                    particles[i][0] = (float)(Math.random());
                }
                canvas.drawCircle(particles[i][0] * w, particles[i][1] * h,
                    particles[i][2], dotPaint);
            }

            // Outer hexagon
            float hexProgress = ease(progress, 0.02f, 0.75f);
            float[][] pts = hexPoints(cx, cy, hexR);
            hexStroke.setStrokeWidth(4f);
            float hexAlpha = ease(progress, 0.05f, 0.4f);
            hexStroke.setAlpha((int)(hexAlpha * 255));
            drawHexAnim(canvas, pts, hexProgress);

            // Inner hexagon
            float innerR = hexR * 0.55f;
            float innerProgress = ease(progress, 0.25f, 0.85f);
            float[][] ipt = hexPoints(cx, cy, innerR);
            hexStroke.setStrokeWidth(2f);
            hexStroke.setAlpha((int)(innerProgress * 140));
            drawHexAnim(canvas, ipt, innerProgress);

            // Connecting lines between outer and inner
            float connAlpha = ease(progress, 0.4f, 0.8f);
            Paint connPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            connPaint.setColor(Color.parseColor("#4ade80"));
            connPaint.setStrokeWidth(1f);
            connPaint.setAlpha((int)(connAlpha * 40));
            if (connAlpha > 0) {
                for (int i = 0; i < 6; i++) {
                    canvas.drawLine(pts[i][0], pts[i][1], ipt[i][0], ipt[i][1], connPaint);
                }
            }

            hexStroke.setStrokeWidth(4f);

            // Center dot
            float dotAlpha = ease(progress, 0.45f, 1f);
            centerDot.setAlpha((int)(dotAlpha * 255));
            float dotSize = hexR * 0.12f * Math.min(dotAlpha * 2f, 1f);
            canvas.drawCircle(cx, cy, dotSize, centerDot);

            // Ring around center
            Paint ringPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
            ringPaint.setColor(Color.parseColor("#4ade80"));
            ringPaint.setStyle(Paint.Style.STROKE);
            ringPaint.setStrokeWidth(1.5f);
            ringPaint.setAlpha((int)(dotAlpha * 100));
            float ringR = hexR * 0.2f * Math.min(dotAlpha * 2f, 1f);
            canvas.drawCircle(cx, cy, ringR, ringPaint);

            // Scan line
            float scanP = ease(progress, 0.5f, 0.95f);
            if (scanP > 0 && scanP < 1) {
                float scanY2 = cy - hexR * 1.3f + (hexR * 2.6f) * scanP;
                Paint scanLine = new Paint(Paint.ANTI_ALIAS_FLAG);
                scanLine.setColor(Color.parseColor("#4ade80"));
                scanLine.setStrokeWidth(1f);
                scanLine.setAlpha((int)((1f - Math.abs(scanP - 0.5f) * 2) * 80));
                canvas.drawLine(cx - hexR * 1.5f, scanY2, cx + hexR * 1.5f, scanY2, scanLine);
            }

            // Text section
            float textY = cy + hexR + h * 0.05f;

            // Divider line
            float lineAlpha = ease(progress, 0.5f, 0.8f);
            linePaint.setAlpha((int)(lineAlpha * 180));
            float lineW = w * 0.2f;
            float lineFrac = ease(progress, 0.5f, 0.8f);
            canvas.drawLine(cx - lineW * lineFrac, textY, cx + lineW * lineFrac, textY, linePaint);

            // App name
            float nameAlpha = ease(progress, 0.55f, 0.88f);
            namePaint.setAlpha((int)(nameAlpha * 255));
            float nameSize = Math.min(48f, w * 0.06f);
            namePaint.setTextSize(nameSize);
            canvas.drawText("CyberSec Hub", cx, textY + nameSize + 4, namePaint);

            // Subtitle
            float subAlpha = ease(progress, 0.62f, 0.92f);
            subPaint.setAlpha((int)(subAlpha * 180));
            subPaint.setTextSize(Math.min(12f, w * 0.019f));
            canvas.drawText("LEARN  CYBERSECURITY  FROM  SCRATCH", cx, textY + nameSize + 30, subPaint);

            // Author
            float authorAlpha = ease(progress, 0.72f, 1f);
            authorPaint.setAlpha((int)(authorAlpha * 200));
            authorPaint.setTextSize(Math.min(20f, w * 0.028f));
            canvas.drawText("Made by Tauseef Khan", cx, h * 0.86f, authorPaint);

            // Version
            vPaint.setTextSize(Math.min(12f, w * 0.018f));
            vPaint.setAlpha((int)(authorAlpha * 120));
            canvas.drawText("v3.0  |  Android", cx, h * 0.90f, vPaint);

            // Loading dots
            float loadAlpha = ease(progress, 0.0f, 0.3f);
            if (loadAlpha > 0 && progress < 0.98f) {
                Paint loadPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
                loadPaint.setColor(Color.parseColor("#4ade80"));
                loadPaint.setStyle(Paint.Style.FILL);
                loadPaint.setAlpha((int)(150));
                int dotCount = 3;
                float dotSpacing = 14f;
                float totalW = dotCount * 6f + (dotCount - 1) * dotSpacing;
                float startX = cx - totalW / 2f;
                for (int i = 0; i < dotCount; i++) {
                    float dx = startX + i * (6f + dotSpacing);
                    float dotPhase = (progress * 8f + i * 0.8f) % 3f;
                    float dotScale = dotPhase < 1f ? dotPhase : (dotPhase < 2f ? 1f : 3f - dotPhase);
                    canvas.drawCircle(dx, h * 0.94f, 2.5f * dotScale, loadPaint);
                }
            }

            if (progress < 1f) {
                invalidate();
            }
        }

        private void drawHexAnim(Canvas canvas, float[][] pts, float progress) {
            int segments = (int)(progress * 6);
            float frac = (progress * 6) - segments;
            for (int i = 0; i < segments && i < 6; i++) {
                int next = (i + 1) % 6;
                if (i == segments - 1 && frac > 0 && frac < 1) {
                    float mx = pts[i][0] + (pts[next][0] - pts[i][0]) * frac;
                    float my = pts[i][1] + (pts[next][1] - pts[i][1]) * frac;
                    canvas.drawLine(pts[i][0], pts[i][1], mx, my, hexStroke);
                } else {
                    canvas.drawLine(pts[i][0], pts[i][1], pts[next][0], pts[next][1], hexStroke);
                }
            }
        }

        private float[][] hexPoints(float cx, float cy, float r) {
            float[][] pts = new float[6][2];
            for (int i = 0; i < 6; i++) {
                double a = Math.toRadians(60 * i - 90);
                pts[i][0] = (float)(cx + r * Math.cos(a));
                pts[i][1] = (float)(cy + r * Math.sin(a));
            }
            return pts;
        }

        private float ease(float t, float start, float end) {
            if (t <= start) return 0f;
            if (t >= end) return 1f;
            float p = (t - start) / (end - start);
            return p * p * (3f - 2f * p);
        }
    }
}
