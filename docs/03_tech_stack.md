# 技術スタック構成

## プロジェクト制約条件
- フロントエンド: Next.js 14+ (App Router)
- バックエンド: Next.js API Routes
- 言語: TypeScript (strict mode)
- デプロイ: Vercel
- データベース: Supabase
- スタイリング: Tailwind CSS

---

## 技術スタック詳細

### フロントエンド

#### コアフレームワーク
- **Next.js 14.2+** (App Router)
  - 理由: React Server Components、Server Actions、最適化されたルーティング
  - 使用機能:
    - App Router（ファイルベースルーティング）
    - Server Components（初期表示の高速化）
    - Server Actions（フォーム処理のシンプル化）
    - Metadata API（SEO対策）

#### 言語
- **TypeScript 5.3+** (strict mode)
  - 理由: 型安全性、開発体験の向上、バグの早期発見
  - 設定:
    - strict: true
    - noUncheckedIndexedAccess: true
    - noImplicitReturns: true

#### UIライブラリ・コンポーネント
- **Tailwind CSS 3.4+**
  - 理由: ユーティリティファースト、高速な開発、小さなバンドルサイズ
  - プラグイン:
    - @tailwindcss/forms（フォームスタイリング）
    - @tailwindcss/typography（テキストスタイリング）

- **shadcn/ui**
  - 理由: アクセシブルなコンポーネント、カスタマイズ性、コピー&ペーストで使える
  - 使用コンポーネント:
    - Button
    - Calendar
    - Dialog
    - Dropdown Menu
    - Form（react-hook-formと統合）
    - Table
    - Toast（通知）
    - Card
    - Input
    - Label

- **Radix UI**
  - 理由: shadcn/uiのベース、アクセシビリティ対応
  - shadcn/ui経由で利用

#### カレンダー・日付処理
- **date-fns**
  - 理由: 軽量、ツリーシェイキング対応、モジュラー、日本語対応
  - 代替: Day.js（date-fnsより軽量だがdate-fnsの方が型サポートが充実）

- **react-big-calendar** または **@schedule-x/calendar**
  - 理由: カレンダーUIの実装
  - 選定: @schedule-x/calendar（モダン、TypeScript対応、軽量）

#### フォーム管理
- **react-hook-form**
  - 理由: パフォーマンス、シンプルなAPI、バリデーション統合
  - 連携: Zod（スキーマバリデーション）

- **Zod**
  - 理由: TypeScript優先のバリデーションライブラリ、型推論
  - 用途: フォームバリデーション、API入力検証

#### QRコード
- **qrcode.react**
  - 理由: React対応、軽量、カスタマイズ可能
  - 用途: スタッフログイン用QRコード生成

- **html5-qrcode**
  - 理由: QRコードスキャン機能、カメラアクセス
  - 用途: スタッフ側のQRコードログイン

#### 状態管理
- **React Context + useState/useReducer**
  - 理由: MVPレベルでは十分、追加ライブラリ不要
  - スコープ: 認証状態、ユーザー情報
  - 将来的な選択肢: Zustand（シンプル）、Jotai（アトミック）

#### アイコン
- **lucide-react**
  - 理由: 軽量、一貫性、shadcn/uiと相性良い

---

### バックエンド

#### API
- **Next.js API Routes (App Router)**
  - 理由: フロントエンドと統合、デプロイが簡単
  - 使用機能:
    - Route Handlers（app/api）
    - Server Actions（フォーム処理）

#### データベース
- **Supabase**
  - 理由: PostgreSQLベース、認証機能統合、リアルタイム機能、無料枠が充実
  - 使用機能:
    - Supabase Auth（認証）
    - Supabase Database（PostgreSQL）
    - Supabase Realtime（リアルタイム同期）
    - Row Level Security（RLS）

#### ORM/クエリビルダー
- **Prisma** または **Supabase Client**
  - 選定: **Supabase Client**
  - 理由:
    - Supabaseとのネイティブ統合
    - 型生成機能
    - リアルタイム機能との統合
    - シンプルなAPI
  - Prismaは今回不使用（Supabaseの機能と重複するため）

