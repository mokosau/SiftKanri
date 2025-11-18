# シンプルシフト管理

5分で始められる、誰でも使えるシフト管理システム

## 概要

シンプルシフト管理は、小規模事業者向けの使いやすいシフト管理システムです。複雑な機能は排除し、本当に必要な機能だけに絞り込むことで、誰でも直感的に使えるシンプルなUIUXを実現しました。

### 主な特徴

- **QRコードログイン**: スタッフはQRコードをスキャンするだけでログイン可能
- **シンプルなUI**: 学習コストゼロ、直感的に使える画面設計
- **リアルタイム同期**: 複数デバイスでのデータ同期
- **低価格**: 大手サービスより圧倒的に低コスト（目標: 100円/ユーザー/月）

## 機能一覧

### 管理者機能
- アカウント登録・ログイン
- スタッフ管理（追加・削除・QRコード発行）
- シフト希望確認
- シフト作成・編集
- シフト公開・通知
- ダッシュボード（統計表示）

### スタッフ機能
- QRコードログイン
- シフト希望提出（カレンダーUI）
- 確定シフト閲覧
- ダッシュボード

## 技術スタック

### フロントエンド
- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **shadcn/ui** (UIコンポーネント)
- **date-fns** (日付処理)

### バックエンド
- **Supabase** (PostgreSQL, 認証, リアルタイム)
- **Next.js API Routes & Server Actions**

### インフラ
- **Vercel** (ホスティング)

## セットアップ手順

### 1. リポジトリのクローン

\`\`\`bash
git clone <repository-url>
cd SiftKanri
\`\`\`

### 2. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

### 3. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)でアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクトのURL、Anon Key、Service Role Keyを取得

### 4. データベースのセットアップ

Supabaseダッシュボードの「SQL Editor」で、以下のマイグレーションファイルを順番に実行:

1. `supabase/migrations/00001_initial_schema.sql`
2. `supabase/migrations/00002_rls_policies.sql`
3. `supabase/migrations/00003_triggers.sql`

### 5. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

`.env.local`を編集し、Supabaseの認証情報を設定:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 6. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで http://localhost:3000 を開きます。

## 使い方

### 管理者として始める

1. トップページから「無料で始める」をクリック
2. 組織名、名前、メールアドレス、パスワードを入力して登録
3. 管理者ダッシュボードが表示されます

### スタッフを追加

1. 管理者ダッシュボードで「スタッフ管理」に移動
2. 「スタッフ追加」ボタンをクリック
3. スタッフコード、名前などを入力して追加
4. スタッフ一覧から「QR」ボタンをクリックしてQRコードを表示・印刷
5. QRコードをスタッフに配布

### スタッフとしてログイン

1. スマホのカメラアプリでQRコードをスキャン
2. 自動的にログインページが開き、ログイン完了
3. スタッフダッシュボードが表示されます

### シフト希望を提出（スタッフ）

1. スタッフダッシュボードで「シフト希望を提出する」をクリック
2. カレンダーから日付を選択
3. 「出勤可能」「出勤不可」「時間指定」を選択して提出

### シフトを作成（管理者）

1. 管理者ダッシュボードで「シフト管理」に移動
2. 「シフト作成」ボタンをクリック
3. 日付、時間、必要人数を入力して作成
4. 作成したシフトの「公開」ボタンをクリックして公開

## デプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com/)でアカウントを作成
2. GitHubリポジトリを接続
3. 環境変数を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`（デプロイ後のURL）
4. デプロイ

## ディレクトリ構造

\`\`\`
/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証ページ（ログイン、登録）
│   ├── (dashboard)/       # ダッシュボード（管理者・スタッフ）
│   ├── api/               # API Routes
│   ├── qr-login/          # QRログインページ
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # トップページ（LP）
│   └── globals.css        # グローバルスタイル
├── components/            # Reactコンポーネント
│   ├── ui/                # 基本UIコンポーネント
│   ├── admin/             # 管理者用コンポーネント
│   ├── staff/             # スタッフ用コンポーネント
│   └── shared/            # 共通コンポーネント
├── lib/                   # ユーティリティ・ライブラリ
│   ├── supabase/          # Supabaseクライアント
│   └── validations/       # バリデーションスキーマ
├── hooks/                 # カスタムReact Hooks
├── types/                 # TypeScript型定義
├── supabase/              # Supabase設定・マイグレーション
│   ├── migrations/        # DBマイグレーションファイル
│   └── config.toml        # Supabase設定
└── docs/                  # ドキュメント
    ├── 01_competitive_analysis.md
    ├── 02_feature_design.md
    ├── 03_tech_stack.md
    └── 04_database_design.md
\`\`\`

## 開発方針

- **シンプル第一**: 必要最小限の機能に絞り込む
- **型安全性**: TypeScript strict modeで開発
- **ユーザビリティ**: モバイルファーストの設計
- **パフォーマンス**: Server Componentsを優先的に使用

## ライセンス

MIT License

## サポート

問題が発生した場合は、GitHubのIssuesで報告してください。

## 今後の予定

- メール通知機能の実装
- シフトのCSVエクスポート
- 複数店舗管理
- シフトコピー機能
- 勤務時間自動集計
- PWA対応（プッシュ通知）

---

© 2025 シンプルシフト管理. All rights reserved.
