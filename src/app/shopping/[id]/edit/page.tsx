// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ① インポート（必要な部品の読み込み）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
import { prisma } from '@/lib/prisma'
import { editShoppingItem } from '@/app/shopping/actions'
import Link from 'next/link'
import ShoppingForm from '@/components/ShoppingForm'


// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// ② メインコンポーネント（データの取得と準備）
// ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
// 編集画面を作るメインの関数です。最新のルールに合わせて、URL（例: /shopping/5/edit）に入っている 5 という文字を、「Promise（あとで届く小包）」という形で受け取ります
export default async function EditShoppingPage({params}: {params: Promise<{id: string}>}) {
    
    // 小包（params）が届くのを await でしっかり待ち、中身を開けて resolvedParams という箱に入れます
    const resolvedParams = await params
    
    // URLから取り出したIDはただの「文字（String）」なので、データベースで探せるように「数字（Number）」に変換します
    const id = Number(resolvedParams.id)

    // 変換した数字（ID）を使って、データベースから「そのIDと一致するお買い物データ（1件）」を探してきて、item に入れています
    const item = await prisma.shopping.findUnique({
        where: {id: id}
    })
    
    // フォームの「カテゴリ選択肢」を作るために、データベースからすべてのカテゴリをごっそり取得して categories に入れています
    const categories = await prisma.category.findMany()

    // もし存在しないID（例: /shopping/9999/edit）を直接入力された場合、エラーで画面が真っ白にならないよう、「見つかりません」という文字だけを返して処理をストップします
    if(!item) {
        return <div>データが見つかりません</div>
    }

    // ----------------------------------------------------
    // アクション：送信時の裏側処理の準備
    // ----------------------------------------------------
    // bind というのは、「関数に最初から値をくっつけておく」というJavaScriptの技です。
    // フォームの送信ボタンを押した時に「どのデータを更新すればいいのか（ID）」が裏側に伝わるよう
    // editShoppingItem 関数に「このIDを更新してね！」という付箋をペタッと貼って、updateAction という新しい名前で準備します
    const updateAction = editShoppingItem.bind(null, id)


    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    // ③ 画面の表示（HTML / UI部分）
    // ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝
    return(
        <div>
            <h2>買うものの編集</h2>

            {/* 呼び出した ShoppingForm コンポーネントを配置します。 */}
            {/* 選択肢を作るための categories と、先ほど付箋を貼った更新用関数 updateAction を、フォームに渡してあげています */}
            <ShoppingForm
                categories={categories}
                action={updateAction}
                // ここが「最初から入力されている状態」を作る部分です。
                // データベースから取ってきた item の中身（カテゴリID、品名、数量）を、initialData（初期値）としてフォームに渡しています
                initialData={{
                    categoryId: item.categoryId,
                    itemName: item.itemName,
                    quantity: item.quantity
                }}
            />

            <br />
            <Link href="/shopping">キャンセル</Link>
        </div>
    )
}