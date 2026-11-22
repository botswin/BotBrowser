# WizzAir Compatibility Testing with Docker

For Fingerprint Protection and Privacy Research. See the project [Legal Disclaimer](../../DISCLAIMER.md) and [Responsible Use Guidelines](../../RESPONSIBLE_USE.md) for usage boundaries.

## Project Overview

This repository contains a Docker setup for validating fingerprint protection on WizzAir using BotBrowser and Playwright, which runs a Python script (`main.py`) inside a Docker container that:

1. Launches BotBrowser in headless mode: **no XDISPLAY or GPU required**: while simulating a full desktop environment.
2. Performs compatibility validation on WizzAir's interface over a date range.
3. Analyzes API responses for compatibility assessment.
4. Saves analysis data to `flight_data/` and screenshots to `screenshots/` for privacy research review.
5. The target site is protected by **Kasada**, and this workflow exercises BotBrowser in an authorized compatibility scenario.

---

## Repo Layout

```
.
├── Dockerfile
├── docker-compose.yml
├── main.py
├── requirements.txt
├── profile/        # Place your .enc profile here
├── flight_data/    # Analysis data output per date
└── screenshots/    # Screenshots for privacy research review
```

> **Tip:** Review `Dockerfile` and `docker-compose.yml` for configuration options.

---

## Getting Started

> **Reminder:** run this workflow only against environments where you have explicit authorization.

1. **Add Files**

   * Place `botbrowser_*.deb` in the root directory.
   * Put your profile file (`your-profile.enc`) into `profile/`.

2. **Launch with Docker Compose**

   ```bash
   docker-compose up --build -d
   ```

3. **Monitor Logs**

   ```bash
   docker-compose logs -f wizzair-botbrowser-service
   ```

4. **View Analysis Results**

   * Analysis data in `flight_data/`
   * Screenshots in `screenshots/`

This compatibility testing script is not intended for bulk data collection and must only be run in test setups where you have explicit authorization.

---

## main.py at a Glance

* Reads `BOTBROWSER_EXEC_PATH` and `BOT_PROFILE_PATH` from the environment.
* Iterates test dates for compatibility analysis.
* Saves API analysis data and screenshot per date.

Modify the date range or test parameters directly in `main.py` for your study.

---

## Troubleshooting

| Issue                  | Fix                                                                   |
| ---------------------- | --------------------------------------------------------------------- |
| Missing `.deb`         | Add `botbrowser_*.deb` to the repo root                               |
| Profile not found      | Ensure `profile/your-profile.enc` exists                              |
| Permission errors      | Make sure `profile/`, `flight_data/`, and `screenshots/` are writable |
| Docker startup failure | Run without `-d` to see errors: `docker-compose up`                   |

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
