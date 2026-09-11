import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ShoppingList from '@/components/ShoppingList'

export const dynamic = 'force-dynamic'

export default async function ShoppingPage() {
    // shopping テーブルから複数のデータを探し（findMany）、結果を shoppingItems という箱（変数）に入れます。await で「探し終わるまで待機」
    const shoppingItems = await prisma.shopping.findMany({
        // そのままではカテゴリIDしかわからないので、紐づくカテゴリの詳しい情報（名前など）も一緒に
        include: { category: true },
        // データの並び順です。作られた日時（createdAt）の降順（desc ＝ 新しい順）に並べ替えます。
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div>
            <div className="flex mt-10 mb-5 justify-between">
                <h2 className="ml-8 text-xl">お買い物リスト</h2>
                <Link 
                    className="px-8 mr-8 bg-green-300 hover:bg-green-500 rounded-md transition-colors" 
                    href="/shopping/new"
                >
                    + 買うものを追加
                </Link>
            </div>
            
            <ShoppingList items={shoppingItems} />
        </div>
    )
}