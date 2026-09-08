
import { prisma } from '@/lib/prisma'
// データベースに保存するための関数
import { addStock } from '../actions'

//在庫登録画面を表示するメイン関数を定義
export default async function NewStockPage() {
  const categories = await prisma.category.findMany()
  return (
    // 画面全体を囲む箱
    <div>
        {/* 画面のタイトルを見出しとして表示 */}
      <h2>在庫の登録</h2>
      {/* 入力フォームの枠組みです。送信ボタンが押された時、読み込んでおいた addStock 関数を自動的に実行 */}
      <form action={addStock}>
        {/* カテゴリ入力欄を囲む箱 */}
        <div>
            {/* 入力欄の横に表示する文字（ラベル） */}
          <label>カテゴリ-:</label>
          {/* 選択式（プルダウン）の入力部品です。必須（required）とし、選択された値は categoryId という名前で裏側に送られます。 */}
          <select name="categoryId" required>
            {/* プルダウンの一番上に表示される未選択状態の項目です。値（value）を空にすることで、これを選んだまま送信できない */}
            <option value="">選択してください</option>
            {/* 取得したカテゴリデータを1件ずつループ処理 */}
            {categories.map((category) => (
              // 選択肢の1項目です。裏側に送信される実際のデータ（value）にはカテゴリIDを指定
              <option key={category.id} value={category.id}>
                {/* 画面上のプルダウンに表示される文字として、カテゴリ名を表示します。ユーザーは名前を見て選び、裏側ではIDが送信される仕組み */}
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
        {/* 食材名入力欄を囲む箱 */}
        <div>
          <label>食材名:</label>
          {/* 食材名を入力する文字専用（type="text"）の入力欄 */}
          <input type="text" name="foodName" required />
        </div>
        {/* 数量入力欄を囲む箱 */}
        <div>
          <label>数量:</label>
          {/* 数量を入力する数字欄です。初期値を1、入力できる最小値を1に設定 */}
          <input type="number" name="quantity" defaultValue="1" min="1" required />
        </div>
        <div>
          <label>消費期限（任意）:</label>
          {/* 消費期限入力（任意） */}
          <input type="date" name="expirationDate" />
        </div>
        <button type="submit">保存する</button>
      </form>
    </div>
  )
}