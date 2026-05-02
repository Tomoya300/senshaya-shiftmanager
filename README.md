# Senshaya Shift Manager

カナダの洗車店向けシフト連絡自動化ツール。マネージャーが翌日のシフトを入力し、iOSショートカット経由で各従業員に個別の SMS を送信する作業を効率化します。

詳細な背景・要件は [project_plan.md](./project_plan.md) を参照してください。

## 技術スタック

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (PostgreSQL + Auth)
- **Vercel** (ホスティング)
- iOS ショートカット (SMS 送信)

## 環境構築

### 前提

- Node.js 20 以上
- npm
- Supabase アカウント・プロジェクト
- Vercel アカウント（デプロイ確認用、ローカル開発のみなら不要）

### 手順

```bash
# 1. リポジトリをクローン
git clone https://github.com/Tomoya300/senshaya-shiftmanager.git
cd senshaya-shiftmanager

# 2. 依存をインストール
npm install

# 3. 環境変数ファイルを作成
cp .env.example .env.local
# .env.local を開いて Supabase の URL と Anon Key を設定
# Supabase Dashboard → Project Settings → API から取得

# 4. 開発サーバー起動
npm run dev
```

`http://localhost:3000` を開いてアプリが表示されれば成功。
`http://localhost:3000/test-connection` で Supabase 接続を確認できます (Status: OK が出れば疎通済み)。

### Supabase スキーマの適用

新規環境を作る場合:

1. Supabase プロジェクトを作成
2. Dashboard → SQL Editor で [supabase/migrations/](./supabase/migrations/) 内の SQL を新しい順に実行
3. Dashboard → Authentication → Users で自分のユーザーを作成
4. SQL Editor で `public.managers` に自分の行を挿入:
   ```sql
   insert into public.managers (id, email, name, role)
   values ('<auth.users.id>', '<email>', '<your name>', 'manager');
   ```

## 環境変数

| 変数名                          | 用途                                              | 必要なタイミング         |
| ------------------------------- | ------------------------------------------------- | ------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase プロジェクト URL                         | 常時                     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key                                 | 常時                     |
| `NEXT_PUBLIC_SITE_URL`          | パスワードリセットメール内のリダイレクト先絶対URL | 常時                     |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase Service Role Key (サーバーサイドのみ)    | 管理機能実装後           |
| `SHORTCUT_API_TOKEN`            | iOS ショートカット認証トークン                    | ショートカット連携実装後 |

`NEXT_PUBLIC_SITE_URL` の値: 開発時は `http://localhost:3000`、本番は `https://<project>.vercel.app` を指定。

新しい変数を追加する場合は `.env.example` も更新してください。

## ディレクトリ構成

```
/
├── app/                  # Next.js App Router (pages, layouts, API routes)
│   ├── (auth)/          # 認証関連ページ
│   ├── (dashboard)/     # 認証後のページ
│   └── api/             # API エンドポイント
├── components/          # 再利用可能なコンポーネント
│   ├── ui/             # 汎用 UI コンポーネント
│   └── features/       # 機能別コンポーネント
├── lib/                # ユーティリティ・クライアント
│   ├── supabase/      # Supabase クライアント (browser/server)
│   ├── utils/         # 汎用関数
│   └── validations/   # Zod スキーマなど
├── types/             # TypeScript 型定義
├── supabase/          # マイグレーション
│   └── migrations/    # SQL マイグレーション
└── public/            # 静的ファイル
```

詳細な命名規則・コーディング規約は [CLAUDE.md](./CLAUDE.md) を参照。

## よく使うコマンド

| コマンド               | 用途                      |
| ---------------------- | ------------------------- |
| `npm run dev`          | 開発サーバー起動          |
| `npm run build`        | 本番ビルド                |
| `npm run start`        | 本番ビルドの起動          |
| `npm run lint`         | ESLint 実行               |
| `npm run format`       | Prettier で全ファイル整形 |
| `npm run format:check` | Prettier チェック (CI 用) |

## 開発フロー

### ブランチ戦略

- `main` は本番デプロイ用。直接 push 禁止
- 各 Issue に対してブランチを作成 (`<issue#>-<short-description>` 形式)
- GitHub Issue ページの "Create a branch" から自動生成するのが楽

### コミット規約

[Conventional Commits](https://www.conventionalcommits.org/ja/) に準拠:

- `feat:` 新機能
- `fix:` バグ修正
- `refactor:` リファクタリング
- `docs:` ドキュメント
- `style:` フォーマット変更
- `chore:` 設定など

例: `feat: implement login page (#6)`

### Pull Request

1. ブランチで作業 → コミット → push
2. GitHub で PR を作成（テンプレートが自動で挿入されます）
3. PR 本文に `Closes #<issue番号>` を含めて、マージ時に Issue が自動クローズされるようにする
4. レビュー → マージ
5. mainマージで Vercel が自動デプロイ

### マイグレーション運用

- 既存のマイグレーションファイルは編集しない
- スキーマ変更は新しいマイグレーションファイルを `supabase/migrations/<timestamp>_<description>.sql` で追加
- ローカルで SQL を確認後、Supabase Dashboard の SQL Editor で本番に適用

## デプロイ

`main` ブランチへのマージで Vercel に自動デプロイされます。PR 作成時にプレビューデプロイが自動生成されるので、マージ前に挙動を確認できます。

環境変数は Vercel ダッシュボードで管理 (Production / Preview にそれぞれ設定)。

## ドキュメント

- [project_plan.md](./project_plan.md) — プロジェクト全体のプラン・要件
- [CLAUDE.md](./CLAUDE.md) — Claude Code 向けの作業ガイド・コーディング規約

## ライセンス

Private project. 公開予定なし。
