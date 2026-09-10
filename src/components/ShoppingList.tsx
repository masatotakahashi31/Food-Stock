"use client"

// 他のファイルから必要な部品を読み込んでいます。
import { deleteShoppingItem, toggleShoppingItem } from '@/app/shopping/actions'
// データベースをいじるための自作関数、下はReactの基本機能である「状態管理
import { useState, } from 'react'

// 「お買い物データ1件分」の中身のルール（型）を決めています。どんな名前の、どんな種類のデータが入っているかを定義
type ShoppingItem = {
    id: number
    itemName: string
    quantity: number
    isPurchased: boolean
    category: {
        categoryName: string
    }
}

// 親画面（page.tsx）から受け取るデータのルールです。「さっき決めた ShoppingItem のルールの配列（リスト）を items という名前で受け取る
type Props = {
    items: ShoppingItem[]
}

// 画面を作るメインの関数です。親から items を受け取ってスタート
export default function ShoppingList({ items }: Props) {

    // 親から貰ったデータを、手元のメモ帳（localItems）に書き写し
    const [localItems, setLocalItems] = useState(items)

    // チェックボックスを押した時の処理です。現在の状態（trueかfalse）を受け取り、! をつけて「逆」に
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

    // ▼ 削除ボタンの処理
    const handleDelete = async (id: number) => {
        // 押されたID「以外」のデータを残す（filter）
            const newItems = localItems.filter((item) => item.id !== id)
            setLocalItems(newItems)
            // その後にデータベースからも削除
            await deleteShoppingItem(id)
    }

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>状態</th>
                        <th>カテゴリ</th>
                        <th>品名</th>
                        <th>数量</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    {/* もしメモ帳が0件なら『空です』と表示し、そうでないなら以下を表示する」という条件分岐 */}
                    {localItems.length === 0 ? (
                        <tr>
                            <td colSpan={5}>お買い物リストは空です</td>
                        </tr>
                    ) : (
                        // メモ帳のデータを1件ずつ取り出し、表の行（<tr>）を作ります。Reactのルールで、行ごとに固有の目印（key）
                        localItems.map((item) => (
                            <tr key={item.id}>
                                <td>
                                <label style={{cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={item.isPurchased}
                                        onChange={() => handleToggle(item.id, item.isPurchased)}
                                        style={{marginRight: '8px', transform: 'scale(1.2'}}
                                    />
                                    {item.isPurchased ? "購入済み" : "未購入"}
                                </label></td>
                                <td>{item.category.categoryName}</td>
                                <td>{item.itemName}</td>
                                <td>{item.quantity}</td>
                                <td>
                                    <button onClick={() => handleDelete(item.id)}>削除</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}