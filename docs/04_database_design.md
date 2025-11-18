# データベース設計

## 概要
- データベース: PostgreSQL (Supabase)
- 認証: Supabase Auth
- セキュリティ: Row Level Security (RLS)

---

## ER図

\`\`\`mermaid
erDiagram
    organizations ||--o{ users : "has"
    organizations ||--o{ staff : "has"
    organizations ||--o{ shifts : "has"
    organizations ||--o{ shift_requests : "has"
    users ||--o{ staff : "manages"
    staff ||--o{ shift_assignments : "assigned to"
    staff ||--o{ shift_requests : "submits"
    shifts ||--o{ shift_assignments : "contains"
    shifts ||--o{ shift_requests : "receives"

    organizations {
        uuid id PK
        text name
        timestamptz created_at
        timestamptz updated_at
    }

    users {
        uuid id PK "Supabase Auth User ID"
        uuid organization_id FK
        text email
        text role "admin or staff"
        text full_name
        timestamptz created_at
        timestamptz updated_at
    }

    staff {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK "nullable for invite-only"
        text staff_code "unique per org"
        text full_name
        text email
        text phone "nullable"
        text qr_token "unique token for QR login"
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    shifts {
        uuid id PK
        uuid organization_id FK
        date shift_date
        time start_time
        time end_time
        int required_staff "nullable"
        text notes "nullable"
        text status "draft or published"
        timestamptz published_at "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    shift_assignments {
        uuid id PK
        uuid shift_id FK
        uuid staff_id FK
        time start_time "override shift time if needed"
        time end_time "override shift time if needed"
        text notes "nullable"
        timestamptz created_at
        timestamptz updated_at
    }

    shift_requests {
        uuid id PK
        uuid organization_id FK
        uuid staff_id FK
        uuid shift_id FK "nullable, if requesting for specific shift"
        date request_date
        text request_type "available, unavailable, preferred_time"
        time preferred_start_time "nullable"
        time preferred_end_time "nullable"
        text notes "nullable"
        text status "pending, approved, rejected"
        timestamptz created_at
        timestamptz updated_at
    }
\`\`\`

---

## テーブル定義

### 1. organizations（組織・店舗）

\`\`\`sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_organizations_created_at ON organizations(created_at);

-- RLS有効化
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: ユーザーは自分の組織のみ閲覧可能
CREATE POLICY "Users can view their own organization"
    ON organizations FOR SELECT
    USING (id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- RLSポリシー: 管理者は自分の組織を更新可能
CREATE POLICY "Admins can update their own organization"
    ON organizations FOR UPDATE
    USING (id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));
\`\`\`

---

### 2. users（ユーザー）

\`\`\`sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ユニーク制約
CREATE UNIQUE INDEX idx_users_email_org ON users(email, organization_id);

-- RLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: ユーザーは自分自身と同じ組織のユーザーを閲覧可能
CREATE POLICY "Users can view users in their organization"
    ON users FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- RLSポリシー: ユーザーは自分自身を更新可能
CREATE POLICY "Users can update themselves"
    ON users FOR UPDATE
    USING (id = auth.uid());
\`\`\`

---

### 3. staff（スタッフ）

\`\`\`sql
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    staff_code TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    qr_token TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_staff_organization_id ON staff(organization_id);
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_qr_token ON staff(qr_token);
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- ユニーク制約
CREATE UNIQUE INDEX idx_staff_code_org ON staff(staff_code, organization_id);

-- RLS有効化
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 同じ組織のユーザーはスタッフを閲覧可能
CREATE POLICY "Users can view staff in their organization"
    ON staff FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- RLSポリシー: 管理者はスタッフを追加可能
CREATE POLICY "Admins can insert staff"
    ON staff FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLSポリシー: 管理者はスタッフを更新可能
CREATE POLICY "Admins can update staff"
    ON staff FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLSポリシー: 管理者はスタッフを削除可能
CREATE POLICY "Admins can delete staff"
    ON staff FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));
\`\`\`

---

### 4. shifts（シフト）

\`\`\`sql
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    required_staff INTEGER,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_shifts_organization_id ON shifts(organization_id);
CREATE INDEX idx_shifts_shift_date ON shifts(shift_date);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_org_date ON shifts(organization_id, shift_date);

-- RLS有効化
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 同じ組織のユーザーはシフトを閲覧可能
CREATE POLICY "Users can view shifts in their organization"
    ON shifts FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- RLSポリシー: 管理者はシフトを作成可能
CREATE POLICY "Admins can insert shifts"
    ON shifts FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLSポリシー: 管理者はシフトを更新可能
CREATE POLICY "Admins can update shifts"
    ON shifts FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- RLSポリシー: 管理者はシフトを削除可能
CREATE POLICY "Admins can delete shifts"
    ON shifts FOR DELETE
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));
\`\`\`

---

### 5. shift_assignments（シフト割り当て）

\`\`\`sql
CREATE TABLE shift_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    start_time TIME,
    end_time TIME,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_shift_assignments_shift_id ON shift_assignments(shift_id);
CREATE INDEX idx_shift_assignments_staff_id ON shift_assignments(staff_id);

-- ユニーク制約: 同じシフトに同じスタッフは1回のみ割り当て
CREATE UNIQUE INDEX idx_shift_staff_unique ON shift_assignments(shift_id, staff_id);

-- RLS有効化
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 同じ組織のユーザーは割り当てを閲覧可能
CREATE POLICY "Users can view shift assignments in their organization"
    ON shift_assignments FOR SELECT
    USING (shift_id IN (
        SELECT id FROM shifts WHERE organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    ));

-- RLSポリシー: 管理者は割り当てを作成可能
CREATE POLICY "Admins can insert shift assignments"
    ON shift_assignments FOR INSERT
    WITH CHECK (shift_id IN (
        SELECT id FROM shifts WHERE organization_id IN (
            SELECT organization_id FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    ));

-- RLSポリシー: 管理者は割り当てを更新可能
CREATE POLICY "Admins can update shift assignments"
    ON shift_assignments FOR UPDATE
    USING (shift_id IN (
        SELECT id FROM shifts WHERE organization_id IN (
            SELECT organization_id FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    ));

-- RLSポリシー: 管理者は割り当てを削除可能
CREATE POLICY "Admins can delete shift assignments"
    ON shift_assignments FOR DELETE
    USING (shift_id IN (
        SELECT id FROM shifts WHERE organization_id IN (
            SELECT organization_id FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    ));
\`\`\`

---

### 6. shift_requests（シフト希望）

\`\`\`sql
CREATE TABLE shift_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    request_date DATE NOT NULL,
    request_type TEXT NOT NULL CHECK (request_type IN ('available', 'unavailable', 'preferred_time')),
    preferred_start_time TIME,
    preferred_end_time TIME,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_shift_requests_organization_id ON shift_requests(organization_id);
CREATE INDEX idx_shift_requests_staff_id ON shift_requests(staff_id);
CREATE INDEX idx_shift_requests_shift_id ON shift_requests(shift_id);
CREATE INDEX idx_shift_requests_request_date ON shift_requests(request_date);
CREATE INDEX idx_shift_requests_status ON shift_requests(status);

-- RLS有効化
ALTER TABLE shift_requests ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 同じ組織のユーザーは希望を閲覧可能
CREATE POLICY "Users can view shift requests in their organization"
    ON shift_requests FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- RLSポリシー: スタッフは自分の希望を作成可能
CREATE POLICY "Staff can insert their own shift requests"
    ON shift_requests FOR INSERT
    WITH CHECK (staff_id IN (
        SELECT id FROM staff WHERE user_id = auth.uid()
    ));

-- RLSポリシー: スタッフは自分の希望を更新可能
CREATE POLICY "Staff can update their own shift requests"
    ON shift_requests FOR UPDATE
    USING (staff_id IN (
        SELECT id FROM staff WHERE user_id = auth.uid()
    ));

-- RLSポリシー: スタッフは自分の希望を削除可能
CREATE POLICY "Staff can delete their own shift requests"
    ON shift_requests FOR DELETE
    USING (staff_id IN (
        SELECT id FROM staff WHERE user_id = auth.uid()
    ));

-- RLSポリシー: 管理者は希望のステータスを更新可能
CREATE POLICY "Admins can update shift request status"
    ON shift_requests FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM users
        WHERE id = auth.uid() AND role = 'admin'
    ));
\`\`\`

---

## トリガー（updated_atの自動更新）

\`\`\`sql
-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガー適用
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
    BEFORE UPDATE ON shifts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shift_assignments_updated_at
    BEFORE UPDATE ON shift_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shift_requests_updated_at
    BEFORE UPDATE ON shift_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
\`\`\`

---

## 初期データ

\`\`\`sql
-- サンプル組織（開発用）
INSERT INTO organizations (id, name) VALUES
    ('00000000-0000-0000-0000-000000000001', 'デモカフェ');

-- サンプル管理者ユーザー（Supabase Authで作成後、このテーブルに追加）
-- INSERT INTO users (id, organization_id, email, role, full_name) VALUES
--     ('user-uuid-from-auth', '00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin', '管理者 太郎');
\`\`\`

---

## マイグレーション戦略

### Supabase Migration Files

1. **初期スキーマ作成**: `supabase/migrations/00001_initial_schema.sql`
2. **RLSポリシー**: `supabase/migrations/00002_rls_policies.sql`
3. **トリガー**: `supabase/migrations/00003_triggers.sql`
4. **初期データ**: `supabase/migrations/00004_seed_data.sql`

### ローカル開発
\`\`\`bash
# Supabase CLI使用
supabase init
supabase start
supabase db reset
\`\`\`

### 本番デプロイ
\`\`\`bash
supabase link --project-ref <project-id>
supabase db push
\`\`\`

---

## クエリパフォーマンス最適化

### 1. インデックス戦略
- **外部キー**: すべての外部キーにインデックス作成済み
- **複合インデックス**:
  - `shifts(organization_id, shift_date)` - 組織別の日付範囲検索
  - `users(email, organization_id)` - ログイン検索
- **ユニークインデックス**:
  - `staff(staff_code, organization_id)` - スタッフコードの一意性保証

### 2. よく使うクエリ

#### スタッフの今月のシフト取得
\`\`\`sql
SELECT
    s.shift_date,
    s.start_time,
    s.end_time,
    sa.start_time AS assignment_start,
    sa.end_time AS assignment_end
FROM shift_assignments sa
JOIN shifts s ON sa.shift_id = s.id
WHERE sa.staff_id = $1
    AND s.shift_date BETWEEN $2 AND $3
    AND s.status = 'published'
ORDER BY s.shift_date, s.start_time;
\`\`\`

#### 管理者用: 特定日のシフトとアサイン一覧
\`\`\`sql
SELECT
    s.id,
    s.shift_date,
    s.start_time,
    s.end_time,
    s.required_staff,
    json_agg(
        json_build_object(
            'staff_id', st.id,
            'staff_name', st.full_name,
            'start_time', sa.start_time,
            'end_time', sa.end_time
        )
    ) FILTER (WHERE st.id IS NOT NULL) AS assignments
FROM shifts s
LEFT JOIN shift_assignments sa ON s.id = sa.shift_id
LEFT JOIN staff st ON sa.staff_id = st.id
WHERE s.organization_id = $1
    AND s.shift_date BETWEEN $2 AND $3
GROUP BY s.id
ORDER BY s.shift_date, s.start_time;
\`\`\`

#### スタッフのシフト希望一覧
\`\`\`sql
SELECT
    sr.id,
    sr.request_date,
    sr.request_type,
    sr.preferred_start_time,
    sr.preferred_end_time,
    sr.notes,
    sr.status,
    st.full_name AS staff_name
FROM shift_requests sr
JOIN staff st ON sr.staff_id = st.id
WHERE sr.organization_id = $1
    AND sr.request_date BETWEEN $2 AND $3
ORDER BY sr.request_date, st.full_name;
\`\`\`

---

## セキュリティ考慮事項

### 1. Row Level Security (RLS)
- すべてのテーブルでRLS有効化
- 組織IDベースのアクセス制御
- ロール（admin/staff）による操作制限

### 2. QRトークンのセキュリティ
- UUIDv4使用で推測困難
- トークンは一度のみ使用（初回ログイン後は通常認証）
- 必要に応じてトークンの有効期限設定（将来）

### 3. 認証フロー
- 管理者: Supabase Auth（メール/パスワード）
- スタッフ: QRトークン → セッション作成

---

## スケーラビリティ

### データ量の想定
- 組織数: 1,000（1年後）
- 組織あたりスタッフ数: 平均20名
- 総スタッフ数: 20,000名
- 月あたりシフト数: 組織あたり100件
- 年間シフト数: 1,200,000件

### パフォーマンス目標
- シフト取得クエリ: < 100ms
- シフト作成: < 200ms
- 複雑な集計クエリ: < 500ms

### 将来的な最適化
1. **パーティショニング**: shift_dateでのパーティション分割
2. **マテリアライズドビュー**: 集計データのキャッシュ
3. **キャッシング**: Redis追加（Vercel KV）
4. **読み取りレプリカ**: Supabase Pro以上

---

## TypeScript型定義生成

Supabaseから自動生成:
\`\`\`bash
npx supabase gen types typescript --project-id <project-id> > types/database.ts
\`\`\`

生成される型の例:
\`\`\`typescript
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      // ... 他のテーブル
    }
  }
}
\`\`\`

---

## まとめ

このデータベース設計は以下の特徴を持つ:
1. **シンプル**: 必要最小限のテーブル構成
2. **セキュア**: RLSによる堅牢なアクセス制御
3. **スケーラブル**: インデックス最適化、将来の拡張を考慮
4. **型安全**: TypeScript型定義の自動生成対応

次フェーズ（実装）でこのスキーマをSupabaseに適用し、アプリケーションから利用します。
