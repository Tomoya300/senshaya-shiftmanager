<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


## プロジェクト概要

カナダの洗車店向けのシフト連絡自動化ツール。マネージャーが翌日のシフトを入力し、各従業員に個別のSMSテキストメッセージを送信する作業を効率化する。

### 解決する課題

- マネージャーが従業員15〜20名に対して、毎日個別のテキストメッセージでシフトを連絡している
- 従業員ごとに異なるシフト時間(例:9時、10時、11時、13時など)
- 翌日のシフトはその日の終業後に決定される(週次・月次の一括作成は不可)

### 主要な利用者

- 店舗マネージャー1名
- アシスタントマネージャー1名(マネージャー休日時に代行管理)

### 重要な設計方針

- **ランニングコスト$0**を維持する。有料サービスは使わない。
- SMSはマネージャー個人の通信プランから送信する(SMS APIは使わない)
- 既存のホワイトボード運用を完全には置き換えず、共存できる形で導入する
- マネージャー2名のみが利用するため、複雑な権限管理は不要

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + React + TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド/DB**: Supabase (PostgreSQL)
- **認証**: Supabase Auth (メール/パスワード)
- **ホスティング**: Vercel
- **SMS送信**: iOSショートカット + マネージャーの通信プラン
- **ソース管理**: GitHub

### 重要な前提

- **無料枠で運用する**。SupabaseのFree Tier、VercelのHobby枠を超えないこと。
- **ユーザー数は最大2名**(マネージャー、アシスタントマネージャー)。スケーラビリティより簡潔さを優先する。

## ディレクトリ構成

```
/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── (dashboard)/       # 認証後のページ
│   ├── api/               # APIエンドポイント
│   └── layout.tsx
├── components/            # 再利用可能なコンポーネント
│   ├── ui/               # 汎用UIコンポーネント
│   └── features/         # 機能別コンポーネント
├── lib/                  # ユーティリティ・クライアント
│   ├── supabase/        # Supabaseクライアント
│   ├── utils/           # 汎用関数
│   └── validations/     # Zodスキーマなど
├── types/               # TypeScript型定義
├── supabase/           # マイグレーション
│   └── migrations/
└── public/             # 静的ファイル
```

新しいファイルを作成する際は上記の構成に従うこと。新しいディレクトリを作る前に、既存のディレクトリで対応できないか検討する。

## データモデル

主要テーブル:

- `managers`: マネージャーアカウント (id, email, name, role)
- `employees`: 従業員情報 (id, name, phone, visa_type, weekly_hour_limit, notes, is_active)
- `recurring_days_off`: 曜日固定の休み (id, employee_id, day_of_week)
- `requested_days_off`: リクエストオフ (id, employee_id, start_date, end_date, reason)
- `shifts`: シフト情報 (id, employee_id, shift_date, start_time, is_off, status)
- `message_logs`: 送信履歴 (id, shift_id, sent_at, message_body)

詳細はリポジトリ内の `docs/project_plan.md` を参照すること。

## コーディング規約

### TypeScript

- `any`型は原則禁止。やむを得ず使う場合はコメントで理由を明記する。
- データベースから取得する型は、Supabaseの自動生成型を活用する。
- 関数の引数と戻り値の型は明示的に書く(推論に頼りすぎない)。

### React/Next.js

- App Routerを使用する。Pages Routerは使わない。
- サーバーコンポーネントを基本とし、必要な場合のみクライアントコンポーネント (`"use client"`) を使う。
- データ取得はサーバーコンポーネントで行うのが望ましい。
- フォーム処理は Server Actions を活用する。

### スタイリング

- Tailwind CSSのユーティリティクラスを使用する。
- カスタムCSSは原則書かない。
- レスポンシブ対応は必須(マネージャーがスマホからも操作する可能性あり)。
- 色やスペーシングは、Tailwindのデフォルトトークンを使用する。

### 命名規則

- ファイル名: kebab-case (例: `employee-form.tsx`)
- コンポーネント名: PascalCase (例: `EmployeeForm`)
- 関数・変数: camelCase
- 定数: UPPER_SNAKE_CASE
- 型・インターフェース: PascalCase

### 言語

- コメントは日本語OK
- 変数名・関数名は英語
- UIテキストは日本語(ユーザーが日本人マネージャーのため)
- ただし、将来の英語対応を考慮し、UIテキストは直書きせず定数化が望ましい

## 共同開発のルール

### ブランチ戦略

- `main`: 本番デプロイ用、直接コミット禁止
- 各Issueに対してブランチを作成する(GitHubのIssueから自動生成)
- 命名規則: `[issue番号]-[簡潔な説明]` (Issueから自動生成される形式)

