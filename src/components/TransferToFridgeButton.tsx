"use client"

import { transferToFridge } from '@/app/shopping/actions'

type Props = {
    shoppingId: number
    isFood: boolean
    isPurchased: boolean
    onTransferComplete: () => void
}

export default function TransferToFridgeButton({ shoppingId, isFood, isPurchased, onTransferComplete }: Props) {
    
    // 非食品、またはまだ買っていない場合は「操作不可（true）」にする
    const isDisabled = !isFood || !isPurchased

    const handleTransfer = async () => {
        // ボタンが押せない状態なら何もしない（念のための二重ブロック）
        if (isDisabled) return 

        // さっき作った actions.ts の関数を呼び出してデータベース更新！
        await transferToFridge(shoppingId)
        
        // 親（ShoppingList）から渡された関数を実行して、画面から即座に消す！
        onTransferComplete()
    }

    return (
        <button 
            type="button"
            onClick={handleTransfer}
            disabled={isDisabled} // ★ ここでHTMLの機能を使ってボタンを完全に無効化します
            style={{
                padding: '4px 8px',
                // ★ 押せない時はグレー、押せる時は緑色（エメラルドグリーン）に変化させます
                backgroundColor: isDisabled ? '#d1d5db' : '#10b981', 
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                // ★ 押せない時はマウスカーソルの形を「禁止マーク（not-allowed）」に変えます
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                marginLeft: '10px'
            }}
        >
            冷蔵庫へ移行
        </button>
    )
}