// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ① 型定義（データルールの設定）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// PrismaのCategoryデータの型を定義しておきます
// カテゴリーというデータは、こういう形という設計図（型）を定義
type Category = {
  id: number
  categoryName: string
}

// 編集用の「初期データ」の設計図
type InitialData = {
    id: number
    categoryId: number
    foodName: string
    quantity: number
    expirationDate: string
    memo: string
}

// 外から「カテゴリ一覧」と「送信時の処理」を受け取る設定にします
type Props = {
  // 定義した Category の設計図に沿ったデータの配列（[]＝リストのこと）を渡してね」という意味
  // プルダウンのために
  categories: Category[]
  
  // 「フォームを送信したときに実行する関数を渡してね」という意味
  // void（ボイド）は「空っぽ」という意味で、「この関数は保存処理をするだけで、画面に何かデータを返すわけではない」
  formAction: (formData: FormData) => void
  
  // initialData （「?」をつけることで、「新規登録のときは渡さなくてもOK」というルール）
  initialData?: InitialData
}


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ② メインコンポーネント（フォームの描画）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
export default function StockForm({ categories, formAction, initialData }: Props) {
  
  // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
  // ③ 画面の表示（HTML / UI部分）
  // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
  return (
    <form action={formAction} className="ml-2 w-[97%]">

        {/* initialData が存在している（＝編集画面である）とき「だけ」、裏側でこっそり在庫IDを送信します */}
        {initialData && (
            <input type="hidden" name="id" value={initialData.id} />
        )}
        
        {/* カテゴリ入力欄を囲む箱 */}
        <div className="mt-5">
          {/* 入力欄の横に表示する文字（ラベル） */}
          <label className="font-bold">カテゴリ-:</label>
          {/* 選択式（プルダウン）の入力部品です。必須（required）とし、選択された値は categoryId という名前で裏側に送られます。 */}
          <select className="mb-3 p-2 w-full border rounded-md" name="categoryId" defaultValue={initialData?.categoryId || ""} required>
            {/* プルダウンの一番上に表示される未選択状態の項目です。値（value）を空にすることで、これを選んだまま送信できないようにします */}
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
          <label className="font-bold">食材名:</label>
          {/* 食材名を入力する文字専用（type="text"）の入力欄 */}
          <input className="mb-3 p-1 w-full border rounded-md" type="text" name="foodName" defaultValue={initialData?.foodName || ""} required />
        </div>

        {/* 数量入力欄を囲む箱 */}
        <div>
          <label className="font-bold">数量:</label>
          {/* 数量を入力する数字欄です。初期値を1、入力できる最小値を1に設定 */}
          <input className="mb-3 p-1 w-full border rounded-md" type="number" name="quantity" defaultValue={initialData?.quantity || 1} min="1" required />
        </div>

        <div>
          <label className="font-bold">消費期限（任意）:</label>
          {/* 消費期限入力（任意） */}
          <input className="mb-3 w-full p-1 border rounded-md" type="date" name="expirationDate" defaultValue={initialData?.expirationDate || ""}/>
        </div>

        <div>
          <label className="font-bold">メモ欄（任意）:</label>
          {/* メモ欄入力（任意） */}
          <input className="mb-3 w-full p-1 border rounded-md" type="text" name="memo" defaultValue={initialData?.memo || ""} />
        </div>

        {/* initialDataの有無で、ボタンの文字を「更新」か「保存」に自動で切り替えます */}
        <button  className="mb-3 w-full p-1 text-5xl bg-green-400 font-bold border rounded-md mt-10" type="submit">{initialData ? "更新する" : "保存する"}</button>
        
    </form>
  )
}