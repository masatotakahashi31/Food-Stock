// データベースを操作するためのPrismaクライアントを読み込み
import {prisma} from '@/lib/prisma'
// データベースを上書き保存する関数（サーバーアクション）を読み込み
import {updateStock} from '@/app/fridge/actions'
// 登録画面と編集画面で使い回すために作った「入力フォーム」の部品を読み込み
import StockForm from '@/components/StockForm'
// 画面を切り替える（遷移する）ためのNext.js専用リンク機能を読み込み
import Link from 'next/link'

// この画面（コンポーネント）が外部から受け取るデータ（Props）のルール（型）を定義
type Props = {
    // URLの「/fridge/〇〇/edit」の〇〇の部分を、文字列（string）の「id」として受け取るというルール
    params: {id: string}
}

// 編集画面を表示するためのメインの関数です。データベースと通信するため「async（非同期）」をつける
export default async function EditStockPage({params}: Props){
    // 最新のNext.jsのルールに従い、URLのパラメータ（params）の準備ができるまで「待機（await）」して変数に入れます
    const resolvedParams = await params

    // 準備ができたパラメータの中から「id」を取り出し、数値(Number)に変換して変数 stockId に入れます
    const stockId = Number(resolvedParams.id)

    // データベースから、このIDを持つ在庫データを1件だけ（findUnique）探してきます
    const stock = await prisma.stock.findUnique({
        // 探す条件：在庫のidが、さっきURLから取ってきた stockId と同じであること
        where: {id:stockId},
        // 在庫データだけでなく、それに紐づく食品データ（food）も一緒に取ってくる（include）という指示
        include: {food: true}
    })

    // もしURLのIDが間違っているなどして、データが見つからなかった場合の分岐
    if(!stock) return <div>データが見つかりません。</div>

    // データベースから取ってきた消費期限（Date型）を、画面のカレンダー入力欄で使える形に直す処理
    const formattedExpirationDate = stock.expirationDate
    // もし消費期限があれば、「2026-09-09T00:00:00」のような文字から「T」で区切って前の部分（2026-09-09）だけを取り出し
        ? stock.expirationDate.toISOString().split('T')[0]
        // もし消費期限が未入力（null）だったら、空文字（''）
        : ''

        // フォームの「カテゴリ選択プルダウン」を作るために、データベースから全カテゴリのデータを取得
    const categories = await prisma.category.findMany()

    // 画面に表示するフォーム部品（StockForm）に渡すための、「初期データのセット」を作成
    const initialData = {
        // 在庫のID
        id: stock.id,
        // 紐づく食品のカテゴリID
        categoryId: stock.food.categoryId,
        // 紐づく食品の名前
        foodName: stock.food.foodName,
        // 在庫の数量
        quantity: stock.stockQuantity,
        // 「YYYY-MM-DD」の形に整えた消費期限
        expirationDate: formattedExpirationDate,
        // メモ（もしnullなら空文字にする || "" をつけています）
        memo: stock.memo || ""
    }

    // 実際にブラウザに表示するHTML
    return(
        <div>
            {/* 取ってきたデータを使って、画面の一番上に「〇〇の編集」という見出しを表示 */}
            <h2>「{stock.food.foodName}」の編集</h2>

            {/* 読み込んでおいた入力フォーム部品（StockForm）をここに配置します */}
            <StockForm
            // プルダウン用の全カテゴリデータを渡します
                categories={categories}
                // 保存ボタンを押した時に実行する関数（updateStock）
                formAction={updateStock}
                // 「今の状態」が詰まった初期データを渡します（これで最初から入力された状態
                initialData={initialData}
            />

            <div style={{marginTop: '20px'}}>
                <Link href="/fridge">一覧に戻る</Link>
            </div>
        </div>
    )
}