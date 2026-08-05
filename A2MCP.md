# Making HikmahGuide an A2MCP Service on OKX AI

This guide explains how to expose HikmahGuide as an **A2MCP (Agent-to-MCP)** service on the [OKX AI](https://OKX.AI) marketplace, so that other agents (OpenClaw, Hermes, Claude Code, Codex, etc.) can call it and pay per request through the **OKX Agent Payments Protocol (APP)**.

> **Status:** HikmahGuide already exposes a callable HTTP endpoint. To become a *paid* A2MCP service it needs two additions: (1) registration as an Agent Service Provider, and (2) a payment layer (HTTP 402) in front of the endpoint. Both are described below.

---

## 1. Background: what A2MCP means

The OKX AI marketplace lets service providers list two kinds of services:

| Type | Description | Settlement |
|---|---|---|
| **A2MCP (Agent-to-MCP)** | A standardized MCP/API service, charged **per call** or free, **no negotiation**. Best when you already have an API a consumer can call directly. | Instant, via the OKX Payment SDK |
| **A2A (Agent-to-Agent)** | Escrow-based jobs negotiated between agents. | Escrow |

HikmahGuide fits **A2MCP** perfectly: it's a stateless HTTP endpoint that takes a question and returns structured guidance. There's nothing to negotiate — it's a clean per-call service.

Every agent on OKX AI operates under a single on-chain identity managed through the **OKX Agentic Wallet**.

_Reference: [OKX ASP docs](https://web3.okx.com/onchainos/dev-docs/okxai/asp), [Agent Payments Protocol](https://www.okx.com/en-au/learn/agent-payments-protocol), [OKX AI marketplace](https://www.okx.com/en-ar/learn/okx-ai)._

---

## 2. The service HikmahGuide exposes today

HikmahGuide's serverless function [api/guidance.ts](api/guidance.ts) is the callable service.

**Endpoint**
```
POST /api/guidance
Content-Type: application/json
```

**Request body**
```json
{ "question": "How do I deal with anxiety?" }
```

**Response body (200)** — the guidance payload the consuming agent receives:
```json
{
  "opening": "…warm acknowledgement…",
  "main_guidance": "…150–220 words rooted in the sunnah…",
  "key_reflections": ["…", "…", "…"],
  "quran": [
    { "surah": 13, "ayah": 28, "arabic": "…", "translation": "…", "reference": "Surah Ar-Ra'd, 13:28" },
    { "surah": 94, "ayah": 5,  "arabic": "…", "translation": "…", "reference": "Surah Ash-Sharh, 94:5" }
  ],
  "hadith_themes": ["anxiety", "trust"],
  "practical_steps": ["…", "…"],
  "dua_theme": "anxiety"
}
```

**Error responses**
| Status | Meaning |
|---|---|
| `400` | `question` missing or not a string |
| `405` | Method not allowed (only POST) |
| `500` | API key not configured / upstream model error |
| `502` | Model response could not be parsed |

This contract is what a consuming agent will invoke once the service is listed.

---

## 3. Publishing as an A2MCP service — the steps

### Step 1 — Set up the OKX Agentic Wallet
Create the on-chain identity HikmahGuide will operate under. This wallet receives the per-call payments.

### Step 2 — Install the Onchain OS skill
Install the OKX agent skill in your agent environment (the same skill family consuming agents use):
```bash
npx skills add okx/agent-skills
```

### Step 3 — Register as an Agent Service Provider (ASP)
Register your agent identity as an ASP (Provider / Seller). On-chain identity registration is handled by the `okx-agent-identity` skill (ERC-8004 identity: register / create / update agents).

### Step 4 — Add the payment layer (HTTP 402) to the endpoint
This is the one piece of engineering required. A2MCP consumers reach your endpoint through the Agent Payments Protocol, which is triggered by an **HTTP 402 Payment Required** handshake. The flow (all mechanical work done by the consumer's CLI):

1. Consumer's CLI runs `onchainos payment quote <your-endpoint-url> --method POST`.
2. Your endpoint responds with **402** and a payment challenge. Supported protocol signatures, in priority order:
   - `WWW-Authenticate: Payment` header, or
   - `PAYMENT-REQUIRED` header (v2, base64 JSON), or
   - a body containing `x402Version` (v1).
3. The CLI parses the challenge, checks balance, and asks the user to confirm.
4. The CLI runs `onchainos payment pay --payment-id <id> --selected-index <n> --yes`, which signs the payment and **replays the original request** to your endpoint.
5. On valid payment your endpoint returns the **200** guidance payload from §2.

Only `method="evm"` is supported for the payment scheme. Payment schemes include `exact`, `exact + Permit2`, `upto`, and `period` (subscription). For a fixed per-call price, use **`exact`**.

> Because HikmahGuide is **POST-only**, your listing must declare `POST` — a default GET probe returns `405` and the consumer would see `endpoint_unreachable`.

### Step 5 — List the service
Register the A2MCP listing with these fields (this is what appears on your service card):

| Field | Value |
|---|---|
| **Service title** | `HikmahGuide: Authentic Islamic Reflection & Guidance` |
| **Service type** | `A2MCP` |
| **Endpoint** | `https://<your-deployment>/api/guidance` |
| **Method** | `POST` |
| **Pricing** | per-call (`exact` scheme) or free |

---

## 4. How a consumer uses HikmahGuide

Once listed, another user pastes an instruction like this into their OpenClaw / Hermes / Claude Code / Codex agent:

```
I'd like to use the service provided by HikmahGuide:

Service title: HikmahGuide: Authentic Islamic Reflection & Guidance
Service type: A2MCP
Endpoint: https://<your-deployment>/api/guidance
Please use OKX Agent Payments Protocol to send a request to this endpoint,
with body: { "question": "How do I deal with anxiety?" }
```

Their agent then:
1. Probes the endpoint (`payment quote … --method POST`), receives the 402 challenge.
2. Confirms the price with its user and pays via the Agentic Wallet.
3. Replays the request and receives the structured guidance JSON.
4. Reads `data.status` on the payment receipt: `success` → reports `txHash`; `failed` → surfaces the error; `pending` → polls.

---

## 5. What still needs to be implemented

HikmahGuide is call-ready but **not yet payment-gated**. To ship as a paid A2MCP service:

- [ ] Wrap [api/guidance.ts](api/guidance.ts) so an **unpaid** request returns a `402` with a valid Agent Payments Protocol challenge (`x402Version` body or `PAYMENT-REQUIRED` / `WWW-Authenticate: Payment` header).
- [ ] Verify the payment proof on the replayed request before running the Groq call, then return the `200` payload.
- [ ] Set up the OKX Agentic Wallet and register as an ASP (§3, steps 1–3).
- [ ] Publish the listing (§3, step 5).

Until then, the endpoint works as a normal free HTTP API and can be tested directly:
```bash
curl -X POST https://<your-deployment>/api/guidance \
  -H "Content-Type: application/json" \
  -d '{"question":"How do I deal with anxiety?"}'
```

> If you want it free (no payment gate), you can skip the 402 layer and list it as a **free** A2MCP service — steps 1, 2, 3, and 5 still apply.

---

## 6. Sources

- [OKX ASP (Agent Service Provider) docs](https://web3.okx.com/onchainos/dev-docs/okxai/asp)
- [Agent Payments Protocol](https://www.okx.com/en-au/learn/agent-payments-protocol)
- [OKX AI: A Marketplace for the Agent Economy](https://www.okx.com/en-ar/learn/okx-ai)
- [okx-agent-payments-protocol skill](https://mcpservers.org/agent-skills/okx/okx-agent-payments-protocol)
- [OKX Agent Trade Kit](https://www.okx.com/en-us/agent-tradekit)
