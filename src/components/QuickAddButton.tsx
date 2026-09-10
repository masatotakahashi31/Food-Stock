"use client"

// 裏側（サーバー）でデータベースを更新するための自作関数を、別のファイルから読み込んで準備
import { quickAddShoppingItem } from '@/app/shopping/actions'

// このボタンが親（呼び出す側）から受け取るデータの「ルール（型）」を決めています。? がついている quantity は「渡されなくてもエラーにしないでね」という意味
type Props = {
    categoryId: number
    itemName: string
    quantity?: number // ?をつけることで、指定されなかった場合は勝手に 1 になります
}

// タン部品の本体です。親からデータを受け取りつつ、もし quantity が渡されなかった場合は、勝手に「1」をセット
export default function QuickAddButton({ categoryId, itemName, quantity = 1 }: Props) {
    
    // ボタンが押された時の処理
    const handleQuickAdd = async () => {

        // さっき作った actions.ts の関数を呼び出してデータベース更新
        await quickAddShoppingItem(categoryId, itemName, quantity)
        
        // 追加完了のメッセージ
        alert(`${itemName} を追加しました！`)
    }

    return (
        <button 
            type="button"
            onClick={handleQuickAdd}
        >
            + 買い物リストへ登録
        </button>
    )
}