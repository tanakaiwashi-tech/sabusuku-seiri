import { GMAIL_SENDER_PATTERNS, type GmailSenderPattern } from '@/src/constants/gmailSenders';

/** スキャン結果の候補1件 */
export interface GmailCandidate {
  /** マッチしたサービスパターン */
  pattern: GmailSenderPattern;
  /** 最新メールの件名 */
  subject: string;
  /** 最新メールの差出人 */
  from: string;
  /** 最新メールの日付文字列 */
  date: string;
  /** 直近3ヶ月でこのサービスからのメール件数 */
  matchCount: number;
}

interface MessageMeta {
  subject: string;
  from: string;
  date: string;
}

// ── PKCE ヘルパー ───────────────────────────────────────────────

/** バイト列を base64url エンコードする */
function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/** PKCE の code_verifier を生成する（32バイト = 43文字の base64url） */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64url(array);
}

/** code_verifier から code_challenge（SHA-256 + base64url）を生成する */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64url(new Uint8Array(digest));
}

/** CSRF 対策用の state パラメータを生成する */
function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64url(array);
}

/**
 * Googleアカウントにポップアップでサインインし、アクセストークンを返す。
 * - フロー: Authorization Code + PKCE（Implicit Flow から移行）
 * - スコープ: gmail.readonly（件名・差出人・日付のみ取得）
 * - トークンはメモリのみ保持（LocalStorageへの書き込みなし）
 */
export async function signInWithGoogle(): Promise<string> {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
  if (!clientId) {
    throw new Error('Google Client IDが設定されていません（EXPO_PUBLIC_GOOGLE_CLIENT_ID）');
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  const redirectUri = window.location.origin + '/oauth-callback.html';
  const scope = 'https://www.googleapis.com/auth/gmail.readonly';

  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    `client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&code_challenge=${encodeURIComponent(codeChallenge)}` +
    `&code_challenge_method=S256` +
    `&state=${encodeURIComponent(state)}` +
    `&prompt=consent`;

  return new Promise((resolve, reject) => {
    const popup = window.open(
      authUrl,
      'google-oauth',
      'width=500,height=650,left=300,top=100',
    );

    if (!popup) {
      reject(new Error('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。'));
      return;
    }

    // oauth-callback.html からの postMessage でコードを受け取る
    const onMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== 'oauth_callback') return;
      cleanup();

      // state 検証（CSRF 対策）
      if (event.data.state !== state) {
        reject(new Error('認証セッションが無効です。もう一度お試しください。'));
        return;
      }

      const code: string = event.data.code ?? '';
      if (!code) {
        reject(new Error('認証コードの取得に失敗しました'));
        return;
      }

      // トークンエンドポイントで認証コードをアクセストークンに交換
      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
            grant_type: 'authorization_code',
          }),
        });

        if (!tokenRes.ok) {
          const errText = await tokenRes.text().catch(() => '');
          reject(new Error(`トークン取得に失敗しました（${tokenRes.status}）${errText ? ': ' + errText : ''}`));
          return;
        }

        const tokenData = (await tokenRes.json()) as { access_token?: string };
        if (!tokenData.access_token) {
          reject(new Error('アクセストークンが取得できませんでした'));
          return;
        }
        resolve(tokenData.access_token);
      } catch (e) {
        reject(new Error('トークン交換中にエラーが発生しました'));
      }
    };

    // ポップアップが手動で閉じられた場合を検知
    const closedTimer = setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error('ログインがキャンセルされました'));
      }
    }, 500);

    const cleanup = () => {
      window.removeEventListener('message', onMessage);
      clearInterval(closedTimer);
      clearTimeout(timeoutId);
      if (!popup.closed) popup.close();
    };

    window.addEventListener('message', onMessage);

    // 5分でタイムアウト
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('ログインがタイムアウトしました'));
    }, 5 * 60 * 1000);
  });
}

/**
 * 指定ラベルのメッセージIDリストを取得する。
 * 401 は呼び出し元に伝播させ、その他エラーは空配列を返す（タブが存在しない場合を考慮）。
 */
