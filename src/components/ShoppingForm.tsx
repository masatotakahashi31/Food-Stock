// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ① 型定義（データルールの設定）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// カテゴリデータの設計図（型）を定義します
type Category = {
    id: number
    categoryName: string
}

// 外から受け取るデータ（Props）のルールを設定します
type Props = {
    // プルダウン表示用のカテゴリ一覧のデータ
    categories: Category[]
    // フォームを送信した時に実行される関数
    action: (formData: FormData) => void
    
    // 編集の時だけ渡される「最初のデータ」のルールを追加（?をつけると「無くてもOK」という意味）
    initialData?: {
        categoryId: number
        itemName: string
        quantity: number
    }
}


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ② メインコンポーネント（フォームの描画）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// 親から categories、action、initialData を受け取ってフォームを作ります
export default function ShoppingForm({categories, action, initialData}: Props) {

    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // ③ 画面の表示（HTML / UI部分）
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    return(
        <form action={action} className="ml-2 w-[97%]">
            
            {/* カテゴリ入力欄を囲む箱 */}
            <div className="mt-5">
                <label className="font-bold">カテゴリ:</label>
                {/* 選択式（プルダウン）の入力部品です。編集時は initialData の値を初期値にセットします */}
                <select 
                    className="mb-3 p-2 w-full border rounded-md" 
                    name="categoryId" 
                    defaultValue={initialData?.categoryId || ""} 
                    required 
                >
                    {/* 未選択状態の項目。valueを空にすることで、これを選んだままでは送信できないようにします */}
                    <option value="">選択してください</option>
                    
                    {/* 取得したカテゴリデータを1件ずつループ処理して選択肢を作ります */}
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            {/* 品名入力欄を囲む箱 */}
            <div>
                <label className="font-bold">品名:</label>
                {/* 文字入力欄です。編集時は元の品名を初期値にセットします */}
                <input 
                    className="mb-3 p-1 w-full border rounded-md" 
                    type="text" 
                    name="itemName" 
                    defaultValue={initialData?.itemName || ""} 
                    required 
                />
            </div>
            
            {/* 数量入力欄を囲む箱 */}
            <div>
                <label className="font-bold">数量:</label>
                {/* 数字入力欄です。新規登録時は「1」を、編集時は元の数量を初期値にします */}
                <input 
                    className="mb-3 p-1 w-full border rounded-md" 
                    type="number" 
                    name="quantity" 
                    defaultValue={initialData?.quantity || 1} 
                    min='1' 
                    required 
                />
            </div>

            {/* initialDataの有無（編集か新規追加か）で、ボタンの文字を自動で切り替えます */}
            <button 
                className="mb-3 w-full p-1 text-5xl bg-green-400 font-bold border rounded-md mt-10" 
                type="submit"
            >
                {initialData ? "更新する" : "追加する"}
            </button>

        </form>
    )
}