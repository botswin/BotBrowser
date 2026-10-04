# IPv4-Only Proxy Compatibility

> Check proxy destination support and DNS settings when a tunnel request is rejected.

---

<a id="prerequisites"></a>

## Prerequisites

- **BotBrowser binary** with a valid profile loaded via `--bot-profile`.
- **A configured proxy**, with its supported destination address families confirmed by the provider.

<a id="quick-start"></a>

## Quick Start

Confirm the proxy protocol and destination address-family policy before changing browser or container networking:

```bash
--proxy-server=http://user:pass@proxy.example.com:8080
--bot-local-dns=true
```

Use `--bot-local-dns=false` when the proxy should resolve target names. Neither setting forces the proxy's remote connection to use IPv4.

<a id="proxy-endpoint-and-destination-support"></a>

## Proxy endpoint and destination support

The connection from the browser to the proxy and the connection from the proxy to a website are separate. An IPv4 proxy endpoint can support IPv6 destinations. An IPv6 endpoint can have an IPv4-only destination policy.

Ask your provider whether an IPv4-only restriction applies to the endpoint, destination connections, or both.

<a id="dns-configuration"></a>

## DNS configuration

With `--bot-local-dns=false`, proxy target names are resolved by the proxy. The provider controls which destination address it uses. Disabling IPv6 in the browser's container does not configure the provider's resolver or destination connections.

With `--bot-local-dns=true`, BotBrowser resolves proxy targets locally. For supported proxy connections, it prefers destination addresses matching the active proxy connection. This is an address-family preference, not a strict IPv4-only policy. An IPv6-only target can still be offered to the proxy.

If local resolution suits your DNS policy and subscription, use the documented option:

```bash
--proxy-server=http://user:pass@proxy.example.com:8080
--bot-local-dns=true
```

Local DNS changes where resolution happens. Review [DNS Leak Prevention](DNS_LEAK_PREVENTION.md) before enabling it. This configuration does not guarantee compatibility with every IPv4-only proxy, proxy chain, or target.

BotBrowser does not provide a dedicated IPv4-only routing flag. Declaring a proxy's public IP does not force its network connections to use that address family.

<a id="troubleshooting"></a>

## Troubleshooting

| Observation | Next check |
| --- | --- |
| CONNECT sends a hostname | Ask the provider which destination address it resolved and attempted. |
| CONNECT sends an IPv6 literal and is rejected | Confirm IPv6 destination support and whether the target has an IPv4 address. |
| The provider rejects a tunnel request | Ask the provider which destination address families and status codes are supported. |
| A page reports a network configuration problem | Inspect failed resource and tunnel requests before attributing the message to the browser. |

If the provider only supports IPv4 destinations, request a provider-supported IPv4 destination policy or use a proxy with the required destination support. An IPv6-only website needs an IPv6-capable route; an IPv4 preference cannot create an IPv4 address for it.

<a id="container-settings-and-connection-racing"></a>

## Container settings and connection racing

Disabling IPv6 through container sysctls affects the entire container. It may change locally available addresses and routes, but it does not control the proxy's remote network.

Disabling Happy Eyeballs connection racing is not equivalent to forcing IPv4. If several settings changed together, compare them individually before treating one as the solution. Keep an existing workaround while checking a supported configuration, and avoid changing host-wide settings solely from a page error message.

<a id="reporting-a-compatibility-issue"></a>

## Reporting a compatibility issue

Include the exact browser version, proxy protocol, redacted launch arguments, local DNS setting, and the provider's destination address-family policy. Where available, include the provider's tunnel status. Do not include proxy passwords, cookies, or profile files.

<a id="next-steps"></a>

## Next Steps

- [Proxy Configuration](PROXY_CONFIGURATION.md). Supported proxy protocols and launch configuration.
- [DNS Leak Prevention](DNS_LEAK_PREVENTION.md). Local and remote resolution options.
- [CLI Flags Reference](../../../CLI_FLAGS.md). Supported settings.

---

**Related documentation:** [Proxy Configuration](PROXY_CONFIGURATION.md) | [DNS Leak Prevention](DNS_LEAK_PREVENTION.md)

---

**[Legal Disclaimer & Terms of Use](https://github.com/botswin/BotBrowser/blob/main/DISCLAIMER.md) • [Responsible Use Guidelines](https://github.com/botswin/BotBrowser/blob/main/RESPONSIBLE_USE.md)**. BotBrowser is for authorized fingerprint protection and privacy research only.
