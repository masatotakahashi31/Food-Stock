# データベース設計（02_design.md）

## 1. テーブル一覧
* **category (カテゴリマスタ):** 食品のカテゴリ（肉、野菜など）を管理するテーブルです。
* **food (食品マスタ):** 食品名とカテゴリを紐付けるテーブルです。
* **stock (在庫テーブル):** 現在の冷蔵庫の中身、消費期限などを管理するテーブルです。
* **shopping (お買い物リストテーブル):** 購入予定の全アイテムの名前、数量、購入状況を管理するテーブルです。

## 2. テーブル定義

### category (カテゴリマスタ)
| カラム名 | 論理名 | データ型 | 制約 |
| :--- | :--- | :--- | :--- |
| id | カテゴリーid | INTEGER | SERIAL NOT NULL PK |
| category_name | カテゴリ名 | VARCHAR(100) | NOT NULL UNIQUE |
| is_food | 食品か非食品か | BOOLEAN | NOT NULL |

### food (食品マスタ)
| カラム名 | 論理名 | データ型 | 制約 |
| :--- | :--- | :--- | :--- |
| id | 食品ID | INTEGER | SERIAL NOT NULL PK |
| food_name | 食品名 | VARCHAR(100) | NOT NULL |
| category_id | カテゴリーid | INTEGER | NOT NULL FK->category.id |

### stock (在庫テーブル)
| カラム名 | 論理名 | データ型 | 制約 |
| :--- | :--- | :--- | :--- |
| id | ストックid | INTEGER | SERIAL NOT NULL PK |
| food_id | 食品ID | INTEGER | NOT NULL FK->food.id |
| expiration_date | 消費期限 | DATE | |
| stock_quantity | 在庫数 | INTEGER | NOT NULL |
| purchase_date | 購入日 | DATE | NOT NULL |
| memo | メモ | VARCHAR(100) | |

### shopping (お買い物リストテーブル)
| カラム名 | 論理名 | データ型 | 制約 |
| :--- | :--- | :--- | :--- |
| id | ショッピングid | INTEGER | SERIAL NOT NULL PK |
| item_name | アイテム名 | VARCHAR(100) | NOT NULL |
| category_id | カテゴリーid | INTEGER | NOT NULL FK->category.id |
| quantity | 数 | INTEGER | NOT NULL |
| is_purchased | お買い物かご用 | BOOLEAN | NOT NULL DEFAULT FALSE |
| add_type | 追加種別の判別 | VARCHAR(20) | NOT NULL |
| created_at | リスト追加日時 | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP |

## 3. テーブル間リレーション
* **category -> food (1:多):** 1つのカテゴリに対して複数の食品が紐づきます。foodから親カテゴリの参照は必須です。
* **food -> stock (1:多):** 1つの食品（例：牛乳）に対して、購入日や期限が異なる複数の在庫（実体）が紐づきます。stockから親の参照は必須です。
* **category -> shopping (1:多):** 1つのカテゴリに対して複数の買い物アイテムが紐づきます。日用品混入を防ぐため親カテゴリの参照は必須です。



## 4. テーブル作成文
```sql
-- カテゴリマスタ
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    is_food BOOLEAN NOT NULL
);

-- 食品マスタ
CREATE TABLE food (
    id SERIAL PRIMARY KEY,
    food_name VARCHAR(100) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES category(id)
);

-- 冷蔵庫在庫
CREATE TABLE stock (
    id SERIAL PRIMARY KEY,
    food_id INTEGER NOT NULL REFERENCES food(id),
    expiration_date DATE,
    stock_quantity INTEGER NOT NULL,
    purchase_date DATE NOT NULL,
    memo VARCHAR(100)
);

-- 買い物リスト
CREATE TABLE shopping (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES category(id),
    quantity INTEGER NOT NULL,
    is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
    add_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 6. ディレクトリ・ファイル構成（予定）
フロントエンドとバックエンド（Server Actions）の境界を明確にするため、以下の構成とする。

```text
src/
├── app/                       (ページとURLルーティングの設定)
│   ├── layout.tsx             (共通枠：ヘッダーやタブ切替)
│   ├── page.tsx               (アクセス時に /fridge へ飛ばす処理)
│   │
│   ├── fridge/                (冷蔵庫機能のURL：/fridge)
│   │   ├── page.tsx           (① 在庫一覧画面)
│   │   ├── actions.ts         (④ 削除やワンタップ追加などのDB処理まとめ)
│   │   ├── new/
│   │   │   └── page.tsx       (② 在庫登録画面)
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx   (③ 在庫編集画面)
│   │
│   └── shopping/              (お買い物機能のURL：/shopping)
│       ├── page.tsx           (⑤ お買い物一覧画面)
│       ├── actions.ts         (⑧ 削除や一括移行などのDB処理まとめ)
│       ├── new/
│       │   └── page.tsx       (⑥ お買い物登録画面)
│       └── [id]/
│           └── edit/
│               └── page.tsx   (⑦ お買い物編集画面)
│
└── components/                (画面の部品置き場：クライアントコンポーネント)
    ├── StockForm.tsx          (在庫の入力フォーム：②と③で使い回す)
    ├── ShoppingForm.tsx       (お買い物の入力フォーム：⑥と⑦で使い回す)
    ├── DeleteButton.tsx       (クリックで削除を実行する汎用ボタン部品)
    ├── QuickAddButton.tsx     (在庫からお買い物リストへワンタップ追加するボタン)
    └── BulkTransferButton.tsx (購入済みの食材を一括で冷蔵庫へ移行するボタン)


