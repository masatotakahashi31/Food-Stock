"use client"

// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ① インポート（必要な部品の読み込み）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// 裏側（サーバー）でデータベースを更新するための自作関数を、別のファイルから読み込んで準備
import { quickAddShoppingItem } from '@/app/shopping/actions'


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ② 型定義（データルールの設定）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// このボタンが親（呼び出す側）から受け取るデータの「ルール（型）」を決めています。? がついている quantity は「渡されなくてもエラーにしないでね」という意味
type Props = {
    categoryId: number
    itemName: string
    quantity?: number // ?をつけることで、指定されなかった場合は勝手に 1 になります
}


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ③ メインコンポーネント（ボタンの描画と操作）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ボタン部品の本体です。親からデータを受け取りつつ、もし quantity が渡されなかった場合は、勝手に「1」をセット
export default function QuickAddButton({ categoryId, itemName, quantity = 1 }: Props) {
    
    // ----------------------------------------------------
    // アクション：ボタンが押された時の処理
    // ----------------------------------------------------
    const handleQuickAdd = async () => {

        // さっき作った actions.ts の関数を呼び出してデータベース更新
        await quickAddShoppingItem(categoryId, itemName, quantity)
        
        // 追加完了のメッセージ
        alert(`${itemName} を買い物リストに追加しました！`)
    }


    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // ④ 画面の表示（HTML / UI部分）
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    return (
        <button 
            type="button"
            className="bg-gray-100 hover:bg-gray-300 rounded-full transition-colors"
            onClick={handleQuickAdd}
        >
            +🛒
        </button>
    )
}