### コミット規約

Conventional Commits に準拠:

- `feat:` 新機能
- `fix:` バグ修正
- `refactor:` リファクタリング
- `docs:` ドキュメント
- `style:` フォーマット変更
- `chore:` 設定など

例: `feat: implement login page (#6)`

コミットメッセージには関連Issueの番号を含める。

### Pull Request

- すべての変更はPR経由でmainにマージする
- PR本文に `Closes #[issue番号]` を含めて、マージ時にIssueが自動クローズされるようにする
- 最低1名のレビューを必須とする
- レビュー前にセルフレビューを行う(diff全体を見直す)

## Claude Codeで作業する際の指針

### 重要事項

#### やってよいこと

- 既存のコードスタイルに合わせた実装
- 型定義の追加・修正
- テストコードの追加
- ドキュメントの追記
- 不要になったコードの削除

#### 必ず確認してから行うこと

- 新しい依存パッケージの追加(無料枠を超えない、軽量なものか確認)
- データベーススキーマの変更
- 環境変数の追加
- 認証フローの変更
- APIエンドポイントの認証方法の変更

#### やってはいけないこと

- **`.env.local` をコミットすること**
- `main` ブランチに直接コミット・push
- 既存のマイグレーションファイルの編集(新しいマイグレーションを追加する形で対応)
- 無料枠を超える可能性のある外部APIの利用追加
- 従業員の電話番号や個人情報をログに出力する
- テストデータに実在の電話番号を使う

### 作業を始める前の確認

新しいタスクに着手する際は以下を確認する:

1. 関連するIssueを読み、要件を理解する
2. 該当ブランチがmainから派生していて最新か確認する
3. 既存の類似コードを参照して、スタイルを揃える
4. データモデルやAPIの変更が必要か検討する

### 不明点があった場合

- 既存のコードを読んで理解する
- `docs/project_plan.md` を参照する
- それでも不明な場合は、推測で実装せず、ユーザーに確認する

## iOSショートカット連携

このプロジェクトの特殊な要素として、iOSショートカット連携がある。

### 設計上の注意

- ショートカットからアクセスされるAPIエンドポイントは `/api/shifts/messages` 系
- 認証は簡易トークン方式(マネージャーのみ知る固定トークン)
- レスポンスは必ず JSON で、ショートカットがパースしやすい構造にする
- 電話番号は E.164 形式 (`+1XXXXXXXXXX`) で返す

### APIレスポンス例

```json
{
  "date": "2026-04-25",
  "messages": [
    { "phone": "+1XXXXXXXXXX", "body": "明日 4/25 (土) は 9:00 からです。" },
    { "phone": "+1XXXXXXXXXX", "body": "明日 4/25 (土) はお休みです。" }
  ]
}
```

### グループSMSを避ける

ショートカット側で1人ずつ個別送信するため、APIは配列を返すだけで良い。一括送信用のテキストを返す形式にはしない。

## セキュリティ・プライバシー

- 従業員の電話番号は個人情報として慎重に扱う
- フロントエンドに電話番号をベタ書きしない
- ログ・エラー出力に電話番号や本名を含めない
- Supabase RLSを必ず設定し、認証されたマネージャーのみがデータにアクセスできるようにする

## テスト方針

- MVP段階では網羅的なテストは書かない(時間対効果を優先)
- ただし、以下の処理は単体テストを書く:
  - シフト時間の集計ロジック
  - 週間労働時間の計算
  - メッセージテンプレートの変数置換
  - 電話番号のバリデーション・整形
- E2Eテストは現時点では不要

## 環境変数

`.env.local` に以下を設定する(`.env.example` をコピーして使用):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # サーバーサイドのみ
SHORTCUT_API_TOKEN=                # iOSショートカット認証用
```

新しい環境変数を追加する場合は、`.env.example` も同時に更新する。

## デプロイ

- mainブランチへのマージで自動的にVercelにデプロイされる
- プレビューデプロイ: PR作成時に自動生成される
- 環境変数はVercelのプロジェクト設定で管理する

## 参考ドキュメント

リポジトリ内の以下のドキュメントを必要に応じて参照する:

- `docs/project_plan.md`: 詳細なプロジェクトプラン
- `docs/github_issues.md`: Issue一覧と着手順序
- `README.md`: 環境構築・基本情報

## 困ったときは

- ビルドエラー: 型エラーやimportエラーを確認
- Supabase接続エラー: 環境変数を再確認
- ショートカットが動かない: APIエンドポイントが認証を通っているか確認
- スタイルが反映されない: Tailwindのpurge設定、`tailwind.config.ts` の `content` を確認