async function listMessageIds(
  accessToken: string,
  labelId: string,
  maxResults: number,
): Promise<{ id: string }[]> {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&labelIds=${labelId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (res.status === 401) throw new Error('認証の有効期限が切れました。再スキャンしてください。');
  if (!res.ok) return []; // ラベル未存在など非致命的エラーは無視
  const data = (await res.json()) as { messages?: { id: string }[] };
  return data.messages ?? [];
}

/**
 * Gmail APIでメタデータを取得し、サブスク候補リストを返す。
 * INBOX とプロモーションタブを並列取得し差出人ドメインで絞り込む。
 * 請求メールの大半はGmailによりプロモーションタブに自動分類されるため両方をスキャンする。
 */
export async function scanGmailForSubscriptions(
  accessToken: string,
): Promise<GmailCandidate[]> {
  // INBOX とプロモーションタブを並列取得（各200件）
  const [inboxMessages, promoMessages] = await Promise.all([
    listMessageIds(accessToken, 'INBOX', 200),
    listMessageIds(accessToken, 'CATEGORY_PROMOTIONS', 200),
  ]);

  // IDで重複除去してマージ
  const seen = new Set<string>();
  const allMessages: { id: string }[] = [];
  for (const msg of [...inboxMessages, ...promoMessages]) {
    if (!seen.has(msg.id)) {
      seen.add(msg.id);
      allMessages.push(msg);
    }
  }

  if (allMessages.length === 0) {
    throw new Error('メールが見つかりませんでした。スコープの権限を確認してください。');
  }

  // メタデータを取得してドメイン照合（最大400件）
  const metaList = await fetchMessagesMetadata(allMessages, accessToken);
  return matchCandidates(metaList);
}

/** メッセージIDリストからメタデータ（件名・差出人・日付）を並列取得 */
async function fetchMessagesMetadata(
  messages: { id: string }[],
  accessToken: string,
): Promise<MessageMeta[]> {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const results: MessageMeta[] = [];

  // 20件ずつチャンク処理（レート制限を考慮）
  for (let i = 0; i < messages.length; i += 20) {
    const chunk = messages.slice(i, i + 20);
    const fetched = await Promise.all(
      chunk.map(async ({ id }) => {
        try {
          const res = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}` +
              `?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            { headers },
          );
          if (!res.ok) return null;
          const data = (await res.json()) as {
            payload?: { headers?: { name: string; value: string }[] };
          };
          const hdrs = data.payload?.headers ?? [];
          const get = (name: string) =>
            hdrs.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';
          return { subject: get('Subject'), from: get('From'), date: get('Date') };
        } catch {
          return null;
        }
      }),
    );
    results.push(...fetched.filter((m): m is MessageMeta => m !== null));
  }

  return results;
}

/** From ヘッダーからドメイン部分を抽出する */
function extractDomain(from: string): string {
  // "Name <email@domain.com>" または "email@domain.com" の両形式に対応
  const match = from.match(/@([^>"\s]+)/);
  return match ? match[1].toLowerCase() : '';
}

/** メタデータリストをパターン辞書と照合し、候補リストを生成する */
function matchCandidates(metaList: MessageMeta[]): GmailCandidate[] {
  // パターンのnormalizedNameをキーに集計
  const patternMap = new Map<string, { pattern: GmailSenderPattern; metas: MessageMeta[] }>();

  for (const meta of metaList) {
    const domain = extractDomain(meta.from);
    if (!domain) continue;

    for (const pattern of GMAIL_SENDER_PATTERNS) {
      if (domain.includes(pattern.senderDomain)) {
        const key = pattern.normalizedName;
        if (!patternMap.has(key)) {
          patternMap.set(key, { pattern, metas: [] });
        }
        patternMap.get(key)!.metas.push(meta);
        break; // 最初にマッチしたパターンのみ使用
      }
    }
  }

  // 各サービスの最新メールを代表として候補を作成
  const candidates: GmailCandidate[] = [];
  for (const { pattern, metas } of patternMap.values()) {
    candidates.push({
      pattern,
      subject: metas[0].subject, // Gmail APIは新しい順に返す
      from: metas[0].from,
      date: metas[0].date,
      matchCount: metas.length,
    });
  }

  // メール件数の多い順（利用頻度が高い順）にソート
  return candidates.sort((a, b) => b.matchCount - a.matchCount);
}
