"use client"

// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ① インポート（必要な部品の読み込み）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// データベースをいじるための自作関数（サーバー側で動く処理）
import { deleteShoppingItem, toggleShoppingItem } from '@/app/shopping/actions'
// Reactの基本機能である「状態管理（画面のデータを記憶して書き換える機能）」
import { useState } from 'react'
// 画面遷移のためのリンク部品
import Link from 'next/link'
// さっき作った「冷蔵庫へ移行」ボタンの部品
import TransferToFridgeButton from './TransferToFridgeButton'


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ② 型定義（データルールの設定）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// 「お買い物データ1件分」の中身のルール（型）を決めています。どんな名前の、どんな種類のデータが入っているかを定義
type ShoppingItem = {
    id: number
    itemName: string
    quantity: number
    isPurchased: boolean
    category: {
        categoryName: string
        isFood: boolean
    }
}

// 親画面（page.tsx）から受け取るデータのルールです。「さっき決めた ShoppingItem のルールの配列（リスト）を items という名前で受け取る
type Props = {
    items: ShoppingItem[]
}


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ③ メインコンポーネント（画面の描画と操作）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// 画面を作るメインの関数です。親から items を受け取ってスタート
export default function ShoppingList({ items }: Props) {

    // 親から貰ったデータを、手元のメモ帳（localItems）に書き写し
    // ※ 画面をサクサク動かすため、データベースを待たずにまずは手元のメモ帳を書き換えます（オプティミスティックUIアップデートと呼びます）
    const [localItems, setLocalItems] = useState(items)

    // ----------------------------------------------------
    // アクション：チェックボックスを押した時の処理
    // ----------------------------------------------------
    // 現在の状態（trueかfalse）を受け取り、! をつけて「逆」に
    const handleToggle = async (id: number, currentStatus: boolean) => {
        const nextStatus = !currentStatus

        // メモ帳を1行ずつ確認（map）して、押されたIDと同じ行だけ新しい状態（nextStatus）に上書きし、画面を即座に切り替え
        const newItems = localItems.map((item) => {
            if (item.id === id) {
                return {...item, isPurchased: nextStatus}
            }else {
                return item
            }
        })
        setLocalItems(newItems)

        // （サーバー）に通信して、実際のデータベースも同じ状態に書き換え
        await toggleShoppingItem(id, nextStatus)
    }

    // ----------------------------------------------------
    // アクション：削除ボタンを押した時の処理
    // ----------------------------------------------------
    const handleDelete = async (id: number) => {
        // 押されたID「以外」のデータを残す（filter）ことで、画面から即座に消す
        const newItems = localItems.filter((item) => item.id !== id)
        setLocalItems(newItems)
        
        // その後にデータベースからも削除
        await deleteShoppingItem(id)
    }

    // ----------------------------------------------------
    // アクション：冷蔵庫への移行が完了した時の処理
    // ----------------------------------------------------
    const handleTransferComplete = (id: number) => {
        // 移行されたアイテム「以外」を残してメモ帳を上書きする（画面から即座に消える！）
        const newItems = localItems.filter((item) => item.id !== id)
        setLocalItems(newItems)
    }


    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // ④ 画面の表示（HTML / UI部分）
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    return (
        <div>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="p-2 w-4/12">品名</th>
                        <th className="p-2 w-2/12">カテゴリー</th>
                        <th className="p-2 w-1/12">数量</th>
                        <th className="p-2 w-3/12">状態</th>
                        <th className="p-2 w-2/12">操作</th>
                    </tr>
                </thead>
                <tbody>
                    {/* もしメモ帳が0件なら『空です』と表示し、そうでないなら以下を表示する」という条件分岐 */}
                    {localItems.length === 0 ? (
                        <tr>
                            <td colSpan={5}>お買い物リストは空です</td>
                        </tr>
                    ) : (
                        // メモ帳のデータを1件ずつ取り出し、表の行（<tr>）を作ります。Reactのルールで、行ごとに固有の目印（key）を設定します
                        localItems.map((item) => (
                            <tr key={item.id} className="border-b">
                                <td className="p-4 font-bold">{item.itemName}</td>
                                <td className="p-4">{item.category.categoryName}</td>
                                <td className="p-4">{item.quantity}</td>
                                <td className="p-4">
                                <label style={{cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={item.isPurchased}
                                        onChange={() => handleToggle(item.id, item.isPurchased)}
                                    />
                                    {item.isPurchased ? "購入済み" : "未購入"}
                                </label></td>
                                
                                <td className="p-2">
                                    <div className="flex gap-2 items-center">
                                    <Link  
                                        href={`/shopping/${item.id}/edit`}
                                        className="text-blue-500 bg-blue-200 hover:underline w-15 text-center py-2 rounded"
                                    >
                                        編集
                                    </Link>
                                    <button 
                                        className="text-red-500 bg-red-200 hover:underline w-15 text-center py-2 rounded" 
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        削除
                                    </button>
                                    
                                    {/* さっき作った移行ボタン部品をここで呼び出しています */}
                                    <TransferToFridgeButton 
                                        shoppingId={item.id} 
                                        isFood={item.category.isFood} 
                                        isPurchased={item.isPurchased} 
                                        onTransferComplete={() => handleTransferComplete(item.id)}
                                    />
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}