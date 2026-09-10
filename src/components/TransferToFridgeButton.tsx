"use client"

// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ① インポート（必要な部品の読み込み）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// 裏側（サーバー）でデータベースを更新するための自作関数を読み込み
import { transferToFridge } from '@/app/shopping/actions'


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ② 型定義（データルールの設定）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// このボタンが親（ShoppingList）から受け取るデータの「ルール（型）」を定義
type Props = {
    shoppingId: number // 移行対象のお買い物データのID
    isFood: boolean    // 食品かどうかの判定フラグ
    isPurchased: boolean // 購入済みかどうかの判定フラグ
    onTransferComplete: () => void // 移行完了後に画面から即座に消すための関数（親から受け取る）
}


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ③ メインコンポーネント（ボタンの描画と操作）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
export default function TransferToFridgeButton({ shoppingId, isFood, isPurchased, onTransferComplete }: Props) {

    // 非食品、またはまだ買っていない場合は「操作不可（true）」にする
    const isDisabled = !isFood || !isPurchased

    // ----------------------------------------------------
    // アクション：ボタンが押された時の処理
    // ----------------------------------------------------
    const handleTransfer = async () => {
        // ボタンが押せない状態なら何もしない（念のための二重ブロック）
        if (isDisabled) return 

        // さっき作った actions.ts の関数を呼び出してデータベース更新！
        await transferToFridge(shoppingId)

        // 親（ShoppingList）から渡された関数を実行して、画面から即座に消す！
        onTransferComplete()
    }


    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // ④ 画面の表示（HTML / UI部分）
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
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