#### 認証
- **Supabase Auth**
  - 理由: メール/パスワード認証、セッション管理、RLS統合
  - 認証フロー:
    - 管理者: メール + パスワード
    - スタッフ: マジックリンクまたはトークンベース認証

#### メール送信
- **Resend**
  - 理由: モダンなAPI、Next.js公式推奨、無料枠100通/日
  - 用途: シフト公開通知、招待メール
  - 代替: SendGrid、Postmark（より多くの送信量が必要な場合）

---

### 開発ツール

#### リンター・フォーマッター
- **ESLint 8+**
  - 設定: next/core-web-vitals
  - 追加ルール: TypeScript推奨ルール

- **Prettier**
  - 理由: コードフォーマットの統一
  - 設定: セミコロンあり、シングルクォート、2スペースインデント

#### 型チェック
- **TypeScript Compiler**
  - strict mode有効
  - CI/CDで型チェック実行

#### テスト（MVP後）
- **Vitest**
  - 理由: 高速、Viteベース、Jest互換
- **Testing Library**
  - 理由: ユーザー視点のテスト
- **Playwright**
  - 理由: E2Eテスト

---

### インフラ・デプロイ

#### ホスティング
- **Vercel**
  - 理由: Next.js公式、自動デプロイ、プレビュー環境、エッジ関数
  - 使用機能:
    - 自動デプロイ（GitHubプッシュ時）
    - プレビューURL（PR単位）
    - 環境変数管理
    - Analytics（将来）

#### データベースホスティング
- **Supabase Cloud**
  - 理由: マネージドサービス、無料枠500MB、自動バックアップ
  - プラン: Free（MVP）→ Pro（スケール時）

#### ドメイン
- **Vercel Domains** または 独自ドメイン
  - MVP: Vercelのサブドメイン（無料）
  - 本番: 独自ドメイン（.com または .jp）

---

## パッケージ一覧

### 依存関係（dependencies）

