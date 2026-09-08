// PrismaのCategoryデータの型を定義しておきます
//カテゴリーというデータは、こういう形という設計図（型）を定義
type Category = {
  id: number
  categoryName: string
}

// 外から「カテゴリ一覧」と「送信時の処理」を受け取る設定にします
type Props = {
    // 定義した Category の設計図に沿ったデータの配列（[]＝リストのこと）を渡してね」という意味
    // プルダウンのためにに
  categories: Category[]
//   「フォームを送信したときに実行する関数を渡してね」という意味
// 　　void（ボイド）は「空っぽ」という意味で、「この関数は保存処理をするだけで、画面に何かデータを返すわけではない
  formAction: (formData: FormData) => void
}

export default function StockForm({ categories, formAction }: Props) {
  return (
<form action={formAction}>
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
        <div>
          <label>メモ欄（任意）:</label>
          {/* メモ欄入力（任意） */}
          <input type="text" name="memo" />
        </div>
        <button type="submit">保存する</button>
      </form>
  )
}