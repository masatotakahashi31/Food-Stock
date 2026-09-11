import Link from 'next/link'
import {prisma} from '@/lib/prisma'
import {addShoppingItem} from '../actions'
import ShoppingForm from '@/components/ShoppingForm'

export default async function NewShoppingPage(){
    const categories = await prisma.category.findMany()

    return(
        <div className="mt-10 mb-5">
            <h2 className="ml-8 text-xl">買うものを追加</h2>

            <ShoppingForm
                categories={categories}
                action={addShoppingItem}
            />

            <br />

            <div>
                <Link href="/shopping">
                    ←戻る
                </Link>
            </div>
        </div>
    )
}