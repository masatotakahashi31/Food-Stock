"use client"

// 1件分のお買い物データが「どんな形のデータか」というルール（型
type ShoppingItem = {
    id: number
    itemName: string
    quantity: number
    // カテゴリ情報は、さらにその中にデータを持つ構造
    category: {
        categoryName: string
    }
}

// 親（page.tsx）から受け取る荷物（Props）のルール
type Props = {
    // items」という名前で、さっき決めたルール（ShoppingItem）の「配列（[] = 複数個のリスト）」を受け取り
    items: ShoppingItem[]
}

// 親から渡された荷物の中から「items」だけを取り出し、さっき決めた Props のルールに従っていることを確認
export default function ShoppingList({items}: Props){
    // 買った！」ボタンが押された時に動く処理を作ります。押された行の id （数字）を受け取り
    const handlePurchase = (id: number) => {
        alert(`お買い物ID: ${id}を買ったことにする処理をこれから作成`)
    }

    const handleDelete = (id: number) => {
        alert(`お買い物ID: ${id}を削除する機能をこれから作成`)
    }

    return(
        <table>
            <thead>
                <tr>
                    <th>カテゴリ</th>
                    <th>品名</th>
                    <th>数量</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                {/* { } でJavaScriptの計算を始めます。「受け取ったデータの件数（length）が0件ですか？」と質問 */}
                {items.length === 0 ? (
                    // もし0件だった場合）データがない時用の行
                    <tr>
                        <td colSpan={4}>買うものは特にありません</td>
                    </tr>
                    // 1件以上データがあったら）以下を表示
                ) : (
                    // 受け取ったデータ（items）を1件ずつ取り出し（仮の名前を item とします）、データの件数分だけ、以下の行を繰り返し生成
                    items.map((item) => (
                        // keyが必要なので、データの id
                        <tr key={item.id}>
                            <td>{item.category.categoryName}</td>
                            <td>{item.itemName}</td>
                            <td>{item.quantity}</td>
                            <td>
                                <button onClick={() => handlePurchase(item.id)}>
                                    買った！
                                </button>
                                <button onClick={() => handleDelete(item.id)}>
                                    削除
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    )
}