\`\`\`json
{
  "next": "^14.2.0",
  "react": "^18.3.0",
  "react-dom": "^18.3.0",
  "typescript": "^5.3.0",

  "@supabase/supabase-js": "^2.39.0",
  "@supabase/auth-helpers-nextjs": "^0.10.0",

  "tailwindcss": "^3.4.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",

  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-toast": "^1.1.5",

  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0",

  "react-hook-form": "^7.50.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0",

  "date-fns": "^3.3.0",
  "@schedule-x/calendar": "^1.46.0",

  "qrcode.react": "^3.1.0",
  "html5-qrcode": "^2.3.8",

  "lucide-react": "^0.344.0",

  "resend": "^3.2.0"
}
\`\`\`

### 開発依存関係（devDependencies）

\`\`\`json
{
  "@types/node": "^20.11.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",

  "eslint": "^8.56.0",
  "eslint-config-next": "^14.2.0",

  "prettier": "^3.2.0",
  "prettier-plugin-tailwindcss": "^0.5.0"
}
\`\`\`

---

## アーキテクチャ図

\`\`\`mermaid
graph TB
    subgraph "クライアント"
        A[ブラウザ<br/>Chrome, Safari, etc.]
    end

    subgraph "Vercel"
        B[Next.js App Router]
        C[API Routes]
        D[Server Actions]
        E[Static Assets]
    end

    subgraph "Supabase"
        F[PostgreSQL Database]
        G[Supabase Auth]
        H[Realtime]
        I[Storage]
    end

    subgraph "外部サービス"
        J[Resend<br/>メール送信]
    end

    A -->|HTTPS| B
    B -->|API Call| C
    B -->|Form Submit| D
    C -->|Query| F
    D -->|Query| F
    C -->|Auth| G
    D -->|Auth| G
    B -->|Subscribe| H
    H -->|Push| A
    C -->|Send Email| J
    D -->|Send Email| J

    style A fill:#e1f5ff
    style B fill:#fff4e1
    style F fill:#e8f5e9
    style J fill:#fce4ec
\`\`\`

---

## ディレクトリ構造

\`\`\`
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── staff/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── shifts/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   └── requests/
│   │   │       └── page.tsx
│   │   ├── staff/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── requests/
│   │   │   │   └── page.tsx
│   │   │   └── shifts/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...supabase]/
│   │   │       └── route.ts
│   │   ├── staff/
│   │   │   └── route.ts
│   │   ├── shifts/
│   │   │   └── route.ts
│   │   └── requests/
│   │       └── route.ts
│   ├── qr-login/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   ├── admin/
│   │   ├── staff-list.tsx
│   │   ├── qr-code-generator.tsx
│   │   ├── shift-calendar.tsx
│   │   └── ...
│   ├── staff/
│   │   ├── shift-request-form.tsx
│   │   ├── qr-scanner.tsx
│   │   └── ...
│   └── shared/
│       ├── header.tsx
│       ├── footer.tsx
│       └── ...
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   ├── validations/
│   │   ├── auth.ts
│   │   ├── shift.ts
│   │   └── staff.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-shifts.ts
│   └── use-staff.ts
├── types/
│   ├── database.ts
│   └── index.ts
├── public/
│   ├── images/
│   └── ...
├── docs/
│   ├── 01_competitive_analysis.md
│   ├── 02_feature_design.md
│   └── 03_tech_stack.md
├── .env.local.example
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
\`\`\`

---

## 環境変数

### 必須環境変数（.env.local）

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Resend
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

---

## 技術選定理由まとめ

| カテゴリ | 選定技術 | 理由 |
|---------|---------|------|
| フレームワーク | Next.js 14 | App Router、RSC、Server Actions、Vercel最適化 |
| 言語 | TypeScript | 型安全性、開発体験、エラー防止 |
| データベース | Supabase | PostgreSQL、認証統合、リアルタイム、無料枠 |
| スタイリング | Tailwind CSS | ユーティリティファースト、高速開発 |
| UIコンポーネント | shadcn/ui | アクセシブル、カスタマイズ可、コピペ可 |
| フォーム | react-hook-form + Zod | パフォーマンス、型安全なバリデーション |
| 日付処理 | date-fns | 軽量、ツリーシェイキング、日本語対応 |
| QRコード | qrcode.react + html5-qrcode | React対応、軽量、スキャン機能 |
| メール | Resend | モダンAPI、Next.js推奨、無料枠 |
| デプロイ | Vercel | Next.js公式、自動デプロイ、プレビュー環境 |

---

## スケーラビリティとパフォーマンスの考慮

### パフォーマンス最適化
1. **Server Components優先**: 可能な限りRSCを使用
2. **動的インポート**: 大きなコンポーネントは`next/dynamic`で遅延読み込み
3. **画像最適化**: `next/image`使用
4. **フォント最適化**: `next/font`使用
5. **バンドル分析**: `@next/bundle-analyzer`で定期チェック

### スケーラビリティ
1. **Supabase RLS**: セキュリティと拡張性
2. **Edge Functions**: 必要に応じてVercel Edge Functions使用
3. **キャッシング**: Next.jsのキャッシュ戦略活用
4. **CDN**: Vercel CDNで静的アセット配信

---

## セキュリティ対策

1. **認証**: Supabase Authでセキュアなセッション管理
2. **RLS**: Row Level Securityでデータアクセス制御
3. **入力検証**: Zodでクライアント/サーバー両方で検証
4. **CSRF対策**: Server Actionsのビルトイン保護
5. **環境変数**: 機密情報は環境変数で管理、コミットしない
6. **HTTPS**: Vercelで自動的にHTTPS

---

## 次フェーズへの引き継ぎ

Phase 4（DB設計）での検討事項:
- 上記技術スタック前提でのテーブル設計
- Supabase RLSポリシーの設計
- インデックス戦略
