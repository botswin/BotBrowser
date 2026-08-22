# Google Translate Page Translation

> Use your own Google Cloud API key to enable page translation in BotBrowser.

---

<a id="requirements"></a>

## Requirements

- A BotBrowser release and a matching profile.
- A Google Cloud project with billing enabled.
- The Cloud Translation API enabled for that project.
- An API key restricted to the Cloud Translation API.

Google Cloud controls pricing and quotas. Check the [Cloud Translation pricing](https://cloud.google.com/translate/pricing) and [quotas](https://cloud.google.com/translate/quotas) pages before production use.

<a id="what-it-enables"></a>

## What this enables

The key supplies the Google service used by the browser's built-in page translation flow. BotBrowser does not provide a shared translation key. Each deployment can use its own Google Cloud project, quota, and billing policy.

The `hrefTranslate` page capability and the full translation service are separate. A page can expose the standard translation-related DOM surface while translation remains unavailable because the deployment has no usable key or network access.

<a id="create-key"></a>

## Create an API key

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project for translation.
3. Enable the [Cloud Translation API](https://console.cloud.google.com/apis/library/translate.googleapis.com).
4. Link the project to a billing account.
5. Open **APIs & Services** > **Credentials**, then create an API key.
6. Edit the key and set **API restrictions** to **Cloud Translation API**.
7. Add an application restriction that matches where BotBrowser runs. An IP restriction is suitable for a stable server egress. Review referrer restrictions carefully because translation requests are made by the browser session.

Keep the key out of source control, profile files, screenshots, and shared logs. Rotate or revoke it from Google Cloud if it is exposed.

<a id="launch"></a>

## Launch BotBrowser

Set `GOOGLE_API_KEY` in the environment of the BotBrowser process before launch:

```bash
GOOGLE_API_KEY='YOUR_API_KEY' \
chromium-browser \
  --bot-profile='/absolute/path/to/profile.enc' \
  --user-data-dir='/absolute/path/to/user-data' \
  https://example.com
```

The key is read when the browser process starts. Restart BotBrowser after changing the environment variable. Do not put the key in a page script or pass it only to an outer HTTP client.

After opening a page in another language, use the browser's normal page-translation command. Translation availability depends on the key, billing account, quota, proxy, network access, and the source page.

### macOS and Linux

Export the variable in the same shell that starts BotBrowser:

```bash
export GOOGLE_API_KEY='YOUR_API_KEY'
chromium-browser \
  --bot-profile='/absolute/path/to/profile.enc' \
  --user-data-dir='/absolute/path/to/user-data'
```

### Windows PowerShell

Set the variable for the process before launching the browser:

```powershell
$env:GOOGLE_API_KEY = 'YOUR_API_KEY'
& 'C:\path\to\chromium.exe' `
  '--bot-profile=C:\path\to\profile.enc' `
  '--user-data-dir=C:\path\to\user-data'
```

### Playwright and Puppeteer

The environment must belong to the process that launches the browser. The browser arguments still carry the profile and user-data paths:

```javascript
const browser = await chromium.launch({
  executablePath: process.env.BOTBROWSER_EXEC_PATH,
  env: { ...process.env, GOOGLE_API_KEY: process.env.GOOGLE_API_KEY },
  args: [
    '--bot-profile=/absolute/path/to/profile.enc',
    '--user-data-dir=/absolute/path/to/user-data',
  ],
});
```

Do not place the key in a committed `.env` file. Use the deployment secret store or an interactive shell instead.

<a id="verify"></a>

## Verify the setup

1. Confirm that the BotBrowser process was restarted after the key was set.
2. Open a page whose main text is not in the browser's target language.
3. Use the normal page-translation command from the browser menu or context menu.
4. Confirm that the translated page is rendered and that the Google Cloud project shows the expected request usage.

Run this check with the same profile, proxy, and launch method used by the deployment. A successful DOM capability check alone does not prove that the external translation service is available.

<a id="troubleshooting"></a>

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Translation is unavailable | Confirm that `GOOGLE_API_KEY` was set before the browser process started and that the Cloud Translation API is enabled. |
| Permission denied | Check the key restrictions and confirm that the selected project has billing enabled. |
| Quota or rate-limit errors | Review the project quotas and usage in Google Cloud Console. |
| Requests fail through a proxy | Confirm that the proxy is configured in BotBrowser and that it permits the required Google services. |
| The key was exposed | Revoke or rotate it in Google Cloud, then update the launch environment. |

<a id="privacy-and-cost"></a>

## Privacy and cost

Page translation sends the text needed by the translation service to Google's service. Review your data-handling requirements before translating sensitive content. Set quotas and monitor usage so the project stays within the intended budget.

## Related Documentation

- [Profile Management](PROFILE_MANAGEMENT.md) - choose and launch a matching profile.
- [Proxy Configuration](../network/PROXY_CONFIGURATION.md) - configure browser-level proxy routing.
- [First Verification](FIRST_VERIFICATION.md) - verify a new BotBrowser launch.
