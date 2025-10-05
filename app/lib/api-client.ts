const JSON_HEADERS = {
  "Content-Type": "application/json",
}

type PostJsonParams<TBody> = {
  endpoint: string
  body: TBody
}

export type ApiResult<TResponse> = {
  ok: boolean
  status: number
  data: TResponse | null
  error: unknown
}

export async function postJson<TResponse = unknown, TBody = unknown>({
  endpoint,
  body,
}: PostJsonParams<TBody>): Promise<ApiResult<TResponse>> {
  console.log(`[api-client] → POST ${endpoint}`, body)

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(body),
    })

    let data: TResponse | null = null

    try {
      data = (await response.json()) as TResponse
    } catch (parseError) {
      console.error(`[api-client] Failed to parse JSON from ${endpoint}`, parseError)
      return { ok: false, status: response.status, data: null, error: parseError }
    }

    if (!response.ok) {
      console.warn(`[api-client] ← ${endpoint} responded with ${response.status}`, data)
      return { ok: false, status: response.status, data, error: data }
    }

    console.log(`[api-client] ← ${endpoint} responded with ${response.status}`, data)
    return { ok: true, status: response.status, data, error: null }
  } catch (error) {
    console.error(`[api-client] Network error calling ${endpoint}`, error)
    return { ok: false, status: 0, data: null, error }
  }
}
