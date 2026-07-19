# CyberSec Hub

A self-contained cybersecurity learning platform packaged as a native Android app. Learn ethical hacking, networking, forensics, and more — all offline, right from your phone.

## What It Is

CyberSec Hub is a single-page web application wrapped in an Android WebView shell. It delivers a full cybersecurity course with 25 topic sections, interactive quizzes, a sandbox terminal, progress tracking, and a polished hacker-themed UI — no server required.

## Features

### Learning Content
- **25 cybersecurity sections** covering:
  - Foundations, Linux, Termux, Networking
  - Scanning, Reconnaissance, Web Security
  - Exploitation, Post-Exploitation, Privilege Escalation
  - Malware Analysis, Digital Forensics, Cryptography
  - Wireless Security, Cloud Security, Mobile Security
  - Operating System Security, Red Team, Blue Team
  - Bug Bounty, Home Lab Setup, Tools & Resources
  - Legal & Ethics, Career Guidance
- **6 interactive quizzes** with instant feedback and explanations
- **234 code blocks** with one-tap copy buttons
- **173 collapsible sections** for organized content delivery
- Terminal-style code boxes with traffic-light dots

### Terminal
- **Floating sandbox terminal** — draggable, resizable, works anywhere
- **20+ built-in commands**: `help`, `ls`, `cd`, `cat`, `whoami`, `nmap`, `ping`, `curl`, `hash`, `base64`, `ifconfig`, `netstat`, `ps`, `grep`, `find`, `echo`, `date`, `uname`, `apt`, `clear`
- Keyboard-aware — stays visible above the Android keyboard
- Maximize mode for full-screen terminal

### Progress Tracking
- Per-section completion checkboxes
- Progress ring with percentage display
- Quiz streak counter
- Streak calendar (last 7 days)
- **Local storage persistence** — progress survives app restarts
- **Cloud sync** — generate a shareable sync link to backup/restore progress across devices
- **Export/Import** JSON data

### Navigation
- Sidebar with collapsible chapter groups
- Top bar with back/forward history navigation
- Bottom navigation bar (Home, Topics, Labs, Progress) with active glow indicator
- Breadcrumb trail
- Global search (Ctrl+K)
- Keyboard shortcuts modal (?)

### UI/UX
- Dark hacker theme with green/cyan/purple accent colors
- Matrix rain canvas animation on home
- Boot-up typewriter animation
- Confetti on correct quiz answers
- Toast notifications
- Card parallax tilt on hover
- Scroll-triggered content reveal animations
- Ripple effects on buttons
- Responsive design (phone, tablet, desktop, landscape)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS (no frameworks) |
| Styling | CSS custom properties, animations, flexbox/grid |
| Android Shell | Java WebView (API 21+) |
| Build | Shell script using `aapt`, `javac`, `dx`, `apksigner` |
| Storage | localStorage (client-side) |
| Sync | Firebase Realtime Database (anonymous, optional) |

## Project Structure

```
cybersecurity-hub/
├── shell_top.html          # CSS + HTML header/nav/terminal markup
├── sections.html           # All 25 course sections (content)
├── shell_bot.html          # All JavaScript (nav, quizzes, terminal, sync)
├── index.html              # Combined output (shell_top + sections + shell_bot)
├── build-apk.sh            # Android APK build script
├── android/
│   ├── AndroidManifest.xml
│   ├── src/com/cybersec/hub/
│   │   ├── MainActivity.java      # WebView wrapper
│   │   └── SplashActivity.java    # Animated splash screen
│   ├── res/drawable/ic_launcher.xml
│   ├── res/values/styles.xml
│   ├── assets/
│   │   ├── index.html             # Copied from root
│   │   ├── manifest.json          # PWA manifest
│   │   └── sw.js                  # Service worker (unused in APK)
│   └── toolz/android.jar          # Android SDK stub for compilation
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
└── build-apk.sh            # Build script
```

## Building

### Prerequisites
- Linux/Termux environment
- `aapt`, `apksigner`, `dx` (Android build tools)

### Build Steps
```bash
# Concatenate source files
cat shell_top.html sections.html shell_bot.html > index.html

# Copy to Android assets
cp index.html android/assets/

# Build APK
bash build-apk.sh
```

Output: `android/CyberSecHub.apk`

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Open search |
| `Ctrl+`` ` | Toggle terminal |
| `?` | Show shortcuts |
| `Esc` | Close active panel |
| `Alt+Left` | Navigate back |
| `Alt+Right` | Navigate forward |

## Version History

### v1.0.0 (Current)
- Initial release with 25 cybersecurity sections
- Floating draggable/resizable terminal
- Quiz system with streak tracking
- Progress sync via Firebase
- Bottom navigation with active glow states
- Button audit: fixed next/back navigation, removed dead handlers
- Bug fixes: pPct crash, confetti memory leak, missing CSS classes (tbox-bt, tg.pk, hide-anim), tbox-bar traffic dots

## Git Log
```
a245dce fix: 6 bugs - pPct crash, confetti leak, tbox-bt/tg.pk CSS, tbox-bar dots, hide-anim
5be747c fix: button audit - next/back nav, dead copyCode handlers, dead toggleCol handlers
dad97bb baseline: current app state before button audit
```

## License

Educational use only. Built with Termux on Android.
